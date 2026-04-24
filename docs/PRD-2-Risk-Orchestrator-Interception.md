# PRD-2 — Risk Orchestrator & Transaction Interception
## Project Vanguard | Owner: Backend Engineer

> **Depends on:** PRD-1 (`POST /api/v1/analyze` — AI Fraud Intelligence Engine)
> **Consumed by:** PRD-3 (Frontend/Dashboard) via `GET /api/v1/risk/{upi_id}` and WebSocket alerts

---

## 1. Overview

This module is the **decision layer** of Project Vanguard. It receives the structured fraud intelligence from PRD-1, combines it with entity-level risk data, makes a final HIGH/MEDIUM/LOW risk decision, and — most critically — **intercepts payment attempts** in real time before money is lost. It also manages the Action Engine that reports flagged entities to NPCI.

---

## 2. Scope

| In Scope | Out of Scope |
|---|---|
| Risk scoring & decision logic | ML model training |
| UPI entity risk registry | UI rendering / alerts |
| Live payment interception API | SOC dashboard visuals |
| Risk level thresholds & rules | Message ingestion |
| Action engine (flag/report UPI & URLs) | Campaign analysis |
| WebSocket alert push | User-facing notifications design |

---

## 3. User Stories

| ID | Story |
|---|---|
| US-01 | As the payment app, I can check a UPI ID before processing and receive a block/allow decision |
| US-02 | As the system, I combine AI score + campaign data + entity history into one final risk verdict |
| US-03 | As the system, I flag a risky UPI ID and mark it as reported to NPCI |
| US-04 | As the frontend, I receive a real-time WebSocket push when a high-risk UPI is entered |
| US-05 | As a tester, I can simulate a payment to a flagged UPI and see it get intercepted |

---

## 4. Functional Requirements

### 4.1 Risk Orchestrator (Step 4)

Combine three signals into one final risk decision:

| Signal | Weight | Source |
|---|---|---|
| AI Risk Score | 50% | PRD-1 response `risk_score` |
| Campaign Match | 30% | PRD-1 response `campaign.report_count` |
| Entity Risk History | 20% | Internal UPI/URL risk registry |

**Composite Score Calculation:**
```
composite_score = (ai_score × 0.5) + (campaign_score × 0.3) + (entity_score × 0.2)
```

**Risk Level Mapping:**

| Composite Score | Risk Level | Action |
|---|---|---|
| ≥ 0.80 | 🔴 HIGH | Block transaction, push alert |
| 0.50 – 0.79 | 🟡 MEDIUM | Warn user, allow with confirmation |
| < 0.50 | 🟢 LOW | Allow transaction |

### 4.2 UPI Entity Risk Registry

- Maintain an internal database of known risky UPI IDs and URLs
- Each entity record contains:
  - `entity_value` (UPI ID or URL)
  - `entity_type` (`UPI` | `URL` | `PHONE`)
  - `report_count`
  - `risk_score` (0.00 – 1.00)
  - `campaigns` (list of linked campaign IDs from PRD-1)
  - `status`: `ACTIVE` | `REPORTED` | `CLEARED`
- Auto-update registry whenever PRD-1 returns a FRAUD verdict with entities

### 4.3 Live Transaction Interception (Step 5)

This is the **winning moment** of the demo. When a user initiates a payment:

1. Frontend calls `POST /api/v1/payment/check` with UPI ID + amount
2. This module looks up the UPI ID in the entity registry
3. Calls PRD-1 if no prior analysis exists for this UPI ID
4. Computes composite risk score
5. Returns decision: `BLOCK` | `WARN` | `ALLOW`
6. If `BLOCK`: pushes WebSocket event to frontend with full fraud context

### 4.4 Action Engine (Step 8)

- Expose `POST /api/v1/action/report` to flag a UPI ID or URL
- Simulate reporting to NPCI / bank system (log + status update)
- Update entity status to `REPORTED`
- Return confirmation with a report reference ID

---

## 5. API Contracts

### 5.1 `POST /api/v1/payment/check` — Payment Interception

**Request Body:**
```json
{
  "upi_id": "fraudster@ybl",
  "amount": 5000,
  "user_id": "user_demo_001"
}
```

**Response Body (HIGH RISK — BLOCK):**
```json
{
  "request_id": "pay_chk_xyz789",
  "upi_id": "fraudster@ybl",
  "decision": "BLOCK",
  "risk_level": "HIGH",
  "composite_score": 0.92,
  "breakdown": {
    "ai_score": 0.92,
    "campaign_score": 0.85,
    "entity_score": 0.90
  },
  "fraud_context": {
    "campaign_name": "KYC Scam Campaign",
    "report_count": 47,
    "estimated_loss_inr": 230000,
    "flags": {
      "suspicious_link": true,
      "urgent_language": true,
      "impersonation": true
    }
  },
  "checked_at": "2025-01-24T09:00:00Z"
}
```

