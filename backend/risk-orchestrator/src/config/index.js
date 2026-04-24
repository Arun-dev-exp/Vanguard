const dotenv = require('dotenv');
dotenv.config();

const config = {
  // ── Server ──
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // ── Supabase ──
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // ── PRD-1 AI Engine ──
  prd1BaseUrl: process.env.PRD1_BASE_URL || null,

  // ── Rate Limiting ──
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 10,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
  },

  // ── Cache ──
  cacheTtlMs: parseInt(process.env.CACHE_TTL_MS, 10) || 300_000,

  // ── CORS ──
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // ── Risk Thresholds ──
  risk: {
    highThreshold: 0.80,
    mediumThreshold: 0.50,
    weights: {
      ai: 0.5,
      campaign: 0.3,
      entity: 0.2,
    },
    escalation: {
      reportCountFloor: 10,       // report_count >= 10 → min MEDIUM
      highAmountThreshold: 10000, // amount > ₹10,000 + MEDIUM → HIGH
    },
  },
};

// ── Validation ──
if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  if (config.nodeEnv !== 'test') {
    console.warn(
      '⚠️  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.\n' +
      '   Copy .env.example → .env and fill in your Supabase credentials.\n' +
      '   Running in degraded mode (DB operations will fail).'
    );
  }
}

module.exports = config;
