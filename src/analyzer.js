// ============================================================
// ScamGuard — PRD-1 Analyzer Integration
// Replaces the old direct Claude call with PRD-1 API
// See PRD §5.1
// ============================================================

import config from "./config.js";

/**
 * Analyze a transcript chunk via PRD-1's /api/v1/analyze endpoint.
 *
 * @param {string} transcript  - The transcript text to analyze
 * @param {string} callerNumber - The caller's phone number (for context)
 * @returns {object} PRD-1 analysis result:
 *   { verdict, risk_score, scam_type, entities, flags, campaign }
 */
export async function analyzeTranscript(transcript, callerNumber = "") {
  try {
    const response = await fetch(`${config.prd1BaseUrl}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: transcript,
        source: "call",
        metadata: { caller_number: callerNumber },
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      console.error(
        `[Analyzer] PRD-1 returned ${response.status}: ${response.statusText}`
      );
      return safeDefault();
    }

    const data = await response.json();

    // Validate expected fields
    return {
      verdict: data.verdict || "SAFE",
      risk_score: typeof data.risk_score === "number" ? data.risk_score : 0,
      scam_type: data.scam_type || null,
      entities: data.entities || {},
      flags: data.flags || {},
      campaign: data.campaign || null,
    };
  } catch (err) {
    // Graceful degradation — if PRD-1 is down, don't crash the call
    console.error("[Analyzer] PRD-1 call failed:", err.message);
    return safeDefault();
  }
}

/**
 * Safe default when PRD-1 is unreachable.
 * Returns a SAFE verdict so we don't block legitimate calls.
 */
function safeDefault() {
  return {
    verdict: "SAFE",
    risk_score: 0,
    scam_type: null,
    entities: {},
    flags: {},
    campaign: null,
    _fallback: true,
  };
}
