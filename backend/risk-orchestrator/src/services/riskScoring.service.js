const config = require('../config');

const { weights, highThreshold, mediumThreshold, escalation } = config.risk;

/**
 * Risk Scoring Service.
 * Computes composite fraud risk scores from 3 signals and applies business rules.
 *
 * Formula: composite = (ai_score × 0.5) + (campaign_score × 0.3) + (entity_score × 0.2)
 */
const RiskScoringService = {
  /**
   * Compute the full risk assessment.
   *
   * @param {Object}  params
   * @param {number}  params.aiScore       - AI risk score from PRD-1 (0.0–1.0)
   * @param {number}  params.reportCount   - Number of reports from campaign data
   * @param {number}  params.entityScore   - Entity's historical risk score (0.0–1.0)
   * @param {string}  params.entityStatus  - Entity status: ACTIVE | REPORTED | CLEARED
   * @param {number}  params.amount        - Transaction amount in INR
   * @returns {{ compositeScore, riskLevel, decision, breakdown, escalations }}
   */
  computeRisk({ aiScore, reportCount, entityScore, entityStatus, amount }) {
    // ── Normalize campaign score ──
    // 0-100 reports maps to 0.0–1.0
    const campaignScore = Math.min((reportCount || 0) / 100, 1.0);

    // ── Compute raw composite ──
    let compositeScore =
      (aiScore * weights.ai) +
      (campaignScore * weights.campaign) +
      (entityScore * weights.entity);

    // ── Apply business rule escalations ──
    const escalations = [];

    // Rule 1: report_count >= 10 → minimum MEDIUM
    if (reportCount >= escalation.reportCountFloor && compositeScore < mediumThreshold) {
      compositeScore = mediumThreshold;
      escalations.push(`report_count (${reportCount}) >= ${escalation.reportCountFloor} → floor MEDIUM`);
    }

    // Rule 2: status === REPORTED → minimum HIGH
    if (entityStatus === 'REPORTED' && compositeScore < highThreshold) {
      compositeScore = highThreshold;
      escalations.push(`entity status REPORTED → floor HIGH`);
    }

    // Rule 3: amount > ₹10,000 + MEDIUM → escalate to HIGH
    const currentLevel = this._scoreToLevel(compositeScore);
    if (amount > escalation.highAmountThreshold && currentLevel === 'MEDIUM') {
      compositeScore = highThreshold;
      escalations.push(`amount ₹${amount} > ₹${escalation.highAmountThreshold} + MEDIUM → escalate HIGH`);
    }

    // ── Clamp to [0, 1] ──
    compositeScore = Math.min(Math.max(compositeScore, 0), 1);
    compositeScore = parseFloat(compositeScore.toFixed(2));

    // ── Final risk level and decision ──
    const riskLevel = this._scoreToLevel(compositeScore);
    const decision = this._levelToDecision(riskLevel);

    return {
      compositeScore,
      riskLevel,
      decision,
      breakdown: {
        ai_score: parseFloat(aiScore.toFixed(2)),
        campaign_score: parseFloat(campaignScore.toFixed(2)),
        entity_score: parseFloat(entityScore.toFixed(2)),
      },
      escalations,
    };
  },

  /**
   * Map composite score to risk level.
   */
  _scoreToLevel(score) {
    if (score >= highThreshold) return 'HIGH';
    if (score >= mediumThreshold) return 'MEDIUM';
    return 'LOW';
  },

  /**
   * Map risk level to transaction decision.
   */
  _levelToDecision(level) {
    switch (level) {
      case 'HIGH': return 'BLOCK';
      case 'MEDIUM': return 'WARN';
      case 'LOW': return 'ALLOW';
      default: return 'ALLOW';
    }
  },
};

module.exports = RiskScoringService;
