-- Sacrament Meeting Planner: database schema (Neon PostgreSQL).
-- Run once in Vercel → Storage → your database → Query, then run seed.sql.
-- Column names are snake_case; lib/meetings-db.ts aliases them to the camelCase
-- fields of the SacramentMeeting type in lib/types.ts.

CREATE TABLE IF NOT EXISTS meetings (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL UNIQUE,
  meeting_type   VARCHAR(20) NOT NULL
                 CHECK (meeting_type IN ('testimony', 'regular', 'stake', 'general', 'special')),
  presiding      VARCHAR(255) NOT NULL,
  conducting     VARCHAR(255) NOT NULL,
  announcements  TEXT[] DEFAULT '{}',
  opening_hymn   JSONB NOT NULL,          -- { "number": 2, "title": "The Spirit of God" }
  opening_prayer VARCHAR(255) NOT NULL,
  ward_business  JSONB DEFAULT '[]',      -- [{ "description": "..." }]
  stake_business BOOLEAN DEFAULT false,
  sacrament_hymn JSONB NOT NULL,
  speakers       JSONB DEFAULT '[]',      -- [{ "name": "...", "topic": "...", "type": "speaker" | "musical-number" }]
  closing_hymn   JSONB NOT NULL,
  closing_prayer VARCHAR(255) NOT NULL
);
