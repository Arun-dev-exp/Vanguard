# PRD-1 — AI Fraud Intelligence Engine
## Project Vanguard | Owner: AI/ML Engineer

> **Depends on:** Nothing (this is the entry point)
> **Consumed by:** PRD-2 (Risk Orchestrator) via `POST /api/v1/analyze`

---

## 1. Overview

This module is the **brain** of Project Vanguard. It receives raw suspicious messages (SMS/WhatsApp), classifies them as fraud or safe, extracts malicious entities, and groups them into scam campaigns. Every downstream decision in the system depends on the structured intelligence this module produces.

---

## 2. Scope

| In Scope | Out of Scope |
|---|---|
| Message ingestion API | Payment interception logic |
| Fraud classification model | UI rendering |
| Entity extraction (UPI, URL, phone) | Risk score thresholds & decisions |
| Scam type detection | Dashboard visualization |
| Campaign grouping & matching | Notification/alert delivery |

---

## 3. User Stories

| ID | Story |
|---|---|
| US-01 | As a user, I can paste a suspicious message and get an instant fraud verdict |
| US-02 | As a backend service, I can call the AI engine and receive a structured fraud report |
| US-03 | As the system, I can group similar scam messages into named campaigns |
| US-04 | As a tester, I can submit demo messages and get consistent, reproducible results |

---

## 4. Functional Requirements

### 4.1 Message Ingestion (Step 1)

- Accept text input via REST API (`POST /api/v1/analyze`)
- Support sources: raw SMS text, WhatsApp message paste, bot relay
- Input size limit: 2000 characters
- Sanitize input (strip HTML, normalize Unicode)

### 4.2 Fraud Classification (Step 2)

- Binary output: `FRAUD` | `SAFE`
- Confidence score: `0.00 – 1.00` (used as Risk Score %)
- Model must detect at minimum:
  - KYC expiry scams
  - Loan offer scams
  - Job offer scams
  - Lucky draw / prize scams
  - Urgent payment requests

### 4.3 Entity Extraction (Step 2)

Extract and return the following structured fields:

| Field | Type | Example |
|---|---|---|
| `upi_ids` | string[] | `["fraud@ybl"]` |
| `urls` | string[] | `["http://fake-kyc.in"]` |
| `phone_numbers` | string[] | `["+91-9876543210"]` |
| `scam_type` | enum | `"KYC" \| "LOAN" \| "JOB" \| "PRIZE" \| "OTHER"` |

### 4.4 Campaign Detection (Step 3)

- Store a fingerprint of each analyzed message
- On each new message, compare fingerprint against stored history
- If similarity ≥ 0.75 → assign to existing campaign
- If no match → create new campaign entry
- Return campaign metadata:
  - `campaign_id`
  - `campaign_name` (e.g., `"KYC Scam Campaign"`)
  - `report_count` (e.g., `47`)
  - `first_seen` timestamp
  - `last_seen` timestamp

---

## 5. API Contract (Output to PRD-2)

### `POST /api/v1/analyze`

**Request Body:**
```json
{
  "message": "Your bank KYC expired. Click link to update immediately.",
  "source": "sms"
}
```

**Response Body:**
```json
{
  "request_id": "req_abc123",
  "verdict": "FRAUD",
  "risk_score": 0.92,
  "scam_type": "KYC",
  "entities": {
    "upi_ids": [],
    "urls": ["http://fake-kyc.in"],
    "phone_numbers": []
  },
  "flags": {
    "suspicious_link": true,
    "urgent_language": true,
    "impersonation": true
  },
  "campaign": {
    "campaign_id": "camp_kyc_001",
    "campaign_name": "KYC Scam Campaign",
    "report_count": 47,
    "first_seen": "2024-11-01T10:00:00Z",
    "last_seen": "2025-01-24T08:45:00Z"
  },
  "analyzed_at": "2025-01-24T09:00:00Z"
}
```

**Error Response:**
```json
{
  "error": "INVALID_INPUT",
  "message": "Message exceeds 2000 character limit"
}
```

---

## 6. Data Storage

### 6.1 Message Fingerprint Store
- Technology: Redis (fast lookup) + PostgreSQL (persistent)
- Store: message hash, extracted entities, campaign assignment
- TTL on Redis: 24 hours
- Retention in PostgreSQL: 90 days

### 6.2 Campaign Registry Table

```
campaigns
  - id (UUID)
  - name (string)
  - scam_type (enum)
  - report_count (int)
  - entity_signatures (jsonb)
  - first_seen (timestamp)
  - last_seen (timestamp)
```

---

## 7. ML Model Details

| Parameter | Spec |
|---|---|
| Model type | Fine-tuned transformer (DistilBERT or similar) |
| Language support | English + Hinglish |
| Latency target | < 500ms p95 |
| Confidence threshold for FRAUD | ≥ 0.70 |
| Training data | Labeled SMS scam dataset (min 10K samples) |

### 7.1 Feature Signals Used
- Urgency keywords (`expired`, `immediately`, `click now`)
- URL presence and domain reputation
- Impersonation patterns (`your bank`, `NPCI`, `RBI`)
- Requested action type (link click, UPI payment, OTP share)

---

## 8. Performance Requirements

| Metric | Target |
|---|---|
| API response time | < 500ms |
| Uptime | 99.9% |
| Throughput | 100 requests/second |
| Classification accuracy | ≥ 92% F1-score |

---

## 9. Testing Requirements

- Unit tests for entity extraction (UPI regex, URL regex, phone regex)
- Integration test: full message → fraud report pipeline
- Demo test fixtures (at least 5 fraud messages, 3 safe messages)
- Campaign grouping test: same scam, different wording → same campaign

---

## 10. Integration Checklist (Handoff to PRD-2)

Before handing off to the Risk Orchestrator (PRD-2), confirm:

- [ ] `POST /api/v1/analyze` endpoint is live and documented
- [ ] Response schema matches the contract above exactly
- [ ] Campaign data is populated for all FRAUD verdicts
- [ ] Risk score is a float between 0.00 and 1.00
- [ ] `flags` object always contains `suspicious_link`, `urgent_language`, `impersonation`
- [ ] API is reachable at agreed base URL (share with PRD-2 owner)

---

## 11. Dependencies & Tech Stack

| Component | Technology |
|---|---|
| API Framework | FastAPI (Python) |
| ML Model | HuggingFace Transformers |
| Entity Extraction | spaCy + regex rules |
| Campaign Matching | MinHash / cosine similarity |
| Database | PostgreSQL + Redis |
| Hosting | Docker container |

---

## 12. Milestones

| Milestone | Target |
|---|---|
| Entity extraction working | Day 1 |
| Fraud classifier integrated | Day 1 |
| Campaign detection working | Day 2 |
| API contract finalized & tested | Day 2 |
| Handoff to PRD-2 team | Day 2 EOD |
