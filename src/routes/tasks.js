const express     = require("express");
const pool        = require("../db/pool");
const requireAuth = require("../middleware/requireAuth");
const router      = express.Router();

// GET /api/tasks?date=2026-06-26
router.get("/", requireAuth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date required" });
  const { rows } = await pool.query(
    `SELECT id, title, priority, date, elapsed_seconds, status, scheduled_hour, scheduled_min, created_at
     FROM tasks WHERE user_id = $1 AND date = $2 ORDER BY created_at`,
    [req.user.id, date]
  );
  res.json(rows);
});

// POST /api/tasks
router.post("/", requireAuth, async (req, res) => {
  const { title, priority = "medium", date, scheduled_hour = null, scheduled_min = null } = req.body;
  if (!title || !date) return res.status(400).json({ error: "title and date required" });
  const { rows } = await pool.query(
    `INSERT INTO tasks (user_id, title, priority, date, scheduled_hour, scheduled_min) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, title, priority, date, scheduled_hour, scheduled_min]
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/tasks/:id
router.patch("/:id", requireAuth, async (req, res) => {
  const { elapsed_seconds, status } = req.body;
  const fields = [], vals = [];
  if (elapsed_seconds !== undefined) { fields.push(`elapsed_seconds=$${fields.length+1}`); vals.push(elapsed_seconds); }
  if (status !== undefined)          { fields.push(`status=$${fields.length+1}`);           vals.push(status); }
  if (!fields.length) return res.status(400).json({ error: "nothing to update" });
  vals.push(req.params.id, req.user.id);
  const { rows } = await pool.query(
    `UPDATE tasks SET ${fields.join(",")} WHERE id=$${vals.length-1} AND user_id=$${vals.length} RETURNING *`,
    vals
  );
  if (!rows.length) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

// DELETE /api/tasks/:id
router.delete("/:id", requireAuth, async (req, res) => {
  await pool.query(`DELETE FROM tasks WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
  res.json({ ok: true });
});

module.exports = router;
