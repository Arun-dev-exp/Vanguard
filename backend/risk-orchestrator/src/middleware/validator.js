/**
 * Request validation middleware factory.
 * Returns an Express middleware that validates required fields in req.body.
 */
function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: `Missing required fields: ${missing.join(', ')}`,
        missing_fields: missing,
      });
    }

    next();
  };
}

/**
 * Validate payment check request specifically.
 */
function validatePaymentCheck(req, res, next) {
  const { upi_id, amount, user_id } = req.body;

  const errors = [];

  if (!upi_id || typeof upi_id !== 'string') {
    errors.push('upi_id must be a non-empty string');
  } else if (!upi_id.includes('@')) {
    errors.push('upi_id must be a valid UPI address (e.g., name@bank)');
  }

  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    errors.push('amount must be a positive number');
  }

  if (!user_id || typeof user_id !== 'string') {
    errors.push('user_id must be a non-empty string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: errors.join('; '),
      details: errors,
    });
  }

  next();
}

/**
 * Validate action report request.
 */
function validateActionReport(req, res, next) {
  const { entity_value, entity_type, reason, reported_by } = req.body;

  const errors = [];

  if (!entity_value || typeof entity_value !== 'string') {
    errors.push('entity_value must be a non-empty string');
  }

  if (!entity_type || !['UPI', 'URL', 'PHONE'].includes(entity_type)) {
    errors.push('entity_type must be one of: UPI, URL, PHONE');
  }

  if (!reason || typeof reason !== 'string') {
    errors.push('reason must be a non-empty string');
  }

  if (!reported_by || typeof reported_by !== 'string') {
    errors.push('reported_by must be a non-empty string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: errors.join('; '),
      details: errors,
    });
  }

  next();
}

module.exports = { validateBody, validatePaymentCheck, validateActionReport };
