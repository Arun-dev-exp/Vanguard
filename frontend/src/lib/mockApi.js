// =============================================
// VANGUARD SOC — Mock API Service
// =============================================

import { campaigns, stats } from './mockData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// POST /analyze
export async function analyzeText(text) {
  await delay(800);
  const keywords = ['kyc', 'bank', 'account', 'verify', 'update', 'suspended', 'bill', 'electricity', 'prize', 'winner', 'lottery', 'congratulations'];
  const lowerText = text.toLowerCase();
  const matchCount = keywords.filter((k) => lowerText.includes(k)).length;
  
  if (matchCount >= 3) {
    return { risk: 'HIGH', confidence: 0.95, campaign: 'KYC Scam', reports: 1247 };
  } else if (matchCount >= 2) {
    return { risk: 'MEDIUM', confidence: 0.72, campaign: 'Possible Scam', reports: 45 };
  }
  return { risk: 'LOW', confidence: 0.15, campaign: null, reports: 0 };
}

// POST /check-upi
export async function checkUPI(upiId) {
  await delay(600);
  const fraudUPIs = {
    'fraudster@upi': { risk: 'HIGH', campaign: 'KYC Scam', reports: 1247, confidence: 0.98 },
    'kychelp@ybl': { risk: 'HIGH', campaign: 'KYC Scam', reports: 634, confidence: 0.92 },
    'elecbill@paytm': { risk: 'HIGH', campaign: 'Electricity Scam', reports: 412, confidence: 0.89 },
    'govpay@ybl': { risk: 'MEDIUM', campaign: 'Electricity Scam', reports: 89, confidence: 0.71 },
    'prizewin@ybl': { risk: 'HIGH', campaign: 'Prize Scam', reports: 289, confidence: 0.94 },
  };
  
  if (fraudUPIs[upiId]) {
    return fraudUPIs[upiId];
  }
  return { risk: 'LOW', campaign: null, reports: 0, confidence: 0.05 };
}

// GET /campaigns
export async function getCampaigns() {
  await delay(400);
  return campaigns;
}

// GET /campaign/:id
export async function getCampaign(id) {
  await delay(300);
  return campaigns.find((c) => c.id === id) || null;
}

// GET /stats
export async function getStats(demoMode = false) {
  await delay(200);
  if (demoMode) {
    return {
      ...stats,
      totalScams: stats.totalScams + Math.floor(Math.random() * 10),
      highRiskAlerts: stats.highRiskAlerts + Math.floor(Math.random() * 3),
    };
  }
  return stats;
}

// POST /takedown
export async function initiateTakedown(campaignId, entityId) {
  await delay(2000);
  return {
    success: true,
    message: 'UPI blocked across network',
    timestamp: new Date().toISOString(),
    campaignId,
    entityId,
  };
}
