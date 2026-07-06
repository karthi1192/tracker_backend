const express     = require("express");
const pool        = require("../db/pool");
const requireAuth = require("../middleware/requireAuth");
const { createCalendarEvent } = require("../services/googleCalendar");
const router      = express.Router();

const DEFAULT_TIMEZONE = "Asia/Kolkata";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const p2 = n => String(n).padStart(2, "0");

// GET /api/meetings?date=2026-06-26  OR  ?from=DATE&to=DATE
router.get("/", requireAuth, async (req, res) => {
  const { from, to, date } = req.query;
  let query, params;
  if (date) {
    query  = `SELECT * FROM meetings WHERE user_id=$1 AND date=$2 ORDER BY start_hour,start_min`;
    params = [req.user.id, date];
  } else if (from && to) {
    query  = `SELECT * FROM meetings WHERE user_id=$1 AND date BETWEEN $2 AND $3 ORDER BY date,start_hour,start_min`;
    params = [req.user.id, from, to];
  } else {
    return res.status(400).json({ error: "provide date or from+to" });
  }
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// POST /api/meetings — creates a real event on the user's Google Calendar (with an
// optional Meet link), then mirrors the confirmed result into our own DB so it shows
// up immediately and future /api/calendar/sync runs update rather than duplicate it.
router.post("/", requireAuth, async (req, res) => {
  const { title, date, start_hour, start_min=0, end_hour, end_min=0, attendees=[], create_meet_link=false } = req.body;
  if (!title || !date || start_hour==null || end_hour==null)
    return res.status(400).json({ error: "title, date, start_hour, end_hour required" });

  try {
    const { rows: userRows } = await pool.query(
      `SELECT google_access_token, google_refresh_token FROM users WHERE id=$1`,
      [req.user.id]
    );
    const { google_access_token: accessToken, google_refresh_token: refreshToken } = userRows[0] || {};

    const { rows: configRows } = await pool.query(
      `SELECT timezone FROM user_config WHERE user_id=$1`,
      [req.user.id]
    );
    const timezone = configRows[0]?.timezone || DEFAULT_TIMEZONE;

    const event = await createCalendarEvent(req.user.id, accessToken, refreshToken, {
      title,
      startDateTime: `${date}T${p2(start_hour)}:${p2(start_min)}:00`,
      endDateTime:   `${date}T${p2(end_hour)}:${p2(end_min)}:00`,
      timeZone: timezone,
      attendeeEmails: attendees.filter(a => EMAIL_RE.test(a)),
      withMeetLink: !!create_meet_link,
    });

    const meetLink =
      event.hangoutLink ||
      event.conferenceData?.entryPoints?.find(e => e.entryPointType === "video")?.uri ||
      null;

    const { rows } = await pool.query(
      `INSERT INTO meetings (user_id,title,date,start_hour,start_min,end_hour,end_min,meet_link,attendees,google_event_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.user.id, title, date, start_hour, start_min, end_hour, end_min, meetLink, attendees, event.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create meeting error:", err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

// DELETE /api/meetings/:id
router.delete("/:id", requireAuth, async (req, res) => {
  await pool.query(`DELETE FROM meetings WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
  res.json({ ok: true });
});

module.exports = router;
