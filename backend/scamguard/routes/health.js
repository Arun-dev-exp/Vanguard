// ============================================================
// ScamGuard — Health Check Route
// GET /health
// ============================================================

import { getClientCount } from "../src/ws-broadcaster.js";

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function healthRoutes(fastify) {
  fastify.get("/health", async (request, reply) => {
    return {
      status: "ok",
      service: "scamguard",
      version: "1.0.0",
      uptime: Math.round(process.uptime()),
      ws_clients: getClientCount(),
      timestamp: new Date().toISOString(),
    };
  });
}
