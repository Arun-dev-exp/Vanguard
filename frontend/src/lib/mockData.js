// =============================================
// VANGUARD SOC — Mock Data
// =============================================

export const campaigns = [
  {
    id: 'camp-001',
    name: 'KYC Scam',
    threatLevel: 'CRITICAL',
    threatColor: '#ffb4ab',
    dotColor: '#ffb4ab',
    bgColor: 'rgba(255,180,171,0.1)',
    borderColor: 'border-error',
    reports: 1247,
    firstSeen: '2026-04-22T08:30:00Z',
    lastActive: '2026-04-24T14:00:00Z',
    messages: [
      '"Dear Customer, Your KYC has expired. Update now to avoid account block: bit.ly/kyc-upd8"',
      '"Bank Alert: Mandatory KYC verification required. Click link bit.ly/kyc-upd8 within 24hrs."',
      '"Account Suspended: Complete pending KYC via bit.ly/kyc-upd8 to restore access."',
    ],
    entities: {
      urls: ['bit.ly/kyc-upd8', 'kyc-verify.fraudsite.com'],
      upiIds: ['fraudster@upi', 'kychelp@ybl'],
      phones: ['+91 98765 43210', '+91 87654 32109'],
    },
    timeline: [
      { time: 'TODAY, 14:00 IST', event: 'Spike in SMS volume detected (400/min)', active: true },
      { time: 'TODAY, 12:30 IST', event: 'First malicious URL instance logged', active: false },
      { time: 'TODAY, 09:15 IST', event: 'Pattern match triggered on UPI ID cluster', active: false },
      { time: 'YESTERDAY, 22:00 IST', event: 'Campaign seed identified in dark web chatter', active: false },
    ],
  },
  {
    id: 'camp-002',
    name: 'Electricity Scam',
    threatLevel: 'HIGH',
    threatColor: '#FF9F0A',
    dotColor: '#FF9F0A',
    bgColor: 'rgba(255,159,10,0.1)',
    borderColor: 'border-[#FF9F0A]',
    reports: 634,
    firstSeen: '2026-04-20T10:00:00Z',
    lastActive: '2026-04-24T11:30:00Z',
    messages: [
      '"URGENT: Your electricity connection will be disconnected today. Pay pending bill: bit.ly/elec-pay"',
      '"Final Notice: Rs.4,500 due. Pay now or face disconnection: bit.ly/elec-pay"',
    ],
    entities: {
      urls: ['bit.ly/elec-pay', 'elec-bill.scamsite.in'],
      upiIds: ['elecbill@paytm', 'govpay@ybl'],
      phones: ['+91 76543 21098'],
    },
    timeline: [
      { time: 'TODAY, 11:30 IST', event: 'New SMS template variant detected', active: true },
      { time: 'YESTERDAY, 16:00 IST', event: 'Cross-referenced with electricity board database', active: false },
    ],
  },
  {
    id: 'camp-003',
    name: 'Prize Scam',
    threatLevel: 'MEDIUM',
    threatColor: '#FFD60A',
    dotColor: '#FFD60A',
    bgColor: 'rgba(255,214,10,0.1)',
    borderColor: 'border-[#FFD60A]',
    reports: 289,
    firstSeen: '2026-04-18T14:00:00Z',
    lastActive: '2026-04-23T20:00:00Z',
    messages: [
      '"Congratulations! You have won Rs.50,000 in Lucky Draw. Claim now: bit.ly/prize-claim"',
      '"Dear winner, your prize of Rs.1,00,000 is pending. Verify: bit.ly/prize-claim"',
    ],
    entities: {
      urls: ['bit.ly/prize-claim'],
      upiIds: ['prizewin@ybl'],
      phones: ['+91 65432 10987', '+91 54321 09876'],
    },
    timeline: [
      { time: 'YESTERDAY, 20:00 IST', event: 'Phishing page flagged by ML model', active: true },
      { time: 'APR 22, 15:00 IST', event: 'First report submitted by bank partner', active: false },
    ],
  },
];

export const stats = {
  totalScams: 4821,
  activeCampaigns: 3,
  highRiskAlerts: 12,
  systemStatus: 'LIVE',
};

