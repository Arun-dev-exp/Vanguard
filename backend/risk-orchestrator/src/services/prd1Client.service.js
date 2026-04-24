const config = require('../config');
const cache = require('../cache/inMemoryCache');
const { getMockPrd1Response } = require('../utils/demoFixtures');

/**
 * PRD-1 AI Engine Client.
 * If PRD1_BASE_URL is configured → real HTTP call.
 * Otherwise → returns mock response from demo fixtures.
 */
const Prd1ClientService = {
  /**
   * Analyze a UPI ID via PRD-1 (or mock).
   * Results are cached with TTL.
   */
  async analyze(upiId) {
    // Check cache first
    const cacheKey = `prd1:${upiId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return { ...cached, _cached: true };
    }

    let result;

    if (config.prd1BaseUrl) {
      // ── Real HTTP call to PRD-1 ──
      result = await this._callRealPrd1(upiId);
    } else {
      // ── Mock mode ──
      result = getMockPrd1Response(upiId);
    }

    // Cache the result
    cache.set(cacheKey, result);

    return { ...result, _cached: false };
  },

  /**
   * Make actual HTTP call to PRD-1.
   */
  async _callRealPrd1(upiId) {
    const url = `${config.prd1BaseUrl}/api/v1/analyze`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Payment to ${upiId}`,
        sender_upi: 'user@upi',
        entities: [{ type: 'UPI', value: upiId }],
      }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) {
      throw new Error(`PRD-1 returned ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};

module.exports = Prd1ClientService;
