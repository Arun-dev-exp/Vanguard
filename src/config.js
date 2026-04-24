// ============================================================
// ScamGuard — Centralized Configuration
// Validates all required env vars at startup
// ============================================================

const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DEEPGRAM_API_KEY",
  "TELEGRAM_BOT_TOKEN",
  "PRD1_BASE_URL",
  "PRD2_BASE_URL",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0 && process.env.NODE_ENV !== "test") {
  console.error(
    `\n❌ Missing required environment variables:\n   ${missing.join("\n   ")}\n`
  );
  console.error("   Copy .env.example → .env and fill in the values.\n");
  process.exit(1);
}

const config = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // PRD-1 AI Engine
  prd1BaseUrl: process.env.PRD1_BASE_URL,

  // PRD-2 Risk Orchestrator
  prd2BaseUrl: process.env.PRD2_BASE_URL,
  prd2WsUrl: process.env.PRD2_WS_URL || "",

  // ScamGuard public URL (shared with PRD-3)
  publicUrl: process.env.SCAMGUARD_PUBLIC_URL || "http://localhost:3001",

  // Deepgram
  deepgramApiKey: process.env.DEEPGRAM_API_KEY,

  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,

  // Twilio (optional — only needed for outbound operations)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",

  // Transcript analysis threshold (words before triggering PRD-1)
  transcriptChunkSize: parseInt(process.env.TRANSCRIPT_CHUNK_SIZE || "40", 10),
};

export default config;