// Fraud Shield data
export const fraudShieldData = {
  networkNodes: [
    { id: 'n1', label: 'fraudster@upi', type: 'upi', risk: 'critical', x: 50, y: 30, connections: ['n2', 'n3', 'n5'] },
    { id: 'n2', label: 'kychelp@ybl', type: 'upi', risk: 'high', x: 25, y: 55, connections: ['n1', 'n4'] },
    { id: 'n3', label: 'bit.ly/kyc-upd8', type: 'url', risk: 'critical', x: 75, y: 20, connections: ['n1'] },
    { id: 'n4', label: '+91 98765 43210', type: 'phone', risk: 'high', x: 15, y: 80, connections: ['n2', 'n6'] },
    { id: 'n5', label: 'elecbill@paytm', type: 'upi', risk: 'medium', x: 70, y: 60, connections: ['n1', 'n6'] },
    { id: 'n6', label: 'govpay@ybl', type: 'upi', risk: 'high', x: 45, y: 75, connections: ['n4', 'n5'] },
    { id: 'n7', label: 'prizewin@ybl', type: 'upi', risk: 'medium', x: 85, y: 45, connections: ['n5'] },
    { id: 'n8', label: 'bit.ly/elec-pay', type: 'url', risk: 'high', x: 60, y: 85, connections: ['n5', 'n6'] },
  ],
  activityFeed: [
    { id: 'af1', time: '14:22:05', type: 'alert', message: 'New UPI ID cluster detected — 3 linked accounts', severity: 'critical' },
    { id: 'af2', time: '14:18:32', type: 'scan', message: 'ML model completed pattern scan on 1,200 transactions', severity: 'info' },
    { id: 'af3', time: '14:15:10', type: 'block', message: 'UPI ID fraudster@upi flagged by partner bank ICICI', severity: 'high' },
    { id: 'af4', time: '14:10:45', type: 'alert', message: 'Suspicious URL bit.ly/kyc-upd8 appeared in 45 new SMS', severity: 'critical' },
    { id: 'af5', time: '14:05:22', type: 'scan', message: 'Dark web scraper found new KYC scam kit listing', severity: 'high' },
    { id: 'af6', time: '13:58:11', type: 'resolve', message: 'Takedown completed for phishing domain kyc-verify.fraudsite.com', severity: 'success' },
    { id: 'af7', time: '13:50:00', type: 'alert', message: 'Cross-bank transaction anomaly — Rs.2.3 Cr in 6 hours', severity: 'critical' },
    { id: 'af8', time: '13:42:30', type: 'block', message: 'Phone +91 98765 43210 added to telecom blocklist', severity: 'info' },
  ],
};

// Action Center data
export const actionCenterData = {
  activeThreats: [
    { id: 'at1', name: 'KYC Scam Campaign', severity: 'CRITICAL', entities: 5, reports: 1247, lastSeen: '2 min ago', status: 'active' },
    { id: 'at2', name: 'Electricity Bill Fraud', severity: 'HIGH', entities: 3, reports: 634, lastSeen: '15 min ago', status: 'active' },
    { id: 'at3', name: 'Prize/Lottery Scam', severity: 'MEDIUM', entities: 4, reports: 289, lastSeen: '4 hrs ago', status: 'monitoring' },
    { id: 'at4', name: 'Loan App Fraud Ring', severity: 'HIGH', entities: 8, reports: 156, lastSeen: '1 hr ago', status: 'active' },
  ],
  responseTimeline: [
    { time: '14:22 IST', action: 'UPI Block', target: 'fraudster@upi', status: 'completed', actor: 'Auto — ML Engine' },
    { time: '14:15 IST', action: 'URL Takedown', target: 'bit.ly/kyc-upd8', status: 'in-progress', actor: 'Analyst — Tier 1' },
    { time: '13:58 IST', action: 'Domain Block', target: 'kyc-verify.fraudsite.com', status: 'completed', actor: 'Auto — Policy Engine' },
    { time: '13:42 IST', action: 'Phone Block', target: '+91 98765 43210', status: 'completed', actor: 'Telecom API' },
    { time: '12:30 IST', action: 'Alert Raised', target: 'KYC Scam Campaign', status: 'completed', actor: 'ML Detection' },
    { time: '09:15 IST', action: 'Pattern Match', target: 'UPI Cluster #47', status: 'completed', actor: 'Auto — ML Engine' },
  ],
};

