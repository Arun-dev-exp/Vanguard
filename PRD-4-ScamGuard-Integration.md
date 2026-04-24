# PRD-4 — ScamGuard: Real-Time Voice Call Intelligence
## Project Vanguard | Owner: ScamGuard / Integrations Engineer

> **Depends on:** PRD-1 (`POST /api/v1/analyze`), PRD-2 (`/payment/check`, `/action/report`, WebSocket alerts)
> **Consumed by:** PRD-3 (SOC Dashboard) via `GET /api/v1/calls/active`, `GET /api/v1/calls/history`, WebSocket `ws/calls`

---

## 1. Overview

ScamGuard is the **voice layer** of Project Vanguard. While PRD-1 handles text messages and PRD-2 handles payment interception, ScamGuard monitors live phone calls in real time — transcribing audio, feeding the transcript into the existing Vanguard AI pipeline, and alerting the user mid-call via Telegram before any damage is done.

Before this integration, ScamGuard ran its own isolated Claude analysis. This PRD replaces every custom analysis component with calls to PRD-1 and PRD-2, and contributes call-level intelligence back into the shared ecosystem — enriching the PRD-2 entity registry and populating a new Live Call Monitoring section in the PRD-3 SOC Dashboard.

---

## 2. Scope

| In Scope | Out of Scope |
|---|---|
| Real-time audio capture via Twilio | SMS / WhatsApp message analysis (PRD-1) |
| Live transcription via Deepgram | Payment UI / interception UI (PRD-3) |
| Transcript → PRD-1 fraud analysis | Risk score calculation logic (PRD-2) |
| PRD-2 composite risk → Telegram alerts | Campaign detection algorithm (PRD-1) |
| Caller phone number → PRD-2 entity registry | UPI risk registry management (PRD-2) |
| UPI IDs spoken on call → PRD-2 payment check | Dashboard rendering (PRD-3) |
| Live call events → PRD-3 SOC Dashboard | Telegram bot UX beyond alerts |
| User registration via Telegram bot | User authentication / login |

---

## 3. User Stories

| ID | Story |
|---|---|
| US-01 | As a user, I receive a Telegram alert mid-call if the caller shows scam patterns |
| US-02 | As a user, the alert tells me the campaign name and how many people were already scammed |
| US-03 | As a user, if a UPI ID is mentioned on the call, I'm warned before I open my payment app |
| US-04 | As a bank security analyst, I can see all actively monitored calls on the SOC Dashboard |
| US-05 | As the system, I automatically report a scam caller's phone number to PRD-2's entity registry |
| US-06 | As a tester, I can simulate a scam call and see the full alert + SOC Dashboard update in real time |

---

## 4. Full Data Flow

```
User's phone receives a call
        │
        ▼
Twilio intercepts audio → POST /incoming-call (ScamGuard)
        │
        ▼
ScamGuard WebSocket receives mulaw audio chunks
        │
        ▼
Deepgram streaming STT → live transcript
        │
        ▼  (every ~40 words)
POST /api/v1/analyze  ◄── PRD-1
  body: { message: transcript_chunk, source: "call" }
  response: verdict, risk_score, scam_type, entities, flags, campaign
        │
        ├──► If entities.upi_ids present:
        │         POST /api/v1/payment/check  ◄── PRD-2
        │         Override risk_level with PRD-2 composite decision
        │
        ▼
Map PRD-2 risk_level → Telegram alert severity
  LOW    → no alert
  MEDIUM → 🟡 Warning
  HIGH (score < 0.85) → 🟠 High Alert
  HIGH (score ≥ 0.85) → 🔴 DANGER
        │
        ▼
If verdict = FRAUD:
  POST /api/v1/action/report  ◄── PRD-2
  entity_value: caller phone number
  entity_type: "PHONE"
        │
        ▼
Push call events → ws://host/ws/calls  ►── PRD-3 SOC Dashboard
```

---

## 5. Changes to ScamGuard Codebase

### 5.1 `analyzer.js` — Replace with PRD-1 call

The existing custom Claude prompt is deleted entirely and replaced by a fetch to PRD-1. ScamGuard gains campaign linkage, entity extraction, and structured flags at no extra cost.

**Old behavior:** Direct Anthropic SDK call with a hand-written scam-detection prompt.

**New behavior:**

