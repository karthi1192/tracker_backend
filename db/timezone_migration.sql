-- Run this once to support per-user/region meeting times
ALTER TABLE user_config ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata';
