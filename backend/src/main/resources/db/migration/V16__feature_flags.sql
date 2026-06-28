-- Feature flags for showing/hiding UI features
CREATE TABLE IF NOT EXISTS feature_flags (
  id          BIGSERIAL PRIMARY KEY,
  feature_key VARCHAR(100) NOT NULL UNIQUE,
  enabled     BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed default flags
INSERT INTO feature_flags (feature_key, enabled, description) VALUES
  ('PRICING',      false, 'Show Pricing page and nav link (enable when payment gateway is live)'),
  ('MARKETPLACE',  true,  'Show Marketplace in nav and routes'),
  ('LIVE_CLASSES', true,  'Show Videos/Live Classes in nav'),
  ('COMMUNITY',    true,  'Show Community/Forum in nav'),
  ('PRACTICE_MODE',true,  'Allow students to use Practice Mode'),
  ('SEARCH',       true,  'Show search bar in navbar'),
  ('GAMIFICATION', true,  'Show streak and points on dashboard')
ON CONFLICT (feature_key) DO NOTHING;