```javascript
// src/analyzer.js — full replacement
export async function analyzeTranscript(transcript, callerNumber = "") {
  const response = await fetch(`${process.env.PRD1_BASE_URL}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: transcript, source: "call" }),
  });
  const data = await response.json();
  // data: { verdict, risk_score, scam_type, entities, flags, campaign, ... }
  return data;
}
```

### 5.2 `server.js` — Updated alert + reporting logic

Replace the hardcoded numeric thresholds (40 / 65 / 85) with PRD-2 composite risk levels.

```javascript
// In Deepgram transcript handler

const prd1Result = await analyzeTranscript(transcriptBuffer, callerNumber);

// Step A: if UPI ID spoken on call, check via PRD-2
if (prd1Result.entities?.upi_ids?.length > 0) {
  const upi = prd1Result.entities.upi_ids[0];
  const payCheck = await fetch(`${process.env.PRD2_BASE_URL}/api/v1/payment/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upi_id: upi, amount: 0, user_id: user.chatId }),
  });
  const payData = await payCheck.json();
  prd1Result._riskLevel = payData.risk_level;        // "HIGH" | "MEDIUM" | "LOW"
  prd1Result._compositeScore = payData.composite_score;
}

// Step B: map PRD-2 risk level → Telegram severity
const riskLevel = prd1Result._riskLevel ||
  (prd1Result.risk_score >= 0.80 ? "HIGH" :
   prd1Result.risk_score >= 0.50 ? "MEDIUM" : "LOW");

if (riskLevel === "HIGH" && prd1Result.risk_score >= 0.85 && highestAlertSent < 3) {
  highestAlertSent = 3;
  await sendTelegramAlert(user.chatId, "danger", prd1Result, callerNumber);
} else if (riskLevel === "HIGH" && highestAlertSent < 2) {
  highestAlertSent = 2;
  await sendTelegramAlert(user.chatId, "high", prd1Result, callerNumber);
} else if (riskLevel === "MEDIUM" && highestAlertSent < 1) {
  highestAlertSent = 1;
  await sendTelegramAlert(user.chatId, "warning", prd1Result, callerNumber);
}

// Step C: report caller phone number to PRD-2 entity registry
if (prd1Result.verdict === "FRAUD" && callerNumber) {
  await fetch(`${process.env.PRD2_BASE_URL}/api/v1/action/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entity_value: callerNumber,
      entity_type: "PHONE",
      reason: `Linked to ${prd1Result.campaign?.campaign_name || prd1Result.scam_type} via live call`,
      reported_by: "scamguard_call_monitor",
    }),
  });
}
```

### 5.3 `telegram.js` — Enrich alerts with PRD-1 campaign data

Telegram messages are updated to include the campaign name, report count, scam type, and any UPI IDs found on the call — all sourced from PRD-1 and PRD-2 responses.

| Alert Field (Before) | Alert Field (After) | Source |
|---|---|---|
| Generic warning text | Campaign name + report count | PRD-1 `campaign` object |
| Raw score 0–100 | PRD-2 composite score 0.00–1.00 | PRD-2 `payment/check` |
| Static flag list | Dynamic flags from PRD-1 `flags` object | PRD-1 `flags` |
| No UPI info | UPI IDs found in call + PRD-2 block status | PRD-1 `entities` + PRD-2 risk |
| No report reference | Auto-filed report ID from PRD-2 | PRD-2 `/action/report` |

---

## 6. Risk Level & Alert Mapping

ScamGuard's Telegram alerts map directly to PRD-2's standardized risk levels.

| PRD-2 Risk Level | Composite Score | Telegram Alert | Message | Action |
|---|---|---|---|---|
| LOW | < 0.50 | None | — | Monitor only |
| MEDIUM | 0.50 – 0.79 | 🟡 Warning | Suspicious patterns detected | Stay alert |
| HIGH | 0.80 – 0.84 | 🟠 High Alert | Strong scam indicators found | Don't share any info |
| HIGH | ≥ 0.85 | 🔴 DANGER | Almost certainly a scam | Hang up now |

---

## 7. New API Endpoints (ScamGuard provides to PRD-3)

### 7.1 `GET /api/v1/calls/active`

Returns all calls currently being monitored. PRD-3 polls this every 5 seconds for the SOC Dashboard Live Calls panel.

**Response:**
```json
{
  "active_calls": [
    {
      "call_sid": "CA123abc",
      "caller_number": "+919876543210",
      "called_number": "+919000000001",
      "user_name": "Ravi",
      "started_at": "2025-01-24T09:00:00Z",
      "transcript_length": 312,
      "current_risk_level": "HIGH",
      "current_score": 0.88,
      "alerts_sent": 2,
      "campaign_name": "KYC Scam Campaign",
      "scam_type": "KYC"
    }
  ],
  "total": 1
}
```

---

### 7.2 `GET /api/v1/calls/history`

Returns completed calls with outcomes. Used by PRD-3 for fraud trends chart and historical analysis.

**Query params:** `?limit=50&from=2025-01-01&scam_type=KYC`

**Response:**
```json
{
  "calls": [
    {
      "call_sid": "CA456def",
      "caller_number": "+919000000002",
      "verdict": "FRAUD",
      "final_risk_level": "HIGH",
      "scam_type": "KYC",
      "campaign_id": "camp_kyc_001",
      "campaign_name": "KYC Scam Campaign",
      "duration_seconds": 98,
      "telegram_alerts_sent": 3,
      "ended_at": "2025-01-24T08:45:00Z"
    }
  ],
  "total": 47
}
```

---

### 7.3 WebSocket `ws://host/ws/calls` — Live Call Events

