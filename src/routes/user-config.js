const express     = require("express");
const pool        = require("../db/pool");
const requireAuth = require("../middleware/requireAuth");
const router      = express.Router();

function isValidTimezone(tz) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// GET /api/user-config
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT work_start, work_end, week_off_days, water_goal, hydration_on_days_off, timezone
       FROM user_config WHERE user_id = $1`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "not found" });
    const r = rows[0];
    res.json({
      work_start:            r.work_start,
      work_end:              r.work_end,
      week_off_days:         r.week_off_days,
      water_goal:            r.water_goal,
      hydration_on_days_off: r.hydration_on_days_off,  // null | true | false
      timezone:              r.timezone,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user-config  (upsert)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { work_start, work_end, week_off_days, water_goal, hydration_on_days_off, timezone } = req.body;
    if (!work_start || !work_end || !Array.isArray(week_off_days) || !water_goal)
      return res.status(400).json({ error: "work_start, work_end, week_off_days, water_goal required" });
    if (timezone !== undefined && !isValidTimezone(timezone))
      return res.status(400).json({ error: "invalid timezone" });

    const { rows } = await pool.query(
      `INSERT INTO user_config (user_id, work_start, work_end, week_off_days, water_goal, hydration_on_days_off, timezone, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'Asia/Kolkata'), NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET work_start            = EXCLUDED.work_start,
             work_end              = EXCLUDED.work_end,
             week_off_days         = EXCLUDED.week_off_days,
             water_goal            = EXCLUDED.water_goal,
             hydration_on_days_off = EXCLUDED.hydration_on_days_off,
             timezone              = COALESCE($7, user_config.timezone),
             updated_at            = NOW()
       RETURNING work_start, work_end, week_off_days, water_goal, hydration_on_days_off, timezone`,
      [req.user.id, work_start, work_end, week_off_days, water_goal,
       hydration_on_days_off === undefined ? null : hydration_on_days_off,
       timezone || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
