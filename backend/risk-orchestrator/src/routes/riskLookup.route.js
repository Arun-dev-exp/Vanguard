const express = require('express');
const router = express.Router();

const EntityRegistryService = require('../services/entityRegistry.service');

/**
 * GET /api/v1/risk/:upi_id
 * Entity Risk Lookup — used by PRD-3 (Frontend/Dashboard).
 */
router.get('/:upi_id', async (req, res, next) => {
  try {
    const { upi_id } = req.params;

    const entity = await EntityRegistryService.getEntityRisk(upi_id);

    if (!entity) {
      return res.status(404).json({
        error: 'ENTITY_NOT_FOUND',
        message: `No risk data found for UPI ID: ${upi_id}`,
      });
    }

    // Parse campaigns if stored as string
    let campaigns = entity.campaigns;
    if (typeof campaigns === 'string') {
      try {
        campaigns = JSON.parse(campaigns);
      } catch {
        campaigns = [];
      }
    }

    // Map risk_score to risk_level
    let riskLevel = 'LOW';
    if (entity.risk_score >= 0.80) riskLevel = 'HIGH';
    else if (entity.risk_score >= 0.50) riskLevel = 'MEDIUM';

    // Override based on status
    if (entity.status === 'REPORTED') riskLevel = 'HIGH';

    res.status(200).json({
      upi_id: entity.entity_value,
      risk_level: riskLevel,
      risk_score: entity.risk_score,
      report_count: entity.report_count,
      status: entity.status,
      campaigns: campaigns,
      last_updated: entity.updated_at,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
