const request = require('supertest');
const app = require('../src/server'); // We need to export app from server.js

describe('POST /api/v1/analyze', () => {
  it('should analyze a SAFE message', async () => {
    const response = await request(app)
      .post('/api/v1/analyze')
      .send({
        message: 'Hey, are we still meeting for lunch today at 1?',
        source: 'sms'
      });

    expect(response.status).toBe(200);
    expect(response.body.verdict).toBe('SAFE');
    expect(response.body.risk_score).toBeLessThan(0.70);
    expect(response.body.entities.urls.length).toBe(0);
    expect(response.body.campaign).toBeNull();
  });

  it('should analyze a FRAUD message', async () => {
    const response = await request(app)
      .post('/api/v1/analyze')
      .send({
        message: 'Dear Customer, your HDFC bank KYC has expired. Update immediately via this link http://fake-kyc.in or your account will be blocked.',
        source: 'sms'
      });

    expect(response.status).toBe(200);
    expect(response.body.verdict).toBe('FRAUD');
    expect(response.body.risk_score).toBeGreaterThanOrEqual(0.70);
    expect(response.body.flags.suspicious_link).toBe(true);
    expect(response.body.flags.urgent_language).toBe(true);
    expect(response.body.flags.impersonation).toBe(true);
    expect(response.body.entities.urls).toContain('http://fake-kyc.in');
    
    // Campaign should be mocked if Supabase is not configured
    expect(response.body.campaign).not.toBeNull();
    expect(response.body.campaign.campaign_name).toContain('KYC Scam Campaign');
  }, 10000); // 10s timeout since transformers model might download

  it('should return 400 for message exceeding limit', async () => {
    const longMessage = 'A'.repeat(2001);
    const response = await request(app)
      .post('/api/v1/analyze')
      .send({
        message: longMessage,
        source: 'sms'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_INPUT');
  });
});
