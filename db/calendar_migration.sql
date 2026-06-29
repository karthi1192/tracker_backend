-- Run this once to enable Google Calendar sync
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token  TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

ALTER TABLE meetings ADD COLUMN IF NOT EXISTS google_event_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS meetings_user_google_event_idx
  ON meetings (user_id, google_event_id)
  WHERE google_event_id IS NOT NULL;
