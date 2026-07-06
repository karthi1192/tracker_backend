const https = require("https");
const crypto = require("crypto");
const pool  = require("../db/pool");

function httpsRequest(method, url, { headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const parsed  = new URL(url);
    const payload = body != null ? Buffer.from(body) : null;
    const options = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method,
      headers: payload ? { ...headers, "Content-Length": payload.length } : headers,
    };
    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} }); }
        catch (err) { reject(err); }
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const httpsGet  = (url, headers) => httpsRequest("GET", url, { headers });
const httpsPost = (url, body, headers) => httpsRequest("POST", url, { headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers }, body });

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type:    "refresh_token",
  }).toString();

  const { body: data } = await httpsPost("https://oauth2.googleapis.com/token", body);
  if (!data.access_token) throw new Error("Token refresh failed");
  return data.access_token;
}

// Runs a Google Calendar API call with the user's access token, refreshing and
// retrying once on 401 so callers don't need to duplicate that dance.
async function withGoogleAuth(userId, accessToken, refreshToken, makeRequest) {
  if (!accessToken) {
    const err = new Error("No Google Calendar access. Please sign out and sign in again.");
    err.status = 400;
    throw err;
  }

  let token  = accessToken;
  let result = await makeRequest(token);

  if (result.status === 401 && refreshToken) {
    token = await refreshAccessToken(refreshToken);
    await pool.query(`UPDATE users SET google_access_token=$1 WHERE id=$2`, [token, userId]);
    result = await makeRequest(token);
  }

  if (result.status === 403) {
    const err = new Error("Google Calendar permission missing. Please sign out and sign in again to grant calendar access.");
    err.status = 403;
    throw err;
  }
  if (result.status < 200 || result.status >= 300) {
    throw new Error(result.body?.error?.message || "Google Calendar API error");
  }
  return result.body;
}

async function fetchCalendarEvents(userId, accessToken, refreshToken) {
  const now           = new Date();
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  // Start of day 4 days ago — ensures Friday 00:00 is always included even on Monday afternoon
  const fromDate      = new Date(now);
  fromDate.setDate(fromDate.getDate() - 4);
  fromDate.setHours(0, 0, 0, 0);

  const params = new URLSearchParams({
    timeMin:      fromDate.toISOString(),
    timeMax:      twoWeeksLater.toISOString(),
    singleEvents: "true",
    orderBy:      "startTime",
    maxResults:   "100",
  }).toString();

  return withGoogleAuth(userId, accessToken, refreshToken, token =>
    httpsGet(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { Authorization: `Bearer ${token}` })
  );
}

// Creates a real event on the user's primary Google Calendar, optionally attaching
// a Google Meet link, so manually-created meetings aren't DB-only.
async function createCalendarEvent(userId, accessToken, refreshToken, { title, startDateTime, endDateTime, timeZone, attendeeEmails, withMeetLink }) {
  const event = {
    summary: title,
    start: { dateTime: startDateTime, timeZone },
    end:   { dateTime: endDateTime,   timeZone },
    attendees: attendeeEmails.map(email => ({ email })),
  };
  if (withMeetLink) {
    event.conferenceData = {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events${withMeetLink ? "?conferenceDataVersion=1" : ""}`;
  const body = JSON.stringify(event);

  return withGoogleAuth(userId, accessToken, refreshToken, token =>
    httpsRequest("POST", url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body,
    })
  );
}

module.exports = { fetchCalendarEvents, createCalendarEvent, refreshAccessToken };