// Policy Control data
export const policyControlData = {
  rules: [
    { id: 'r1', name: 'UPI Velocity Check', description: 'Block UPI IDs exceeding 50 transactions/hour', status: 'active', severity: 'critical', autoAction: true, threshold: 50, lastTriggered: '2 min ago' },
    { id: 'r2', name: 'Phishing URL Detector', description: 'Auto-flag URLs matching known phishing patterns', status: 'active', severity: 'high', autoAction: true, threshold: 0.85, lastTriggered: '15 min ago' },
    { id: 'r3', name: 'Cross-Bank Amount Anomaly', description: 'Alert on cross-bank transfers >Rs.5L in 24hrs', status: 'active', severity: 'high', autoAction: false, threshold: 500000, lastTriggered: '1 hr ago' },
    { id: 'r4', name: 'New Account Fraud Score', description: 'Flag accounts <30 days with high-value transactions', status: 'active', severity: 'medium', autoAction: true, threshold: 0.7, lastTriggered: '3 hrs ago' },
    { id: 'r5', name: 'SMS Template Match', description: 'Detect messages matching known scam templates', status: 'paused', severity: 'medium', autoAction: false, threshold: 0.9, lastTriggered: '1 day ago' },
    { id: 'r6', name: 'Geo-Velocity Check', description: 'Flag transactions from >2 states within 1 hour', status: 'active', severity: 'high', autoAction: true, threshold: 2, lastTriggered: '45 min ago' },
  ],
  riskThresholds: {
    critical: { min: 90, max: 100, color: '#ffb4ab' },
    high: { min: 70, max: 89, color: '#FF9F0A' },
    medium: { min: 40, max: 69, color: '#FFD60A' },
    low: { min: 0, max: 39, color: '#47e266' },
  },
};

// System Health data
export const systemHealthData = {
  services: [
    { id: 's1', name: 'API Gateway', status: 'operational', uptime: 99.97, latency: '12ms', load: 34 },
    { id: 's2', name: 'ML Engine', status: 'operational', uptime: 99.92, latency: '45ms', load: 67 },
    { id: 's3', name: 'Database Cluster', status: 'operational', uptime: 99.99, latency: '3ms', load: 42 },
    { id: 's4', name: 'Message Queue', status: 'degraded', uptime: 98.5, latency: '120ms', load: 89 },
    { id: 's5', name: 'Threat Intel Feed', status: 'operational', uptime: 99.85, latency: '200ms', load: 23 },
    { id: 's6', name: 'Notification Service', status: 'operational', uptime: 99.95, latency: '8ms', load: 15 },
  ],
  performanceMetrics: {
    cpu: [45, 52, 48, 67, 55, 42, 58, 63, 51, 47, 53, 49],
    memory: [62, 64, 63, 68, 71, 65, 67, 70, 66, 64, 69, 67],
    networkIO: [120, 145, 132, 198, 167, 142, 155, 178, 161, 139, 148, 152],
    requestsPerSec: [2400, 2800, 2600, 3200, 2900, 2500, 2700, 3100, 2850, 2650, 2750, 2680],
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  },
  recentLogs: [
    { id: 'l1', timestamp: '14:22:05.123', level: 'ERROR', service: 'Message Queue', message: 'Connection timeout to broker node-3 (retry 2/5)' },
    { id: 'l2', timestamp: '14:22:04.891', level: 'INFO', service: 'ML Engine', message: 'Model v3.2.1 inference batch completed — 1,200 records processed' },
    { id: 'l3', timestamp: '14:22:03.456', level: 'WARN', service: 'API Gateway', message: 'Rate limit approaching for partner endpoint /v2/check-upi (80%)' },
    { id: 'l4', timestamp: '14:22:02.789', level: 'INFO', service: 'Threat Intel Feed', message: 'Feed sync completed — 45 new IOCs ingested from CERT-IN' },
    { id: 'l5', timestamp: '14:22:01.234', level: 'INFO', service: 'Database', message: 'Query optimization applied to campaign_entities index' },
    { id: 'l6', timestamp: '14:21:59.567', level: 'ERROR', service: 'Message Queue', message: 'Connection timeout to broker node-3 (retry 1/5)' },
    { id: 'l7', timestamp: '14:21:58.012', level: 'INFO', service: 'API Gateway', message: 'Health check passed — all upstream services responsive' },
    { id: 'l8', timestamp: '14:21:55.890', level: 'WARN', service: 'Notification Service', message: 'SMS delivery delayed — telecom partner response >500ms' },
    { id: 'l9', timestamp: '14:21:53.345', level: 'INFO', service: 'ML Engine', message: 'Feature extraction pipeline started for batch #4821' },
    { id: 'l10', timestamp: '14:21:50.678', level: 'INFO', service: 'Database', message: 'Replication lag within acceptable threshold (< 50ms)' },
  ],
};

// Navigation items mapping Stitch labels to routes
export const navItems = [
  { label: 'Live Monitoring', icon: 'radar', path: '/dashboard', filled: true },
  { label: 'Threat Hunt', icon: 'query_stats', path: '/fraud-shield', filled: false },
  { label: 'Takedown Lab', icon: 'security', path: '/action-center', filled: false },
  { label: 'Entity Intel', icon: 'fingerprint', path: '/policy-control', filled: false },
  { label: 'System Logs', icon: 'terminal', path: '/system-health', filled: false },
];
