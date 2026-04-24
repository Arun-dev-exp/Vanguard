/**
 * Demo fixtures for predictable testing & demos.
 * fraudster@ybl  → always BLOCK
 * friend@okaxis  → always ALLOW
 */

const DEMO_ENTITIES = [
  {
    entity_value: 'fraudster@ybl',
    entity_type: 'UPI',
    risk_score: 0.95,
    report_count: 47,
    campaigns: JSON.stringify(['camp_kyc_001', 'camp_lottery_002']),
    status: 'REPORTED',
  },
  {
    entity_value: 'scammer@paytm',
    entity_type: 'UPI',
    risk_score: 0.82,
    report_count: 23,
    campaigns: JSON.stringify(['camp_refund_003']),
    status: 'ACTIVE',
  },
  {
    entity_value: 'friend@okaxis',
    entity_type: 'UPI',
    risk_score: 0.02,
    report_count: 0,
    campaigns: JSON.stringify([]),
    status: 'ACTIVE',
  },
];

/**
 * Mock PRD-1 responses keyed by UPI ID.
 * Unknown UPIs get a deterministic random-ish response.
 */
const MOCK_PRD1_RESPONSES = {
  'fraudster@ybl': {
    risk_score: 0.92,
    verdict: 'FRAUD',
    campaign: {
      campaign_id: 'camp_kyc_001',
      campaign_name: 'KYC Scam Campaign',
      report_count: 47,
      estimated_loss_inr: 230000,
    },
    flags: {
      suspicious_link: true,
      urgent_language: true,
      impersonation: true,
      monetary_request: true,
    },
    entities: [
      { type: 'UPI', value: 'fraudster@ybl' },
      { type: 'URL', value: 'http://fake-kyc-update.in/verify' },
    ],
  },
  'scammer@paytm': {
    risk_score: 0.78,
    verdict: 'FRAUD',
    campaign: {
      campaign_id: 'camp_refund_003',
      campaign_name: 'Fake Refund Campaign',
      report_count: 23,
      estimated_loss_inr: 89000,
    },
    flags: {
      suspicious_link: true,
      urgent_language: false,
      impersonation: true,
      monetary_request: true,
    },
    entities: [
      { type: 'UPI', value: 'scammer@paytm' },
    ],
  },
  'friend@okaxis': {
    risk_score: 0.03,
    verdict: 'SAFE',
    campaign: null,
    flags: {
      suspicious_link: false,
      urgent_language: false,
      impersonation: false,
      monetary_request: false,
    },
    entities: [],
  },
};

/**
 * Generate a deterministic mock response for unknown UPI IDs.
 * Uses a simple hash to produce a consistent risk_score.
 */
function getMockPrd1Response(upiId) {
  if (MOCK_PRD1_RESPONSES[upiId]) {
    return MOCK_PRD1_RESPONSES[upiId];
  }

  // Simple hash → deterministic score between 0.05 and 0.45 (LOW range)
  let hash = 0;
  for (let i = 0; i < upiId.length; i++) {
    hash = ((hash << 5) - hash + upiId.charCodeAt(i)) | 0;
  }
  const normalizedScore = 0.05 + (Math.abs(hash) % 40) / 100;

  return {
    risk_score: parseFloat(normalizedScore.toFixed(2)),
    verdict: 'SAFE',
    campaign: null,
    flags: {
      suspicious_link: false,
      urgent_language: false,
      impersonation: false,
      monetary_request: false,
    },
    entities: [],
  };
}

module.exports = { DEMO_ENTITIES, MOCK_PRD1_RESPONSES, getMockPrd1Response };
