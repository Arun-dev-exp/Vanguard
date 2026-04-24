# Frontend — SOC Dashboard (PRD-3)

This directory will contain the SOC Dashboard frontend for Project Vanguard.

## Planned Features (PRD-3)
- Active Scam Campaigns panel
- Flagged Entities panel
- **Live Call Monitoring** section (data from ScamGuard WebSocket)
- Real-time risk escalation toast notifications
- Call scam type breakdown charts

## Data Sources
- ScamGuard: `GET /api/v1/calls/active`, `GET /api/v1/calls/history`, `ws://host/ws/calls`
- Risk Orchestrator: `ws://host/ws/alerts`

## Setup
Coming soon — React/Next.js application.
