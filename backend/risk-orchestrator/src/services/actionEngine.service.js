const EntityRiskModel = require('../models/entityRisk.model');
const { generateReportId } = require('../utils/idGenerator');

/**
 * Action Engine Service.
 * Handles flagging/reporting entities to NPCI (simulated).
 */
const ActionEngineService = {
  /**
   * Report an entity as fraudulent.
   * - Creates the entity if it doesn't exist
   * - Updates status to REPORTED
   * - Increments report_count
   * - Generates a report reference ID
   *
   * @param {Object} params
   * @param {string} params.entity_value - UPI ID or URL
   * @param {string} params.entity_type  - UPI | URL | PHONE
   * @param {string} params.reason       - Reason for reporting
   * @param {string} params.reported_by  - Who reported (system_auto, manual, etc.)
   * @returns {{ report_id, status, message, entity, reported_at }}
   */
  async reportEntity({ entity_value, entity_type, reason, reported_by }) {
    // Look up or create the entity
    let entity = await EntityRiskModel.findByEntityValue(entity_value);

    if (!entity) {
      entity = await EntityRiskModel.create({
        entity_value,
        entity_type: entity_type || 'UPI',
        risk_score: 0.5, // Default to medium when manually reported
        report_count: 0,
        campaigns: [],
        status: 'ACTIVE',
      });
    }

    // Increment report count
    await EntityRiskModel.incrementReportCount(entity_value);

    // Update status to REPORTED
    const updated = await EntityRiskModel.updateStatus(entity_value, 'REPORTED');

    // Generate report reference
    const reportId = generateReportId();
    const reportedAt = new Date().toISOString();

    console.log(
      `📋 REPORT ${reportId}: ${entity_value} (${entity_type}) reported by ${reported_by} — "${reason}"`
    );

    return {
      report_id: reportId,
      status: 'REPORTED',
      message: 'Reported to NPCI / bank system',
      entity: updated,
      reported_at: reportedAt,
    };
  },
};

module.exports = ActionEngineService;
