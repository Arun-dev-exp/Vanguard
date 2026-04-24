/**
 * Global Express error handler.
 * Catches unhandled errors and returns consistent JSON responses.
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`❌ [${req.method} ${req.originalUrl}] ${status}: ${message}`);
  if (status === 500) {
    console.error(err.stack);
  }

  res.status(status).json({
    error: err.code || 'INTERNAL_ERROR',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