Pushes real-time call events to PRD-3. Subscribe once on SOC Dashboard load — same pattern as PRD-2's `ws/alerts`.

**Events pushed:**

```json
// New call started
{ "event": "CALL_STARTED", "call_sid": "CA123abc",
  "caller_number": "+91...", "called_number": "+91...", "started_at": "..." }

// Risk level escalated mid-call
{ "event": "RISK_ESCALATED", "call_sid": "CA123abc",
  "risk_level": "HIGH", "composite_score": 0.88,
  "campaign_name": "KYC Scam Campaign", "alerts_sent": 2 }

// Call ended
{ "event": "CALL_ENDED", "call_sid": "CA123abc",
  "duration_seconds": 143, "final_risk_level": "HIGH",
  "telegram_alerts_sent": 2 }
```

---

## 8. PRD-3 SOC Dashboard Changes

Screen 6 (SOC Dashboard) gains a **Live Call Monitoring** section alongside the existing Active Scam Campaigns and Flagged Entities panels.

### 8.1 New Components

| Component | Data Source | Update Frequency |
|---|---|---|
| Active calls counter card | `GET /api/v1/calls/active` | Poll every 5s |
| Live calls table (caller, risk, campaign) | WebSocket `ws/calls` | Real-time push |
| Risk escalation toast notification | `RISK_ESCALATED` event | Real-time push |
| Calls today / Fraud calls today | `GET /api/v1/calls/history` | On load + 1 min |
| Call scam type breakdown (pie chart) | `GET /api/v1/calls/history` | On load |

### 8.2 WebSocket Integration

```javascript
// Add to App.jsx — alongside existing PRD-2 WebSocket
const callSocket = new WebSocket(`${SCAMGUARD_WS_HOST}/ws/calls`);

callSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.event === "CALL_STARTED") {
    setActiveCalls(prev => [...prev, data]);
  }
  if (data.event === "RISK_ESCALATED") {
    setActiveCalls(prev =>
      prev.map(c => c.call_sid === data.call_sid ? { ...c, ...data } : c)
    );
    if (data.risk_level === "HIGH") showRiskToast(data);
  }
  if (data.event === "CALL_ENDED") {
    setActiveCalls(prev => prev.filter(c => c.call_sid !== data.call_sid));
  }
};
```

---

## 9. Configuration — New Environment Variables

| Variable | Description | Provided by |
|---|---|---|
| `PRD1_BASE_URL` | Base URL of PRD-1 AI Engine, e.g. `http://prd1:8000` | PRD-1 owner |
| `PRD2_BASE_URL` | Base URL of PRD-2 Risk Orchestrator, e.g. `http://prd2:4000` | PRD-2 owner |
| `PRD2_WS_URL` | WebSocket URL for PRD-2 alerts, e.g. `ws://prd2:4000/ws/alerts` | PRD-2 owner |
| `SCAMGUARD_PUBLIC_URL` | ScamGuard's public URL — shared with PRD-3 for WS connection | ScamGuard owner |
| `DEEPGRAM_API_KEY` | Existing — no change | ScamGuard owner |
| `TELEGRAM_BOT_TOKEN` | Existing — no change | ScamGuard owner |

---

## 10. Integration Checklists

### Requires from PRD-1

- [ ] `POST /api/v1/analyze` live and accepting `source: "call"`
- [ ] Response includes `verdict`, `risk_score`, `entities`, `flags`, `campaign`
- [ ] `campaign` object populated for all `FRAUD` verdicts
- [ ] `entities.upi_ids` populated when UPI ID found in message
- [ ] Base URL confirmed → set as `PRD1_BASE_URL`

