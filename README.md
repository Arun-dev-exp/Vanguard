# 🛡️ Project Vanguard

> Next-generation Security Operations Center (SOC) platform with AI-powered threat detection, real-time call analysis, and fraud prevention.

## Repository Structure

```
vanguard/
├── frontend/          # SOC Dashboard (Next.js)
├── backend/           # API Services
│   ├── src/
│   ├── tests/
│   └── Dockerfile
├── ai-services/       # AI/ML modules (real-time call analysis, threat detection)
├── mobile-app/        # Flutter mobile application
├── docs/              # Documentation & PRDs
│   └── PRD.md
├── .env.example       # Environment variable template
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Frontend (SOC Dashboard)

```bash
cd frontend
npm install
npm run dev
```

The SOC dashboard will be available at `http://localhost:3000`.

### Backend

```bash
cd backend
# Setup instructions TBD
```

### AI Services

```bash
cd ai-services
# Setup instructions TBD
```

### Mobile App

```bash
cd mobile-app
# Flutter setup instructions TBD
```

## Team Contributions

| Module        | Description                          |
|---------------|--------------------------------------|
| `frontend/`   | SOC Dashboard UI                    |
| `backend/`    | Core API & business logic           |
| `ai-services/`| Real-time call analysis, fraud ML   |
| `mobile-app/` | Vanguard Flutter mobile app         |

## Environment Variables

Copy `.env.example` to `.env` in the appropriate service directory and fill in the required values.

## License

Proprietary — All rights reserved.
