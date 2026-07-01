-- Run: psql -U postgres -c "CREATE DATABASE dhpl_db;"
-- Then: psql -U postgres -d dhpl_db -f db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id   TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'Employee',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Sessions (connect-pg-simple) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  sid     TEXT PRIMARY KEY,
  sess    JSON NOT NULL,
  expire  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions (expire);

-- ── Tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  priority         TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  date             DATE NOT NULL,
  elapsed_seconds  INT NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'not_started'
                   CHECK (status IN ('not_started','paused','completed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS tasks_user_date_idx ON tasks (user_id, date);

-- ── Meetings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  start_hour  SMALLINT NOT NULL,
  start_min   SMALLINT NOT NULL DEFAULT 0,
  end_hour    SMALLINT NOT NULL,
  end_min     SMALLINT NOT NULL DEFAULT 0,
  meet_link   TEXT,
  attendees   TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS meetings_date_idx ON meetings (date);

-- ── Hydration logs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hydration_logs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  glasses   INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

-- ── User config ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_config (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  work_start            TEXT NOT NULL DEFAULT '09:00',
  work_end              TEXT NOT NULL DEFAULT '17:30',
  week_off_days         INT[] NOT NULL DEFAULT '{0,6}',
  water_goal            INT NOT NULL DEFAULT 8,
  hydration_on_days_off BOOLEAN DEFAULT NULL,  -- null=never asked, true=yes, false=no
  timezone              TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
