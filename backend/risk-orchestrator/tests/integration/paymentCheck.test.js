/**
 * Integration tests for the Payment Check API.
 * Tests the full HTTP flow without requiring a real Supabase connection.
 */
const request = require('supertest');

// Mock Supabase before requiring server
jest.mock('../../src/db/supabase', () => {
  // In-memory store to simulate Supabase
  const entities = new Map();
  entities.set('fraudster@ybl', {
    id: '00000000-0000-0000-0000-000000000001',
    entity_value: 'fraudster@ybl',
    entity_type: 'UPI',
    risk_score: 0.95,
    report_count: 47,
    campaigns: ['camp_kyc_001'],
    status: 'REPORTED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  entities.set('friend@okaxis', {
    id: '00000000-0000-0000-0000-000000000002',
    entity_value: 'friend@okaxis',
    entity_type: 'UPI',
    risk_score: 0.02,
    report_count: 0,
    campaigns: [],
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const mockSupabase = {
    from: (table) => ({
      select: (cols, opts) => {
        const chain = {
          eq: (col, val) => {
            if (table === 'entity_risks') {
              return {
                maybeSingle: async () => ({ data: entities.get(val) || null, error: null }),
              };
            }
            return { maybeSingle: async () => ({ data: null, error: null }) };
          },
          gte: () => chain,
        };
        if (opts && opts.head) {
          chain.eq = (col, val) => ({
            gte: () => Promise.resolve({ count: 0, error: null }),
          });
        }
        return chain;
      },
      insert: (data) => ({
        select: () => ({
          single: async () => {
            const record = { id: 'test-id', ...data, created_at: new Date().toISOString() };
            if (table === 'entity_risks') {
              entities.set(data.entity_value, record);
            }
            return { data: record, error: null };
          },
        }),
      }),
      update: (fields) => ({
        eq: (col, val) => ({
          select: () => ({
            single: async () => {
              const existing = entities.get(val) || {};
              const updated = { ...existing, ...fields, updated_at: new Date().toISOString() };
              entities.set(val, updated);
              return { data: updated, error: null };
            },
          }),
        }),
      }),
      upsert: (data) => ({
        select: () => ({
          single: async () => {
            const key = data.entity_value;
            const existing = entities.get(key) || {};
            const merged = { ...existing, ...data };
            entities.set(key, merged);
            return { data: merged, error: null };
          },
        }),
      }),
    }),
  };

  return {
    getSupabase: () => mockSupabase,
  };
});

const { app } = require('../../src/server');

describe('POST /api/v1/payment/check', () => {
  test('BLOCK decision for fraudster@ybl', async () => {
    const res = await request(app)
      .post('/api/v1/payment/check')
      .send({
        upi_id: 'fraudster@ybl',
        amount: 5000,
        user_id: 'test_user_001',
      });

    expect(res.status).toBe(200);
    expect(res.body.decision).toBe('BLOCK');
    expect(res.body.risk_level).toBe('HIGH');
    expect(res.body.composite_score).toBeGreaterThanOrEqual(0.80);
    expect(res.body.request_id).toMatch(/^pay_chk_/);
    expect(res.body.upi_id).toBe('fraudster@ybl');
    expect(res.body.breakdown).toBeDefined();
    expect(res.body.fraud_context).toBeDefined();
    expect(res.body.checked_at).toBeDefined();
  });

  test('ALLOW decision for friend@okaxis', async () => {
    const res = await request(app)
      .post('/api/v1/payment/check')
      .send({
        upi_id: 'friend@okaxis',
        amount: 500,
        user_id: 'test_user_001',
      });

    expect(res.status).toBe(200);
    expect(res.body.decision).toBe('ALLOW');
    expect(res.body.risk_level).toBe('LOW');
    expect(res.body.composite_score).toBeLessThan(0.50);
  });

  test('400 on missing upi_id', async () => {
    const res = await request(app)
      .post('/api/v1/payment/check')
      .send({
        amount: 5000,
        user_id: 'test_user_001',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  test('400 on invalid UPI format', async () => {
    const res = await request(app)
      .post('/api/v1/payment/check')
      .send({
        upi_id: 'invalid-no-at-sign',
        amount: 5000,
        user_id: 'test_user_001',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  test('400 on negative amount', async () => {
    const res = await request(app)
      .post('/api/v1/payment/check')
      .send({
        upi_id: 'friend@okaxis',
        amount: -100,
        user_id: 'test_user_001',
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/risk/:upi_id', () => {
  test('returns risk data for known entity', async () => {
    const res = await request(app)
      .get('/api/v1/risk/fraudster@ybl');

    expect(res.status).toBe(200);
    expect(res.body.upi_id).toBe('fraudster@ybl');
    expect(res.body.risk_level).toBe('HIGH');
    expect(res.body.risk_score).toBeDefined();
    expect(res.body.report_count).toBeDefined();
    expect(res.body.status).toBeDefined();
  });

  test('404 for unknown entity', async () => {
    const res = await request(app)
      .get('/api/v1/risk/unknown@bank');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('ENTITY_NOT_FOUND');
  });
});

describe('POST /api/v1/action/report', () => {
  test('successfully reports an entity', async () => {
    const res = await request(app)
      .post('/api/v1/action/report')
      .send({
        entity_value: 'new_scammer@upi',
        entity_type: 'UPI',
        reason: 'Linked to phishing campaign',
        reported_by: 'test_auto',
      });

    expect(res.status).toBe(200);
    expect(res.body.report_id).toMatch(/^RPT-/);
    expect(res.body.status).toBe('REPORTED');
    expect(res.body.message).toContain('NPCI');
  });

  test('400 on missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/action/report')
      .send({
        entity_value: 'scam@upi',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  test('400 on invalid entity_type', async () => {
    const res = await request(app)
      .post('/api/v1/action/report')
      .send({
        entity_value: 'scam@upi',
        entity_type: 'EMAIL', // invalid
        reason: 'test',
        reported_by: 'test',
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  test('returns healthy status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('vanguard-risk-orchestrator');
  });
});

describe('404 handling', () => {
  test('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
  });
});
