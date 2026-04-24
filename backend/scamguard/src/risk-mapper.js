// ============================================================
// ScamGuard — Risk Level Mapper
// Maps PRD-2 composite risk → Telegram alert severity
// See PRD §6
// ============================================================

/**
 * Derive risk level from PRD-2 composite score or PRD-1 raw score.
 *
 * Priority: PRD-2 composite (from payment/check) > PRD-1 raw score
 *
 * @param {object} prd1Result - Analysis result (may include _riskLevel from PRD-2)
 * @returns {{ riskLevel: string, score: number }}
 */
export function mapRiskLevel(prd1Result) {
  // If PRD-2 already set a risk level (via payment/check), use it
  if (prd1Result._riskLevel) {
    return {
      riskLevel: prd1Result._riskLevel,
      score: prd1Result._compositeScore || prd1Result.risk_score,
    };
  }

  // Fall back to PRD-1 raw score → risk level derivation
  const score = prd1Result.risk_score || 0;

  let riskLevel;
  if (score >= 0.80) {
    riskLevel = "HIGH";
  } else if (score >= 0.50) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  return { riskLevel, score };
}

/**
 * Determine what alert severity to send (if any).
 * Alerts only escalate — never downgrade.
 *
 * | PRD-2 Risk Level | Score     | Alert      | highestAlertSent |
 * |------------------|-----------|------------|------------------|
 * | LOW              | < 0.50    | None       | 0                |
 * | MEDIUM           | 0.50–0.79 | 🟡 Warning | 1                |
 * | HIGH             | 0.80–0.84 | 🟠 High    | 2                |
 * | HIGH             | ≥ 0.85    | 🔴 DANGER  | 3                |
 *
 * @param {string} riskLevel - "LOW" | "MEDIUM" | "HIGH"
 * @param {number} score - Composite or raw score (0.00–1.00)
 * @param {number} highestAlertSent - Highest alert tier already sent (0–3)
 * @returns {{ severity: string|null, tier: number }}
 */
export function getAlertSeverity(riskLevel, score, highestAlertSent = 0) {
  if (riskLevel === "HIGH" && score >= 0.85 && highestAlertSent < 3) {
    return { severity: "danger", tier: 3 };
  }

  if (riskLevel === "HIGH" && highestAlertSent < 2) {
    return { severity: "high", tier: 2 };
  }

  if (riskLevel === "MEDIUM" && highestAlertSent < 1) {
    return { severity: "warning", tier: 1 };
  }

  // No alert needed (LOW risk or already sent this tier)
  return { severity: null, tier: highestAlertSent };
}

/**
 * Check if UPI IDs are present in PRD-1 entities and need PRD-2 payment check.
 */
export function hasUpiIds(prd1Result) {
  return (
    prd1Result.entities?.upi_ids?.length > 0
  );
}

/**
 * Check if the caller should be reported to PRD-2 entity registry.
 */
export function shouldReportCaller(prd1Result) {
  return prd1Result.verdict === "FRAUD";
}
