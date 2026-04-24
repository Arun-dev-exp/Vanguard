-- ============================================================
-- PRD-2: Risk Orchestrator — Supabase Migration
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Enable UUID extension ──
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Entity Risk Registry ──
CREATE TABLE IF NOT EXISTS entity_risks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_value  TEXT NOT NULL,
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('UPI', 'URL', 'PHONE')),
  risk_score    REAL DEFAULT 0.0,
  report_count  INTEGER DEFAULT 0,
  campaigns     JSONB DEFAULT '[]'::jsonb,
  status        TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REPORTED', 'CLEARED')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index on entity_value for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_risks_entity_value
  ON entity_risks (entity_value);

-- Index on status for filtered queries
CREATE INDEX IF NOT EXISTS idx_entity_risks_status
  ON entity_risks (status);

-- ── Payment Check Log ──
CREATE TABLE IF NOT EXISTS payment_checks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         TEXT NOT NULL,
  upi_id          TEXT NOT NULL,
  amount          INTEGER NOT NULL,
  decision        TEXT NOT NULL CHECK (decision IN ('BLOCK', 'WARN', 'ALLOW')),
  risk_level      TEXT NOT NULL CHECK (risk_level IN ('HIGH', 'MEDIUM', 'LOW')),
  composite_score REAL NOT NULL,
  breakdown       JSONB DEFAULT '{}'::jsonb,
  fraud_context   JSONB DEFAULT NULL,
  checked_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rate limiting queries (user_id + checked_at)
CREATE INDEX IF NOT EXISTS idx_payment_checks_user_recent
  ON payment_checks (user_id, checked_at DESC);

-- Index for UPI lookup
CREATE INDEX IF NOT EXISTS idx_payment_checks_upi_id
  ON payment_checks (upi_id);

-- ── Auto-update updated_at trigger ──
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_entity_risks_updated_at
  BEFORE UPDATE ON entity_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security (optional, service_role bypasses) ──
ALTER TABLE entity_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_checks ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (server-side)
CREATE POLICY "Service role full access on entity_risks"
  ON entity_risks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on payment_checks"
  ON payment_checks FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Done! Now run:  npm run seed  to insert demo fixtures.
-- ============================================================
