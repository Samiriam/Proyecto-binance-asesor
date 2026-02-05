CREATE TABLE IF NOT EXISTS advisor_audit (
  id BIGSERIAL PRIMARY KEY,
  generated_at TIMESTAMPTZ NOT NULL,
  recommendation_type TEXT NOT NULL,
  asset TEXT NOT NULL,
  amount_suggested DOUBLE PRECISION NOT NULL,
  duration_days INT NOT NULL,
  reason TEXT NOT NULL,
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_advisor_audit_generated_at ON advisor_audit(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_advisor_audit_type ON advisor_audit(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_advisor_audit_asset ON advisor_audit(asset);

CREATE TABLE IF NOT EXISTS advisor_config (
  id INT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
