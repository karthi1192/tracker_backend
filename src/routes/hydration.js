const express     = require("express");
const pool        = require("../db/pool");
const requireAuth = require("../middleware/requireAuth");
const router      = express.Router();

// GET /api/hydration?date=2026-06-26
router.get("/", requireAuth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date required" });
  const { rows } = await pool.query(
    `SELECT glasses FROM hydration_logs WHERE user_id=$1 AND date=$2`,
    [req.user.id, date]
  );
  res.json({ glasses: rows[0]?.glasses ?? 0 });
});

// POST /api/hydration/increment
router.post("/increment", requireAuth, async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "date required" });
  const { rows } = await pool.query(
    `INSERT INTO hydration_logs (user_id, date, glasses) VALUES ($1,$2,1)
     ON CONFLICT (user_id,date) DO UPDATE SET glasses = hydration_logs.glasses + 1
     RETURNING glasses`,
    [req.user.id, date]
  );
  res.json({ glasses: rows[0].glasses });
});

// PUT /api/hydration  — set exact count
router.put("/", requireAuth, async (req, res) => {
  const { date, glasses } = req.body;
  if (!date || glasses==null) return res.status(400).json({ error: "date and glasses required" });
  const { rows } = await pool.query(
    `INSERT INTO hydration_logs (user_id,date,glasses) VALUES ($1,$2,$3)
     ON CONFLICT (user_id,date) DO UPDATE SET glasses=$3 RETURNING glasses`,
    [req.user.id, date, glasses]
  );
  res.json({ glasses: rows[0].glasses });
});

module.exports = router;
