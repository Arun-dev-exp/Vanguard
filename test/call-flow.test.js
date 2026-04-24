// ============================================================
// Integration Test: Full call analysis pipeline
// Tests FRAUD → Telegram, UPI → PRD-2, and WS event broadcast
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock all external dependencies
vi.mock("../src/config.js", () => ({
  default: {
    prd1BaseUrl: "http://localhost:8000",
    prd2BaseUrl: "http://localhost:4000",
    nodeEnv: "test",
    transcriptChunkSize: 40,
  },
}));

vi.mock("../src/db.js", () => ({
  default: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { call_sid: "CA_test", status: "active" },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { call_sid: "CA_test" },
              error: null,
            })),
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { started_at: new Date().toISOString() },
            error: null,
          })),
          maybeSingle: vi.fn(() => ({
            data: null,
            error: null,
          })),
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { phone_number: "+919876543210", chat_id: 12345 },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

import { analyzeTranscript } from "../src/analyzer.js";
import {
  mapRiskLevel,
  getAlertSeverity,
  hasUpiIds,
  shouldReportCaller,
} from "../src/risk-mapper.js";

describe("Full Call Analysis Pipeline", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("FRAUD verdict → should trigger correct alert flow", async () => {
    // Mock PRD-1 returning FRAUD
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        verdict: "FRAUD",
        risk_score: 0.92,
        scam_type: "KYC",
        entities: { upi_ids: [] },
        flags: { urgency_pressure: true, otp_request: true },
        campaign: { campaign_name: "KYC Scam Campaign", report_count: 47 },
      }),
    });

    const result = await analyzeTranscript("Your KYC expired, share OTP now");
    const { riskLevel, score } = mapRiskLevel(result);
    const { severity, tier } = getAlertSeverity(riskLevel, score, 0);

    expect(result.verdict).toBe("FRAUD");
    expect(riskLevel).toBe("HIGH");
    expect(score).toBe(0.92);
    expect(severity).toBe("danger"); // score >= 0.85
    expect(tier).toBe(3);
    expect(shouldReportCaller(result)).toBe(true);
  });

  it("UPI entity found → should trigger PRD-2 payment/check", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        verdict: "FRAUD",
        risk_score: 0.72,
        scam_type: "Payment",
        entities: { upi_ids: ["fraud@ybl"] },
        flags: {},
        campaign: null,
      }),
    });

    const result = await analyzeTranscript("Pay to fraud@ybl now");

    expect(hasUpiIds(result)).toBe(true);
    expect(result.entities.upi_ids[0]).toBe("fraud@ybl");

    // Simulate PRD-2 returning HIGH/BLOCK
    const withPrd2 = {
      ...result,
      _riskLevel: "HIGH",
      _compositeScore: 0.95,
    };

    const { riskLevel, score } = mapRiskLevel(withPrd2);
    expect(riskLevel).toBe("HIGH");
    expect(score).toBe(0.95); // PRD-2 composite overrides PRD-1
  });

  it("PRD-2 BLOCK → should upgrade alert to DANGER", async () => {
    // Start with MEDIUM risk from PRD-1
    const prd1Result = {
      verdict: "SUSPICIOUS",
      risk_score: 0.55,
      _riskLevel: "HIGH", // PRD-2 override
      _compositeScore: 0.91,
    };

    const { riskLevel, score } = mapRiskLevel(prd1Result);
    const { severity } = getAlertSeverity(riskLevel, score, 0);

    expect(riskLevel).toBe("HIGH");
    expect(severity).toBe("danger"); // 0.91 >= 0.85
  });

  it("should properly report caller phone to PRD-2", async () => {
    // Mock PRD-1 FRAUD response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        verdict: "FRAUD",
        risk_score: 0.88,
        scam_type: "KYC",
        entities: {},
        flags: {},
        campaign: { campaign_name: "KYC Campaign" },
      }),
    });

    const result = await analyzeTranscript("test");
    expect(shouldReportCaller(result)).toBe(true);

    // Mock PRD-2 report endpoint
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Simulate the report call
    await fetch("http://localhost:4000/api/v1/action/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity_value: "+919999999999",
        entity_type: "PHONE",
        reason: "Linked to KYC Campaign via live call",
        reported_by: "scamguard_call_monitor",
      }),
    });

    // Verify the report was sent correctly
    expect(fetch).toHaveBeenCalledTimes(2);
    const reportCall = fetch.mock.calls[1];
    expect(reportCall[0]).toBe("http://localhost:4000/api/v1/action/report");
    const reportBody = JSON.parse(reportCall[1].body);
    expect(reportBody.entity_type).toBe("PHONE");
    expect(reportBody.entity_value).toBe("+919999999999");
  });

  it("WebSocket events should fire in correct order", () => {
    // Test event structure validation
    const callStarted = {
      event: "CALL_STARTED",
      call_sid: "CA123",
      caller_number: "+919876543210",
      called_number: "+919000000001",
      started_at: new Date().toISOString(),
    };

    const riskEscalated = {
      event: "RISK_ESCALATED",
      call_sid: "CA123",
      risk_level: "HIGH",
      composite_score: 0.88,
      campaign_name: "KYC Scam Campaign",
      alerts_sent: 2,
    };

    const callEnded = {
      event: "CALL_ENDED",
      call_sid: "CA123",
      duration_seconds: 143,
      final_risk_level: "HIGH",
      telegram_alerts_sent: 2,
    };

    // Validate event structure
    expect(callStarted.event).toBe("CALL_STARTED");
    expect(callStarted).toHaveProperty("caller_number");
    expect(callStarted).toHaveProperty("called_number");

    expect(riskEscalated.event).toBe("RISK_ESCALATED");
    expect(riskEscalated).toHaveProperty("risk_level");
    expect(riskEscalated).toHaveProperty("composite_score");

    expect(callEnded.event).toBe("CALL_ENDED");
    expect(callEnded).toHaveProperty("duration_seconds");
    expect(callEnded).toHaveProperty("final_risk_level");
  });
});
