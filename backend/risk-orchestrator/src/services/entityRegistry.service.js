const EntityRiskModel = require('../models/entityRisk.model');

/**
 * Entity Registry Service.
 * Manages the UPI/URL risk registry — lookup, creation, and updates from PRD-1 results.
 */
const EntityRegistryService = {
  /**
   * Get an entity or create a default one if it doesn't exist.
   */
  async getOrCreateEntity(entityValue, entityType = 'UPI') {
    let entity = await EntityRiskModel.findByEntityValue(entityValue);

    if (!entity) {
      entity = await EntityRiskModel.create({
        entity_value: entityValue,
        entity_type: entityType,
        risk_score: 0.0,
        report_count: 0,
        campaigns: [],
        status: 'ACTIVE',
      });
    }

    return entity;
  },

  /**
   * Look up an entity's risk info. Returns null if not found.
   */
  async getEntityRisk(entityValue) {
    return EntityRiskModel.findByEntityValue(entityValue);
  },

  /**
   * Get the normalized entity risk score (0.0 – 1.0).
   */
  async getEntityRiskScore(entityValue) {
    const entity = await EntityRiskModel.findByEntityValue(entityValue);
    return entity ? entity.risk_score : 0.0;
  },

  /**
   * Update entity registry from a PRD-1 response.
   * Auto-creates the entity if it doesn't exist.
   */
  async updateFromPrd1Response(entityValue, prd1Response) {
    const entity = await this.getOrCreateEntity(entityValue);

    const updates = {
      risk_score: Math.max(entity.risk_score, prd1Response.risk_score || 0),
    };

    // Link campaigns if present
    if (prd1Response.campaign && prd1Response.campaign.campaign_id) {
      const existingCampaigns = Array.isArray(entity.campaigns)
        ? entity.campaigns
        : JSON.parse(entity.campaigns || '[]');

      if (!existingCampaigns.includes(prd1Response.campaign.campaign_id)) {
        updates.campaigns = [...existingCampaigns, prd1Response.campaign.campaign_id];
      }
    }

    // Update report count from campaign data
    if (prd1Response.campaign && prd1Response.campaign.report_count) {
      updates.report_count = Math.max(
        entity.report_count,
        prd1Response.campaign.report_count
      );
    }

    return EntityRiskModel.update(entityValue, updates);
  },
};

module.exports = EntityRegistryService;
