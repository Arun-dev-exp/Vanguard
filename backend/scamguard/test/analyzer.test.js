// ============================================================
// Unit Test: analyzer.js
// Verifies PRD-1 integration and graceful degradation
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock config before importing analyzer
vi.mock("../src/config.js", () => ({
  default: {
    prd1BaseUrl: "http://localhost:8000",
    nodeEnv: "test",
  },
}));

describe("analyzeTranscript", () => {
  let analyzeTranscript;

  beforeEach(async () => {
    // Dynamic import to pick up mocks
    const mod = await import("../src/analyzer.js");
    analyzeTranscript = mod.analyzeTranscript;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call PRD-1 /api/v1/analyze with correct body", async () => {
    const mockResponse = {
      verdict: "FRAUD",
      risk_score: 0.92,
      scam_type: "KYC",
      entities: { upi_ids: ["fraud@ybl"] },
      flags: { urgency_pressure: true },
      campaign: { campaign_name: "KYC Scam Campaign", report_count: 47 },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await analyzeTranscript(
      "Your KYC has expired, share OTP",
      "+919876543210"
    );

    // Verify the fetch call
    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/v1/analyze");
    expect(options.method).toBe("POST");

    const body = JSON.parse(options.body);
    expect(body.message).toBe("Your KYC has expired, share OTP");
    expect(body.source).toBe("call");

    // Verify response mapping
    expect(result.verdict).toBe("FRAUD");
    expect(result.risk_score).toBe(0.92);
    expect(result.scam_type).toBe("KYC");
    expect(result.entities.upi_ids).toEqual(["fraud@ybl"]);
    expect(result.campaign.campaign_name).toBe("KYC Scam Campaign");
  });

  it("should return safe default when PRD-1 returns non-200", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const result = await analyzeTranscript("test transcript");

    expect(result.verdict).toBe("SAFE");
    expect(result.risk_score).toBe(0);
    expect(result._fallback).toBe(true);
  });

  it("should return safe default when PRD-1 is unreachable", async () => {
    fetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const result = await analyzeTranscript("test transcript");

    expect(result.verdict).toBe("SAFE");
    expect(result.risk_score).toBe(0);
    expect(result._fallback).toBe(true);
  });

  it("should handle missing fields in PRD-1 response", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ verdict: "SUSPICIOUS" }),
    });

    const result = await analyzeTranscript("test");

    expect(result.verdict).toBe("SUSPICIOUS");
    expect(result.risk_score).toBe(0);
    expect(result.scam_type).toBeNull();
    expect(result.entities).toEqual({});
    expect(result.flags).toEqual({});
    expect(result.campaign).toBeNull();
  });
});
