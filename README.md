# 🛡️ ScamGuard — Real-Time Voice Call Intelligence

**Project Vanguard | PRD-4**

ScamGuard is the **voice layer** of Project Vanguard. It monitors live phone calls in real time — transcribing audio via Deepgram, analyzing transcripts through the PRD-1 AI Engine, scoring risk via PRD-2, and alerting users mid-call via Telegram before any damage is done.

## Architecture

```
User's phone receives a call
        │
        ▼
Twilio intercepts audio → POST /incoming-call
        │
        ▼
WebSocket receives mulaw audio chunks
        │
        ▼
Deepgram streaming STT → live transcript
        │
        ▼  (every ~40 words)
POST /api/v1/analyze  ◄── PRD-1
        │
        ├──► UPI IDs found? → POST /payment/check ◄── PRD-2
        │
        ▼
Map risk level → Telegram alert
        │
        ├──► FRAUD? → POST /action/report ◄── PRD-2
        │
        ▼
Push events → ws://host/ws/calls ►── PRD-3 SOC Dashboard
```

## Quick Start

### 1. Prerequisites
- Node.js 20+
- Supabase project (for database)
- Deepgram API key (for speech-to-text)
- Telegram Bot token (for user alerts)
- Twilio account (for audio streaming)

### 2. Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your actual keys

# Apply database schema to Supabase
# Run supabase/migrations/001_initial_schema.sql in your Supabase SQL Editor
```

### 3. Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Docker
docker-compose up -d
```

### 4. Test

```bash
npm test
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check with uptime |
| `POST` | `/incoming-call` | Twilio webhook (returns TwiML) |
| `GET` | `/api/v1/calls/active` | All actively monitored calls |
| `GET` | `/api/v1/calls/history` | Completed calls with filters |
| `WS` | `/ws/calls` | Live call events for SOC Dashboard |
| `WS` | `/media-stream` | Twilio audio stream (internal) |

## WebSocket Events (`/ws/calls`)

| Event | When | Key Fields |
|-------|------|------------|
| `CALL_STARTED` | New call intercepted | `call_sid`, `caller_number`, `called_number` |
| `RISK_ESCALATED` | Risk level increased | `risk_level`, `composite_score`, `campaign_name` |
| `CALL_ENDED` | Call completed | `duration_seconds`, `final_risk_level` |

## Alert Levels

| Risk Level | Score | Telegram Alert | Action |
|------------|-------|----------------|--------|
| LOW | < 0.50 | None | Monitor only |
| MEDIUM | 0.50–0.79 | 🟡 Warning | Stay alert |
| HIGH | 0.80–0.84 | 🟠 High Alert | Don't share info |
| HIGH | ≥ 0.85 | 🔴 DANGER | Hang up now |

## Environment Variables

See [`.env.example`](.env.example) for the full list.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Server | Fastify (Node.js 20) |
| Database | Supabase (PostgreSQL) |
| Telephony | Twilio (audio stream) |
| Speech-to-text | Deepgram (nova-2, en-IN) |
| Fraud analysis | PRD-1 AI Engine |
| Risk scoring | PRD-2 Risk Orchestrator |
| User alerts | Telegram Bot API |
| Containerization | Docker |

## Project Structure

```
├── src/
│   ├── server.js          # Main Fastify server + orchestration
│   ├── config.js          # Environment config with validation
│   ├── db.js              # Supabase client
│   ├── analyzer.js        # PRD-1 integration
│   ├── risk-mapper.js     # Risk level → alert severity
│   ├── telegram.js        # Telegram bot + enriched alerts
│   ├── deepgram.js        # Deepgram streaming STT
│   ├── call-manager.js    # Call lifecycle (Supabase)
│   ├── user-store.js      # User registration (Supabase)
│   └── ws-broadcaster.js  # WebSocket for PRD-3
├── routes/
│   ├── incoming-call.js   # Twilio webhook
│   ├── calls.js           # Active + history APIs
│   └── health.js          # Health check
├── supabase/
│   └── migrations/        # Database schema
├── test/                  # Unit + integration tests
├── Dockerfile
├── docker-compose.yml
└── package.json
```
