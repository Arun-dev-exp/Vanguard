// ============================================================
// ScamGuard — Call API Routes
// GET /api/v1/calls/active   — PRD §7.1
// GET /api/v1/calls/history  — PRD §7.2
// ============================================================

import { getActiveCalls, getCallHistory } from "../src/call-manager.js";

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function callRoutes(fastify) {
  /**
   * GET /api/v1/calls/active
   * Returns all currently monitored calls.
   * PRD-3 polls this every 5 seconds for Live Calls panel.
   */
  fastify.get("/api/v1/calls/active", async (request, reply) => {
    const activeCalls = await getActiveCalls();

    return {
      active_calls: activeCalls,
      total: activeCalls.length,
    };
  });

  /**
   * GET /api/v1/calls/history
   * Returns completed calls with outcomes.
   * Query params: ?limit=50&from=2025-01-01&scam_type=KYC
   */
  fastify.get("/api/v1/calls/history", async (request, reply) => {
    const { limit, from, scam_type } = request.query;

    const result = await getCallHistory({
      limit: limit ? parseInt(limit, 10) : 50,
      from: from || undefined,
      scamType: scam_type || undefined,
    });

    return result;
  });
}
