const express     = require("express");
const pool        = require("../db/pool");
const requireAuth = require("../middleware/requireAuth");
const { fetchCalendarEvents } = require("../services/googleCalendar");
const router      = express.Router();

const DEFAULT_TIMEZONE = "Asia/Kolkata";

// getHours()/getMinutes() read the server process's local timezone, which is IST on
// localhost but UTC on Render — same instant, different displayed time. Extract the
// wall-clock hour/minute in a fixed timezone instead so both environments agree.
function getHourMinuteInTimezone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find(p => p.type === "hour").value) % 24;
  const minute = Number(parts.find(p => p.type === "minute").value);
  return { hour, minute };
}

function getDateInTimezone(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date); // en-CA -> YYYY-MM-DD
}

// GET /api/calendar/sync
router.get("/sync", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT google_access_token, google_refresh_token FROM users WHERE id=$1`,
      [req.user.id]
    );
    const { google_access_token: accessToken, google_refresh_token: refreshToken } = rows[0] || {};

    const { rows: configRows } = await pool.query(
      `SELECT timezone FROM user_config WHERE user_id=$1`,
      [req.user.id]
    );
    const timezone = configRows[0]?.timezone || DEFAULT_TIMEZONE;

    const data   = await fetchCalendarEvents(req.user.id, accessToken, refreshToken);
    const events = data.items || [];

    let synced = 0;
    for (const event of events) {
      if (!event.start?.dateTime) continue;

      const start     = new Date(event.start.dateTime);
      const end       = new Date(event.end?.dateTime || event.start.dateTime);
      const date      = getDateInTimezone(start, timezone);
      const { hour: startHour, minute: startMin } = getHourMinuteInTimezone(start, timezone);
      const { hour: endHour, minute: endMin }     = getHourMinuteInTimezone(end, timezone);

      const attendees = (event.attendees || [])
        .filter(a => !a.self)
        .map(a => a.displayName || a.email);

      const meetLink =
        event.hangoutLink ||
        event.conferenceData?.entryPoints?.find(e => e.entryPointType === "video")?.uri ||
        null;

      const existing = await pool.query(
        `SELECT id FROM meetings WHERE user_id=$1 AND google_event_id=$2`,
        [req.user.id, event.id]
      );
      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE meetings SET title=$1, date=$2, start_hour=$3, start_min=$4,
             end_hour=$5, end_min=$6, meet_link=$7, attendees=$8
           WHERE user_id=$9 AND google_event_id=$10`,
          [event.summary || "Untitled", date, startHour, startMin,
           endHour, endMin, meetLink, attendees, req.user.id, event.id]
        );
      } else {
        await pool.query(
          `INSERT INTO meetings
             (user_id, title, date, start_hour, start_min, end_hour, end_min, meet_link, attendees, google_event_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [req.user.id, event.summary || "Untitled", date,
           startHour, startMin, endHour, endMin, meetLink, attendees, event.id]
        );
      }
      synced++;
    }

    res.json({ synced, total: events.length });
  } catch (err) {
    console.error("Calendar sync error:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
