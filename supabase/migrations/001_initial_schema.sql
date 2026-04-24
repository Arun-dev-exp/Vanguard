-- ============================================================
-- ScamGuard Database Schema — Supabase Migration
-- PRD-4: Real-Time Voice Call Intelligence
-- ============================================================

-- ── 1. Users table ──────────────────────────────────────────
-- Stores Telegram bot registrations (phone → chatId mapping)
CREATE TABLE IF NOT EXISTS users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number  TEXT NOT NULL UNIQUE,
  chat_id       BIGINT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT 'User',
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for phone lookups (hot path on every incoming call)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone_number);

-- ── 2. Calls table ──────────────────────────────────────────
-- Tracks both active and completed calls
CREATE TABLE IF NOT EXISTS calls (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_sid            TEXT NOT NULL UNIQUE,
  caller_number       TEXT NOT NULL,
  called_number       TEXT NOT NULL,
  user_name           TEXT NOT NULL DEFAULT 'Unknown',
  user_chat_id        BIGINT,
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'completed')),
  started_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  ended_at            TIMESTAMPTZ,
  duration_seconds    INTEGER,

  -- Risk assessment (updated mid-call)
  current_risk_level  TEXT DEFAULT 'LOW'
                      CHECK (current_risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  current_score       NUMERIC(4,2) DEFAULT 0.00,
  highest_alert_sent  INTEGER DEFAULT 0,
  alerts_sent         INTEGER DEFAULT 0,

  -- PRD-1 analysis results
  verdict             TEXT DEFAULT 'SAFE',
  scam_type           TEXT,
  campaign_id         TEXT,
  campaign_name       TEXT,
  flags               JSONB DEFAULT '{}',
  entities            JSONB DEFAULT '{}',

  -- Transcript buffer
  transcript_length   INTEGER DEFAULT 0,

  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for active call lookups (PRD-3 polls every 5s)
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls (status);

-- Index for history queries with filters
CREATE INDEX IF NOT EXISTS idx_calls_ended_at ON calls (ended_at DESC)
  WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_calls_scam_type ON calls (scam_type)
  WHERE status = 'completed';

-- ── 3. Auto-update timestamps ───────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_calls_updated_at
  BEFORE UPDATE ON calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Row-Level Security ───────────────────────────────────
-- Enable RLS on both tables (Supabase best practice)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by ScamGuard server)
-- Anon/authenticated roles get read-only on calls (for PRD-3 dashboard)
CREATE POLICY "Service role full access on users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on calls"
  ON calls
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- PRD-3 dashboard reads active/completed calls via anon key
CREATE POLICY "Anon can read calls"
  ON calls
  FOR SELECT
  TO anon
  USING (true);

-- ── 5. Demo fixture ─────────────────────────────────────────
-- Pre-register a test user for E2E demo scenario (PRD §10)
-- Uncomment and modify for your test Telegram chatId:
-- INSERT INTO users (phone_number, chat_id, name)
-- VALUES ('+919000000001', 123456789, 'Demo User')
-- ON CONFLICT (phone_number) DO NOTHING;
