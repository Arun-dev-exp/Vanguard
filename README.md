# 🛡️ Project Vanguard

**Real-time fraud detection and prevention platform** — protecting users from scam calls, fraudulent payments, and social engineering attacks through AI-powered intelligence.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Project Vanguard                         │
├─────────────┬──────────────┬──────────────┬─────────────────┤
│  AI Engine  │    Risk      │  ScamGuard   │ SOC Dashboard   │
│   (PRD-1)   │ Orchestrator │   (PRD-4)    │    (PRD-3)      │
│             │   (PRD-2)    │              │                 │
│ • NLP       │ • Risk Score │ • Twilio     │ • Live Calls    │
│ • Classify  │ • Payment    │ • Deepgram   │ • Campaigns     │
│ • Entities  │   Check      │ • Telegram   │ • Entities      │
│ • Campaigns │ • Entity     │   Alerts     │ • Analytics     │
│             │   Registry   │ • WebSocket  │                 │
└──────┬──────┴───────┬──────┴──────┬───────┴────────┬────────┘
       │              │             │                │
       └──────────────┴─────────────┴────────────────┘
                    Supabase (PostgreSQL)
```

## Repository Structure

```
vanguard/
├── ai-services/                 # PRD-1 — AI Fraud Intelligence Engine
│   ├── src/
│   │   ├── routes/analyze.js    #   POST /api/v1/analyze
│   │   ├── services/            #   Classification, extraction, campaigns
│   │   └── lib/supabase.js      #   Database client
│   ├── __tests__/               #   Test suite
│   ├── schema.sql               #   Database schema
│   └── package.json
│
├── backend/
│   ├── risk-orchestrator/       # PRD-2 — Risk Scoring & Payment Interception
│   │   ├── src/
│   │   │   ├── routes/          #   /payment/check, /action/report, /risk/lookup
│   │   │   ├── services/        #   Risk scoring, entity registry, action engine
│   │   │   ├── models/          #   Entity risk, payment check models
│   │   │   ├── middleware/      #   Rate limiter, validator, error handler
│   │   │   ├── websocket/       #   Real-time alert broadcasting
│   │   │   └── db/              #   Supabase client, migrations, seeds
│   │   ├── tests/               #   Unit + integration tests
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── scamguard/               # PRD-4 — Real-Time Voice Call Intelligence
│       ├── src/
│       │   ├── server.js        #   Fastify server + call orchestration
│       │   ├── analyzer.js      #   PRD-1 integration
│       │   ├── risk-mapper.js   #   PRD-2 risk → alert severity
│       │   ├── telegram.js      #   Bot registration + alerts
│       │   ├── deepgram.js      #   Streaming speech-to-text
│       │   ├── call-manager.js  #   Call lifecycle (Supabase)
│       │   └── ws-broadcaster.js#   WebSocket for SOC Dashboard
│       ├── routes/              #   /incoming-call, /calls/active, /calls/history
│       ├── test/                #   Unit + integration tests
│       ├── Dockerfile
│       └── package.json
│
├── frontend/                    # PRD-3 — SOC Dashboard (planned)
│
├── mobile-app/                  # Mobile application (planned)
│
├── docs/
│   ├── PRD-1-AI-Fraud-Intelligence.md
│   ├── PRD-2-Risk-Orchestrator-Interception.md
│   └── PRD-4-ScamGuard-Integration.md
│
├── .env.example                 # All environment variables
├── .gitignore
└── README.md
```

## Services

| Service | Port | Description | Status |
|---------|------|-------------|--------|
| AI Engine (PRD-1) | 8000 | NLP-based fraud classification & entity extraction | ✅ Active |
| Risk Orchestrator (PRD-2) | 4000 | Composite risk scoring & payment interception | ✅ Active |
| ScamGuard (PRD-4) | 3001 | Real-time voice call monitoring & Telegram alerts | ✅ Active |
| SOC Dashboard (PRD-3) | 3000 | Security Operations Center UI | 🔜 Planned |

## Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/Arun-dev-exp/Vanguard.git
cd Vanguard
cp .env.example .env
# Fill in your actual API keys in .env
```

### 2. Start AI Engine (PRD-1)
```bash
cd ai-services
npm install
npm start    # Runs on :8000
```

### 3. Start Risk Orchestrator (PRD-2)
```bash
cd backend/risk-orchestrator
npm install
npm start    # Runs on :4000
```

### 4. Start ScamGuard (PRD-4)
```bash
cd backend/scamguard
npm install
npm run dev  # Runs on :3001
```

### 5. Run Tests
```bash
# PRD-1 tests
cd ai-services && npm test

# PRD-2 tests
cd backend/risk-orchestrator && npm test

# PRD-4 tests
cd backend/scamguard && npm test
```

## Data Flow

```
User receives scam call
    → Twilio streams audio to ScamGuard (PRD-4)
    → Deepgram transcribes in real-time
    → Every ~40 words: PRD-1 analyzes transcript
    → If UPI ID found: PRD-2 checks payment risk
    → Risk level mapped → Telegram alert sent
    → If FRAUD: caller reported to PRD-2 entity registry
    → Live events pushed to SOC Dashboard (PRD-3) via WebSocket
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| AI/NLP | Anthropic Claude (via PRD-1) |
| Backend | Node.js, Express (PRD-2), Fastify (PRD-4) |
| Database | Supabase (PostgreSQL) |
| Telephony | Twilio (audio streaming) |
| Speech-to-Text | Deepgram (nova-2, en-IN) |
| User Alerts | Telegram Bot API |
| Real-time | WebSocket (ws/alerts, ws/calls) |
| Containerization | Docker |

## Contributing

Each service is independently deployable. Make changes within the appropriate directory and run that service's test suite before submitting a PR.

## License

Private — Project Vanguard
