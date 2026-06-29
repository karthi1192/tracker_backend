const express     = require("express");
const pool        = require("../db/pool");
const requireAuth = require("../middleware/requireAuth");
const router      = express.Router();

// GET /api/holidays?year=2026
router.get("/", requireAuth, async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const { rows } = await pool.query(
    `SELECT date, name FROM holidays WHERE EXTRACT(YEAR FROM date)=$1 ORDER BY date`,
    [year]
  );
  res.json(rows);
});

// POST /api/holidays
router.post("/", requireAuth, async (req, res) => {
  const { date, name } = req.body;
  if (!date || !name) return res.status(400).json({ error: "date and name required" });
  const { rows } = await pool.query(
    `INSERT INTO holidays (date,name) VALUES ($1,$2)
     ON CONFLICT (date) DO UPDATE SET name=$2 RETURNING *`,
    [date, name]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;
