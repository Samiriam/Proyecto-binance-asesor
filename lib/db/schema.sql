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

-- Performance Tracker: snapshots de predicciones para validar aciertos
CREATE TABLE IF NOT EXISTS performance_snapshots (
  id BIGSERIAL PRIMARY KEY,
  audit_id BIGINT REFERENCES advisor_audit(id),
  asset TEXT NOT NULL,
  recommendation_type TEXT NOT NULL,
  price_at_recommendation DOUBLE PRECISION NOT NULL,
  price_after DOUBLE PRECISION,
  days_to_track INT NOT NULL DEFAULT 7,
  days_tracked INT DEFAULT 0,
  predicted_direction TEXT,
  actual_direction TEXT,
  predicted_change_pct DOUBLE PRECISION,
  actual_change_pct DOUBLE PRECISION,
  was_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  evaluated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_perf_snap_pending ON performance_snapshots(evaluated_at) WHERE evaluated_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_perf_snap_created ON performance_snapshots(created_at DESC);

-- Portfolio Snapshots: historial del portafolio para análisis de riesgo
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id BIGSERIAL PRIMARY KEY,
  total_value_usd DOUBLE PRECISION,
  stablecoin_pct DOUBLE PRECISION,
  volatile_pct DOUBLE PRECISION,
  risk_score DOUBLE PRECISION,
  diversification_score DOUBLE PRECISION,
  assets JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_snap_created ON portfolio_snapshots(created_at DESC);