### Requires from PRD-2

- [ ] `POST /api/v1/payment/check` accepts calls from ScamGuard with `amount: 0`
- [ ] `POST /api/v1/action/report` accepts `entity_type: "PHONE"` *(see note below)*
- [ ] WebSocket `ws/alerts` remains open for ScamGuard subscription
- [ ] CORS allows ScamGuard origin
- [ ] Base URL + WS URL confirmed → set as `PRD2_BASE_URL`, `PRD2_WS_URL`

### Provides to PRD-3

- [ ] `GET /api/v1/calls/active` live and documented
- [ ] `GET /api/v1/calls/history` live and documented
- [ ] WebSocket `ws/calls` live and pushing `CALL_STARTED`, `RISK_ESCALATED`, `CALL_ENDED`
- [ ] `SCAMGUARD_PUBLIC_URL` shared with PRD-3 owner
- [ ] CORS allows PRD-3 frontend origin

> **Note — PRD-2 entity_type extension:** PRD-2 currently accepts `entity_type: "UPI" | "URL"`. To support caller phone number reporting, PRD-2 needs to add `"PHONE"` to this enum. ScamGuard will skip the report step gracefully until this is confirmed — it is **not a blocker** for the main demo flow.

---

## 11. Testing Requirements

- Unit test: `analyzeTranscript()` calls `PRD1_BASE_URL/api/v1/analyze` with correct body
- Unit test: alert level maps correctly for each PRD-2 risk level
- Integration test: mock PRD-1 returning FRAUD → correct Telegram alert fires
- Integration test: mock PRD-1 returning entities with UPI ID → PRD-2 payment/check called
- Integration test: mock PRD-2 returning BLOCK → alert upgrades to DANGER
- Integration test: `CALL_STARTED` + `RISK_ESCALATED` + `CALL_ENDED` events fire correctly via WS
- Integration test: FRAUD verdict → caller phone reported to PRD-2
- Demo fixture: call from `+919999999999` always triggers FRAUD with KYC scam type

### End-to-End Demo Scenario

| Step | Action | Expected Result |
|---|---|---|
| 1 | User registers phone via Telegram bot | Phone linked to chatId in DB |
| 2 | Scammer calls user's number | Twilio streams audio to ScamGuard |
| 3 | Scammer says "Your KYC expired, share OTP" | Deepgram transcribes, PRD-1 returns FRAUD |
| 4 | PRD-2 composite score = 0.72 | Telegram 🟡 Warning sent |
| 5 | Scammer says "Pay ₹5000 to fraud@ybl" | PRD-1 extracts UPI, PRD-2 returns BLOCK |
| 6 | Composite score = 0.92 | Telegram 🔴 DANGER sent |
| 7 | PRD-3 SOC Dashboard | Live call visible as HIGH risk in real time |
| 8 | Call ends | Caller phone reported to PRD-2 entity registry |

---

## 12. Tech Stack

| Component | Technology |
|---|---|
| Server framework | Fastify (Node.js) |
| Telephony | Twilio (audio stream) |
| Speech-to-text | Deepgram (streaming, `nova-2`, `en-IN`) |
| Fraud analysis | PRD-1 `POST /api/v1/analyze` (replaces direct Claude call) |
| Risk scoring | PRD-2 `POST /api/v1/payment/check` |
| Entity reporting | PRD-2 `POST /api/v1/action/report` |
| User alerts | Telegram Bot API |
| User registration | Telegram bot + JSON file (swap for PostgreSQL in prod) |
| Hosting | Docker container |

---

## 13. Milestones

| Milestone | Owner | Depends On | Target |
|---|---|---|---|
| Replace `analyzer.js` with PRD-1 call | ScamGuard | PRD-1 URL shared | Day 1 AM |
| Map PRD-2 risk levels to Telegram alerts | ScamGuard | PRD-2 URL shared | Day 1 AM |
| UPI detection → PRD-2 payment/check flow | ScamGuard | PRD-2 URL shared | Day 1 PM |
| Report caller phone via PRD-2 `/action/report` | ScamGuard | PRD-2 PHONE type confirmed | Day 1 PM |
| `GET /api/v1/calls/active` + `history` endpoints | ScamGuard | Nothing | Day 1 PM |
| WebSocket `ws/calls` push events | ScamGuard | Nothing | Day 2 AM |
| PRD-3 Live Call Monitoring panel | PRD-3 owner | ScamGuard WS URL shared | Day 2 PM |
| Full end-to-end demo rehearsal | All teams | All above | Day 2 EOD |
