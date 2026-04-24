const express = require('express');
const router = express.Router();

const cache = require('../cache/inMemoryCache');
const { getStats } = require('../websocket/alertHandler');

/**
 * GET /health
 * Health check endpoint — returns server status, uptime, and connection info.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'vanguard-risk-orchestrator',
    version: '1.0.0',
    uptime_seconds: Math.floor(process.uptime()),
    cache: cache.stats(),
    websocket: getStats(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
