/**
 * WebSocket Alert Handler — Socket.io
 * Namespace: /ws/alerts
 * Event: FRAUD_ALERT
 */

let io = null;
let alertNamespace = null;

/**
 * Initialize Socket.io with the HTTP server.
 */
function initWebSocket(httpServer) {
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // ── /ws/alerts namespace ──
  alertNamespace = io.of('/ws/alerts');

  alertNamespace.on('connection', (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket client disconnected: ${socket.id} (${reason})`);
    });

    // Send a welcome message
    socket.emit('connected', {
      message: 'Connected to Vanguard fraud alert stream',
      timestamp: new Date().toISOString(),
    });
  });

  console.log('✅ WebSocket server initialized on /ws/alerts');

  return io;
}

/**
 * Emit a FRAUD_ALERT event to all connected clients.
 * Called by the payment check route when a BLOCK decision is made.
 *
 * @param {Object} alertData - Fraud alert payload per PRD §5.4
 */
function emitFraudAlert(alertData) {
  if (!alertNamespace) {
    console.warn('⚠️  WebSocket not initialized — alert not emitted');
    return;
  }

  const payload = {
    event: 'FRAUD_ALERT',
    upi_id: alertData.upi_id,
    risk_level: alertData.risk_level,
    composite_score: alertData.composite_score,
    campaign_name: alertData.campaign_name || null,
    report_count: alertData.report_count || 0,
    amount_at_risk_inr: alertData.amount || 0,
    estimated_loss_pool_inr: alertData.estimated_loss_inr || 0,
    timestamp: new Date().toISOString(),
  };

  alertNamespace.emit('FRAUD_ALERT', payload);
  console.log(`🚨 FRAUD_ALERT emitted for ${payload.upi_id} (score: ${payload.composite_score})`);
}

/**
 * Get connection stats.
 */
function getStats() {
  if (!alertNamespace) return { connected: 0 };
  return {
    connected: alertNamespace.sockets.size,
  };
}

module.exports = { initWebSocket, emitFraudAlert, getStats };
