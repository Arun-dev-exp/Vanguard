// ============================================================
// Unit Test: risk-mapper.js
// Verifies risk level mapping and alert severity logic
// See PRD §6
// ============================================================

import { describe, it, expect } from "vitest";
import {
  mapRiskLevel,
  getAlertSeverity,
  hasUpiIds,
  shouldReportCaller,
} from "../src/risk-mapper.js";

describe("mapRiskLevel", () => {
  it("should use PRD-2 risk level when available", () => {
    const result = mapRiskLevel({
      risk_score: 0.60,
      _riskLevel: "HIGH",
      _compositeScore: 0.92,
    });

    expect(result.riskLevel).toBe("HIGH");
    expect(result.score).toBe(0.92);
  });

  it("should derive HIGH from PRD-1 score >= 0.80", () => {
    const result = mapRiskLevel({ risk_score: 0.85 });
    expect(result.riskLevel).toBe("HIGH");
    expect(result.score).toBe(0.85);
  });

  it("should derive MEDIUM from PRD-1 score 0.50-0.79", () => {
    const result = mapRiskLevel({ risk_score: 0.65 });
    expect(result.riskLevel).toBe("MEDIUM");
    expect(result.score).toBe(0.65);
  });

  it("should derive LOW from PRD-1 score < 0.50", () => {
    const result = mapRiskLevel({ risk_score: 0.30 });
    expect(result.riskLevel).toBe("LOW");
    expect(result.score).toBe(0.30);
  });

  it("should handle zero score", () => {
    const result = mapRiskLevel({ risk_score: 0 });
    expect(result.riskLevel).toBe("LOW");
  });

  it("should handle missing score", () => {
    const result = mapRiskLevel({});
    expect(result.riskLevel).toBe("LOW");
    expect(result.score).toBe(0);
  });
});

describe("getAlertSeverity", () => {
  // PRD §6 mapping table

  it("should return null for LOW risk", () => {
    const result = getAlertSeverity("LOW", 0.30, 0);
    expect(result.severity).toBeNull();
    expect(result.tier).toBe(0);
  });

  it("should return warning for MEDIUM risk (first alert)", () => {
    const result = getAlertSeverity("MEDIUM", 0.65, 0);
    expect(result.severity).toBe("warning");
    expect(result.tier).toBe(1);
  });

  it("should return high for HIGH risk with score < 0.85", () => {
    const result = getAlertSeverity("HIGH", 0.82, 0);
    expect(result.severity).toBe("high");
    expect(result.tier).toBe(2);
  });

  it("should return danger for HIGH risk with score >= 0.85", () => {
    const result = getAlertSeverity("HIGH", 0.92, 0);
    expect(result.severity).toBe("danger");
    expect(result.tier).toBe(3);
  });

  // Escalation-only tests
  it("should NOT downgrade from danger to high", () => {
    const result = getAlertSeverity("HIGH", 0.82, 3);
    expect(result.severity).toBeNull(); // Already at tier 3
    expect(result.tier).toBe(3);
  });

  it("should NOT downgrade from high to warning", () => {
    const result = getAlertSeverity("MEDIUM", 0.65, 2);
    expect(result.severity).toBeNull(); // Already at tier 2
    expect(result.tier).toBe(2);
  });

  it("should escalate from warning to high", () => {
    const result = getAlertSeverity("HIGH", 0.82, 1);
    expect(result.severity).toBe("high");
    expect(result.tier).toBe(2);
  });

  it("should escalate from warning to danger directly", () => {
    const result = getAlertSeverity("HIGH", 0.92, 1);
    expect(result.severity).toBe("danger");
    expect(result.tier).toBe(3);
  });

  it("should escalate from high to danger", () => {
    const result = getAlertSeverity("HIGH", 0.88, 2);
    expect(result.severity).toBe("danger");
    expect(result.tier).toBe(3);
  });

  it("should NOT send duplicate warning", () => {
    const result = getAlertSeverity("MEDIUM", 0.72, 1);
    expect(result.severity).toBeNull();
    expect(result.tier).toBe(1);
  });
});

describe("hasUpiIds", () => {
  it("should return true when UPI IDs present", () => {
    expect(hasUpiIds({ entities: { upi_ids: ["fraud@ybl"] } })).toBe(true);
  });

  it("should return false when no UPI IDs", () => {
    expect(hasUpiIds({ entities: { upi_ids: [] } })).toBe(false);
  });

  it("should return false when entities missing", () => {
    expect(hasUpiIds({})).toBe(false);
  });
});

describe("shouldReportCaller", () => {
  it("should return true for FRAUD verdict", () => {
    expect(shouldReportCaller({ verdict: "FRAUD" })).toBe(true);
  });

  it("should return false for SAFE verdict", () => {
    expect(shouldReportCaller({ verdict: "SAFE" })).toBe(false);
  });

  it("should return false for SUSPICIOUS verdict", () => {
    expect(shouldReportCaller({ verdict: "SUSPICIOUS" })).toBe(false);
  });
});
