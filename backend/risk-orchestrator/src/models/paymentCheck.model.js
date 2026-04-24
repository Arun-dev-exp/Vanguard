const { getSupabase } = require('../db/supabase');

const TABLE = 'payment_checks';

/**
 * Payment Check Log Model — Supabase CRUD operations.
 */
const PaymentCheckModel = {
  /**
   * Log a payment check result.
   */
  async create(check) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .insert({
        user_id: check.user_id,
        upi_id: check.upi_id,
        amount: check.amount,
        decision: check.decision,
        risk_level: check.risk_level,
        composite_score: check.composite_score,
        breakdown: check.breakdown || {},
        fraud_context: check.fraud_context || null,
      })
      .select()
      .single();

    if (error) throw new Error(`DB error (create payment_check): ${error.message}`);
    return data;
  },

  /**
   * Count recent checks by a user within a time window.
   * Used for rate limiting.
   */
  async countRecentByUser(userId, windowMs) {
    const since = new Date(Date.now() - windowMs).toISOString();

    const { count, error } = await getSupabase()
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('checked_at', since);

    if (error) throw new Error(`DB error (countRecentByUser): ${error.message}`);
    return count || 0;
  },

  /**
   * Find a specific payment check by ID.
   */
  async findById(id) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`DB error (findById): ${error.message}`);
    return data;
  },
};

module.exports = PaymentCheckModel;
