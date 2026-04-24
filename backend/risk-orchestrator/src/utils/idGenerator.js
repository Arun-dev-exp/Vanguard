const { v4: uuidv4 } = require('uuid');

/**
 * Generate a UUID v4.
 */
function generateId() {
  return uuidv4();
}

/**
 * Generate a payment check request ID.
 * Format: pay_chk_<8-char-short-id>
 */
function generateRequestId() {
  return `pay_chk_${uuidv4().slice(0, 8)}`;
}

/**
 * Generate a report reference ID.
 * Format: RPT-YYYYMMDD-NNN (NNN is random 3-digit)
 */
function generateReportId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `RPT-${dateStr}-${seq}`;
}

module.exports = { generateId, generateRequestId, generateReportId };
