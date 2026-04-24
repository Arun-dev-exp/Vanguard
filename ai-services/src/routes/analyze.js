const express = require('express');
const router = express.Router();
const { extractEntities } = require('../services/extraction');
const { classifyMessage } = require('../services/classification');
const { matchCampaign } = require('../services/campaign');

router.post('/analyze', async (req, res) => {
  try {
    const { message, source } = req.body;

    if (!message || message.length > 2000) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Message must be provided and not exceed 2000 characters'
      });
    }

    // Step 1 & 2 - Classification & Extraction
    const extractionResult = extractEntities(message);
    const classificationResult = classifyMessage(message, extractionResult);

    // Step 3 - Campaign Matching
    const campaignResult = await matchCampaign(message, classificationResult);

    const requestId = `req_${Math.random().toString(36).substring(2, 9)}`;
    
    res.json({
      request_id: requestId,
      verdict: classificationResult.verdict,
      risk_score: classificationResult.risk_score,
      scam_type: classificationResult.scam_type || "N/A",
      entities: extractionResult.entities,
      flags: extractionResult.flags,
      campaign: campaignResult,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing message:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
  }
});

module.exports = router;
