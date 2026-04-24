// ============================================================
// ScamGuard — WebSocket Broadcaster
// Pushes live call events to PRD-3 SOC Dashboard
// See PRD §7.3
// ============================================================

const connectedClients = new Set();

/**
 * Register a new WebSocket client (from PRD-3 SOC Dashboard).
 * @param {WebSocket} socket - The WebSocket connection
 */
export function addClient(socket) {
  connectedClients.add(socket);
  console.log(`[WS] Client connected (total: ${connectedClients.size})`);

  socket.on("close", () => {
    connectedClients.delete(socket);
    console.log(`[WS] Client disconnected (total: ${connectedClients.size})`);
  });

  socket.on("error", (err) => {
    console.error("[WS] Client error:", err.message);
    connectedClients.delete(socket);
  });
}

/**
 * Broadcast an event to all connected PRD-3 clients.
 *
 * Events (per PRD §7.3):
 * - CALL_STARTED:    { event, call_sid, caller_number, called_number, started_at }
 * - RISK_ESCALATED:  { event, call_sid, risk_level, composite_score, campaign_name, alerts_sent }
 * - CALL_ENDED:      { event, call_sid, duration_seconds, final_risk_level, telegram_alerts_sent }
 *
 * @param {object} event - The event payload
 */
export function broadcast(event) {
  const message = JSON.stringify(event);
  let sent = 0;

  for (const client of connectedClients) {
    try {
      if (client.readyState === 1) {
        // WebSocket.OPEN
        client.send(message);
        sent++;
      }
    } catch (err) {
      console.error("[WS] Broadcast error:", err.message);
      connectedClients.delete(client);
    }
  }

  if (sent > 0) {
    console.log(`[WS] Broadcast ${event.event} to ${sent} client(s)`);
  }
}

/**
 * Broadcast a CALL_STARTED event.
 */
export function broadcastCallStarted(callSid, callerNumber, calledNumber) {
  broadcast({
    event: "CALL_STARTED",
    call_sid: callSid,
    caller_number: callerNumber,
    called_number: calledNumber,
    started_at: new Date().toISOString(),
  });
}

/**
 * Broadcast a RISK_ESCALATED event.
 */
export function broadcastRiskEscalated(callSid, riskLevel, compositeScore, campaignName, alertsSent) {
  broadcast({
    event: "RISK_ESCALATED",
    call_sid: callSid,
    risk_level: riskLevel,
    composite_score: compositeScore,
    campaign_name: campaignName || null,
    alerts_sent: alertsSent,
  });
}

/**
 * Broadcast a CALL_ENDED event.
 */
export function broadcastCallEnded(callSid, durationSeconds, finalRiskLevel, telegramAlertsSent) {
  broadcast({
    event: "CALL_ENDED",
    call_sid: callSid,
    duration_seconds: durationSeconds,
    final_risk_level: finalRiskLevel,
    telegram_alerts_sent: telegramAlertsSent,
  });
}

/**
 * Get current connected client count (for health check).
 */
export function getClientCount() {
  return connectedClients.size;
}
