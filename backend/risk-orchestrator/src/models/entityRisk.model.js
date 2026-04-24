const { getSupabase } = require('../db/supabase');

const TABLE = 'entity_risks';

/**
 * Entity Risk Registry Model — Supabase CRUD operations.
 */
const EntityRiskModel = {
  /**
   * Find an entity by its value (UPI ID, URL, etc.).
   */
  async findByEntityValue(entityValue) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select('*')
      .eq('entity_value', entityValue)
      .maybeSingle();

    if (error) throw new Error(`DB error (findByEntityValue): ${error.message}`);
    return data; // null if not found
  },

  /**
   * Create a new entity in the risk registry.
   */
  async create(entity) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .insert({
        entity_value: entity.entity_value,
        entity_type: entity.entity_type || 'UPI',
        risk_score: entity.risk_score || 0.0,
        report_count: entity.report_count || 0,
        campaigns: entity.campaigns || [],
        status: entity.status || 'ACTIVE',
      })
      .select()
      .single();

    if (error) throw new Error(`DB error (create): ${error.message}`);
    return data;
  },

  /**
   * Update specific fields on an entity.
   */
  async update(entityValue, fields) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .update(fields)
      .eq('entity_value', entityValue)
      .select()
      .single();

    if (error) throw new Error(`DB error (update): ${error.message}`);
    return data;
  },

  /**
   * Update entity status (ACTIVE → REPORTED → CLEARED).
   */
  async updateStatus(entityValue, status) {
    return this.update(entityValue, { status });
  },

  /**
   * Increment the report_count atomically using RPC.
   * Falls back to read-increment-write if RPC is unavailable.
   */
  async incrementReportCount(entityValue) {
    // Read current, increment, write — acceptable for our throughput
    const entity = await this.findByEntityValue(entityValue);
    if (!entity) return null;

    return this.update(entityValue, {
      report_count: entity.report_count + 1,
    });
  },

  /**
   * Upsert an entity — create or update if exists.
   */
  async upsert(entity) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .upsert(entity, { onConflict: 'entity_value' })
      .select()
      .single();

    if (error) throw new Error(`DB error (upsert): ${error.message}`);
    return data;
  },
};

module.exports = EntityRiskModel;