**Response Body (LOW RISK — ALLOW):**
```json
{
  "request_id": "pay_chk_abc123",
  "upi_id": "friend@okaxis",
  "decision": "ALLOW",
  "risk_level": "LOW",
  "composite_score": 0.05,
  "checked_at": "2025-01-24T09:01:00Z"
}
```

---

### 5.2 `GET /api/v1/risk/{upi_id}` — Entity Risk Lookup (Used by PRD-3)

**Response Body:**
```json
{
  "upi_id": "fraudster@ybl",
  "risk_level": "HIGH",
  "risk_score": 0.92,
  "report_count": 47,
  "status": "REPORTED",
  "campaigns": ["camp_kyc_001"],
  "last_updated": "2025-01-24T09:00:00Z"
}
```

---

### 5.3 `POST /api/v1/action/report` — Flag & Report Entity (Step 8)

**Request Body:**
```json
{
  "entity_value": "fraudster@ybl",
  "entity_type": "UPI",
  "reason": "Linked to KYC Scam Campaign",
  "reported_by": "system_auto"
}
```

**Response Body:**
```json
{
  "report_id": "RPT-20250124-001",
  "status": "REPORTED",
  "message": "Reported to NPCI / bank system",
  "reported_at": "2025-01-24T09:00:00Z"
}
```

---

### 5.4 WebSocket — Real-Time Alert (Used by PRD-3)

**Endpoint:** `ws://host/ws/alerts`

**Event pushed on HIGH RISK payment attempt:**
```json
{
  "event": "FRAUD_ALERT",
  "upi_id": "fraudster@ybl",
  "risk_level": "HIGH",
  "composite_score": 0.92,
  "campaign_name": "KYC Scam Campaign",
  "report_count": 47,
  "amount_at_risk_inr": 5000,
  "estimated_loss_pool_inr": 230000,
  "timestamp": "2025-01-24T09:00:00Z"
}
```

---

## 6. Data Storage

### 6.1 Entity Risk Registry Table

```
entity_risks
  - id (UUID)
  - entity_value (string, indexed)
  - entity_type (enum: UPI, URL, PHONE)
  - risk_score (float)
  - report_count (int)
  - campaigns (uuid[], FK to campaigns)
  - status (enum: ACTIVE, REPORTED, CLEARED)
  - created_at (timestamp)
  - updated_at (timestamp)
```

### 6.2 Payment Check Log Table

```
payment_checks
  - id (UUID)
  - user_id (string)
  - upi_id (string)
  - amount (int)
  - decision (enum: BLOCK, WARN, ALLOW)
  - composite_score (float)
  - breakdown (jsonb)
  - checked_at (timestamp)
```

---

## 7. Business Logic Rules

- If UPI ID has `report_count ≥ 10` → minimum MEDIUM risk regardless of AI score
- If UPI ID has `status = REPORTED` → minimum HIGH risk
- Amount > ₹10,000 + MEDIUM risk → escalate to HIGH risk
- Rate limit: max 10 payment checks per user per minute

---

## 8. Performance Requirements

| Metric | Target |
|---|---|
| Payment check latency | < 200ms (cache hit) / < 700ms (cache miss + AI call) |
| WebSocket alert delivery | < 100ms |
| Uptime | 99.9% |
| Concurrent connections | 500 WebSocket clients |

---

## 9. Testing Requirements

- Unit test: composite score calculation with known inputs
- Integration test: payment check → BLOCK decision → WebSocket alert fires
- Integration test: action/report → entity status flips to `REPORTED`
- Mock PRD-1 for isolated backend testing
- Demo scenario: `fraudster@ybl` → always returns BLOCK (hardcoded fixture for demo)

---

## 10. Integration Checklist

### Requires from PRD-1 (AI Engine):
- [ ] `POST /api/v1/analyze` live and reachable
- [ ] Response includes `risk_score`, `campaign`, `flags`, `entities`
- [ ] Agreed base URL shared

### Provides to PRD-3 (Frontend):
- [ ] `POST /api/v1/payment/check` documented and live
- [ ] `GET /api/v1/risk/{upi_id}` documented and live
- [ ] `POST /api/v1/action/report` documented and live
- [ ] WebSocket endpoint live at `ws://host/ws/alerts`
- [ ] Demo fixture UPI `fraudster@ybl` returns BLOCK decision
- [ ] CORS configured to allow frontend origin

---

## 11. Tech Stack

| Component | Technology |
|---|---|
| API Framework | Node.js + Express or Python FastAPI |
| WebSocket | Socket.io or native WS |
| Cache | Redis |
| Database | PostgreSQL |
| Message Queue | Redis Pub/Sub (for WS events) |
| Hosting | Docker container |

---

## 12. Milestones

| Milestone | Target |
|---|---|
| Entity registry + risk scoring logic | Day 1 |
| Payment check API live | Day 1 |
| WebSocket alert system | Day 2 |
| Action engine (report endpoint) | Day 2 |
| PRD-1 integration tested | Day 2 |
| Handoff to PRD-3 team | Day 2 EOD |
