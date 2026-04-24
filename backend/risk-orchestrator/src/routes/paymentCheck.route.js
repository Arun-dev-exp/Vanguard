const express = require('express');
const router = express.Router();

const { validatePaymentCheck } = require('../middleware/validator');
const rateLimiter = require('../middleware/rateLimiter');
const Prd1ClientService = require('../services/prd1Client.service');
const EntityRegistryService = require('../services/entityRegistry.service');
const RiskScoringService = require('../services/riskScoring.service');
const PaymentCheckModel = require('../models/paymentCheck.model');
const { emitFraudAlert } = require('../websocket/alertHandler');
const { generateRequestId } = require('../utils/idGenerator');

/**
 * POST /api/v1/payment/check
 * Core payment interception endpoint.
 * This is the "winning moment" — intercepts fraud in real-time.
 */
router.post(
  '/check',
  validatePaymentCheck,
  rateLimiter,
  async (req, res, next) => {
    try {
      const { upi_id, amount, user_id } = req.body;
      const requestId = generateRequestId();

      console.log(`\n💳 Payment check: ${upi_id} | ₹${amount} | user: ${user_id} | req: ${requestId}`);

      // ── Step 1: Get or create entity in registry ──
      const entity = await EntityRegistryService.getOrCreateEntity(upi_id);

      // ── Step 2: Call PRD-1 for AI analysis ──
      const prd1Response = await Prd1ClientService.analyze(upi_id);

      // ── Step 3: Update entity registry from PRD-1 results ──
      await EntityRegistryService.updateFromPrd1Response(upi_id, prd1Response);

      // Refresh entity after update
      const updatedEntity = await EntityRegistryService.getEntityRisk(upi_id);

      // ── Step 4: Compute composite risk score ──
      const riskResult = RiskScoringService.computeRisk({
        aiScore: prd1Response.risk_score || 0,
        reportCount: updatedEntity?.report_count || 0,
        entityScore: updatedEntity?.risk_score || 0,
        entityStatus: updatedEntity?.status || 'ACTIVE',
        amount,
      });

      console.log(
        `   → Decision: ${riskResult.decision} | Score: ${riskResult.compositeScore} | Level: ${riskResult.riskLevel}`
      );
      if (riskResult.escalations.length > 0) {
        console.log(`   → Escalations: ${riskResult.escalations.join(', ')}`);
      }

      // ── Step 5: Build fraud context (for HIGH risk) ──
      let fraudContext = null;
      if (riskResult.riskLevel === 'HIGH' && prd1Response.campaign) {
        fraudContext = {
          campaign_name: prd1Response.campaign.campaign_name || null,
          report_count: prd1Response.campaign.report_count || 0,
          estimated_loss_inr: prd1Response.campaign.estimated_loss_inr || 0,
          flags: prd1Response.flags || {},
        };
      }

      // ── Step 6: Log to payment_checks ──
      await PaymentCheckModel.create({
        user_id,
        upi_id,
        amount,
        decision: riskResult.decision,
        risk_level: riskResult.riskLevel,
        composite_score: riskResult.compositeScore,
        breakdown: riskResult.breakdown,
        fraud_context: fraudContext,
      });

      // ── Step 7: Emit WebSocket alert for BLOCK ──
      if (riskResult.decision === 'BLOCK') {
        emitFraudAlert({
          upi_id,
          risk_level: riskResult.riskLevel,
          composite_score: riskResult.compositeScore,
          campaign_name: prd1Response.campaign?.campaign_name,
          report_count: prd1Response.campaign?.report_count || 0,
          amount,
          estimated_loss_inr: prd1Response.campaign?.estimated_loss_inr || 0,
        });
      }

      // ── Step 8: Build response per API contract ──
      const response = {
        request_id: requestId,
        upi_id,
        decision: riskResult.decision,
        risk_level: riskResult.riskLevel,
        composite_score: riskResult.compositeScore,
        breakdown: riskResult.breakdown,
        ...(fraudContext && { fraud_context: fraudContext }),
        checked_at: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
