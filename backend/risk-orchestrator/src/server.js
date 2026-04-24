const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { initWebSocket } = require('./websocket/alertHandler');

// ── Routes ──
const paymentCheckRoute = require('./routes/paymentCheck.route');
const riskLookupRoute = require('./routes/riskLookup.route');
const actionReportRoute = require('./routes/actionReport.route');
const healthRoute = require('./routes/health.route');

// ── Express App ──
const app = express();

// ── Security & Parsing ──
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));

// ── Logging ──
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// ── API Routes ──
app.use('/health', healthRoute);
app.use('/api/v1/payment', paymentCheckRoute);
app.use('/api/v1/risk', riskLookupRoute);
app.use('/api/v1/action', actionReportRoute);

// ── Root ──
app.get('/', (req, res) => {
  res.json({
    service: 'Vanguard Risk Orchestrator',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      payment_check: 'POST /api/v1/payment/check',
      risk_lookup: 'GET /api/v1/risk/:upi_id',
      action_report: 'POST /api/v1/action/report',
      websocket: 'ws://host/ws/alerts',
    },
  });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Error Handler ──
app.use(errorHandler);

// ── HTTP Server + WebSocket ──
const server = http.createServer(app);
initWebSocket(server);

// ── Start (only when run directly, not when required by tests) ──
if (require.main === module) {
server.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🛡️  VANGUARD RISK ORCHESTRATOR                         ║
║                                                          ║
║   HTTP  → http://localhost:${config.port}                       ║
║   WS    → ws://localhost:${config.port}/ws/alerts               ║
║   Mode  → ${config.isDev ? 'DEVELOPMENT' : 'PRODUCTION'}                              ║
║   PRD-1 → ${config.prd1BaseUrl || 'MOCK MODE (no PRD1_BASE_URL)'}${config.prd1BaseUrl ? '' : '       '}║
║                                                          ║
║   Endpoints:                                             ║
║     POST /api/v1/payment/check   — Payment interception  ║
║     GET  /api/v1/risk/:upi_id    — Entity risk lookup    ║
║     POST /api/v1/action/report   — Flag & report entity  ║
║     GET  /health                 — Health check           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// ── Graceful Shutdown ──
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received — shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received — shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
} // end if (require.main === module)

module.exports = { app, server };
