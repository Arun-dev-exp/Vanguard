// ============================================================
// ScamGuard — Twilio Incoming Call Webhook
// POST /incoming-call — Returns TwiML to stream audio
// ============================================================

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function incomingCallRoutes(fastify) {
  /**
   * POST /incoming-call
   * Twilio calls this when a registered phone receives a call.
   * Returns TwiML that:
   *   1. Plays a brief connect tone
   *   2. Opens a WebSocket stream to /media-stream for real-time audio
   */
  fastify.post("/incoming-call", async (request, reply) => {
    const { CallSid, From, To } = request.body || {};

    console.log(`[Twilio] Incoming call: ${CallSid} from ${From} to ${To}`);

    // Determine the WebSocket URL for media streaming
    const wsUrl = getWebSocketUrl(request);

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}/media-stream">
      <Parameter name="callSid" value="${CallSid || ''}" />
      <Parameter name="callerNumber" value="${From || ''}" />
      <Parameter name="calledNumber" value="${To || ''}" />
    </Stream>
  </Connect>
</Response>`;

    reply.type("text/xml").send(twiml);
  });
}

/**
 * Build the WebSocket URL from the request.
 * In production, use SCAMGUARD_PUBLIC_URL env var.
 * In development, derive from request host.
 */
function getWebSocketUrl(request) {
  const publicUrl = process.env.SCAMGUARD_PUBLIC_URL;

  if (publicUrl) {
    return publicUrl.replace(/^http/, "ws");
  }

  // Fallback: derive from request
  const protocol = request.headers["x-forwarded-proto"] === "https" ? "wss" : "ws";
  const host = request.headers.host;
  return `${protocol}://${host}`;
}
