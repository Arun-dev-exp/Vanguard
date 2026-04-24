const express = require('express');
const router = express.Router();

const { validateActionReport } = require('../middleware/validator');
const ActionEngineService = require('../services/actionEngine.service');

/**
 * POST /api/v1/action/report
 * Flag & Report Entity — simulates reporting to NPCI/bank system.
 */
router.post(
  '/report',
  validateActionReport,
  async (req, res, next) => {
    try {
      const { entity_value, entity_type, reason, reported_by } = req.body;

      const result = await ActionEngineService.reportEntity({
        entity_value,
        entity_type,
        reason,
        reported_by,
      });

      res.status(200).json({
        report_id: result.report_id,
        status: result.status,
        message: result.message,
        reported_at: result.reported_at,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
