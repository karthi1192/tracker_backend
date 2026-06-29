const express     = require("express");
const pool        = require("../db/pool");
const requireAuth = require("../middleware/requireAuth");
const router      = express.Router();

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

// POST /api/meetings
router.post("/", requireAuth, async (req, res) => {
  const { title, date, start_hour, start_min=0, end_hour, end_min=0, meet_link=null, attendees=[] } = req.body;
  if (!title || !date || start_hour==null || end_hour==null)
    return res.status(400).json({ error: "title, date, start_hour, end_hour required" });
  const { rows } = await pool.query(
    `INSERT INTO meetings (user_id,title,date,start_hour,start_min,end_hour,end_min,meet_link,attendees)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [req.user.id, title, date, start_hour, start_min, end_hour, end_min, meet_link, attendees]
  );
  res.status(201).json(rows[0]);
});

// DELETE /api/meetings/:id
router.delete("/:id", requireAuth, async (req, res) => {
  await pool.query(`DELETE FROM meetings WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
  res.json({ ok: true });
});

module.exports = router;
