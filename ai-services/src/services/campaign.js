const crypto = require('crypto');
// Dynamic import for ESM module
// const { pipeline } = require('@xenova/transformers');
const { supabase } = require('../lib/supabase');

// Singleton for the feature extraction pipeline
let extractorPipeline = null;

async function getExtractor() {
  if (!extractorPipeline) {
    // Dynamically import ESM module
    const transformers = await import('@xenova/transformers');
    // using feature-extraction to generate embeddings
    extractorPipeline = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorPipeline;
}

/**
 * Generate a text embedding vector using Transformers.js
 */
async function generateEmbedding(text) {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  // The output is a Tensor, we convert it to a standard JS array
  return Array.from(output.data);
}

/**
 * Generates a SHA-256 hash of the sanitized message for fast exact matching
 */
function generateHash(text) {
  return crypto.createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
}

/**
 * Finds an existing campaign or creates a new one for a given message
 */
async function matchCampaign(message, classificationResult) {
  if (classificationResult.verdict !== 'FRAUD') {
    return null; // Don't track campaigns for SAFE messages
  }

  const messageHash = generateHash(message);
  
  try {
    // 1. Check for exact hash match in message_history
    const { data: exactMatch, error: exactError } = await supabase
      .from('message_history')
      .select('campaign_id, campaigns(*)')
      .eq('message_hash', messageHash)
      .single();

    if (exactMatch) {
      // Update last_seen and report_count
      const campaign = exactMatch.campaigns;
      await supabase
        .from('campaigns')
        .update({
          report_count: campaign.report_count + 1,
          last_seen: new Date().toISOString()
        })
        .eq('id', campaign.id);
        
      return {
        campaign_id: campaign.id,
        campaign_name: campaign.campaign_name,
        report_count: campaign.report_count + 1,
        first_seen: campaign.first_seen,
        last_seen: new Date().toISOString()
      };
    }

    // 2. No exact match, generate embedding and search via pgvector
    const embedding = await generateEmbedding(message);

    // Using the RPC function we defined in schema.sql
    const { data: similarMessages, error: rpcError } = await supabase.rpc('match_message_embedding', {
      query_embedding: embedding,
      match_threshold: 0.75, // PRD similarity threshold
      match_count: 1
    });

    if (similarMessages && similarMessages.length > 0) {
      // Found a similar campaign
      const campaignId = similarMessages[0].campaign_id;
      
      // Fetch current campaign details
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
        
      // Update campaign
      await supabase
        .from('campaigns')
        .update({
          report_count: campaign.report_count + 1,
          last_seen: new Date().toISOString()
        })
        .eq('id', campaignId);
        
      // Insert this new message into history
      await supabase
        .from('message_history')
        .insert({
          message_hash: messageHash,
          campaign_id: campaignId,
          embedding: embedding
        });

      return {
        campaign_id: campaign.id,
        campaign_name: campaign.campaign_name,
        report_count: campaign.report_count + 1,
        first_seen: campaign.first_seen,
        last_seen: new Date().toISOString()
      };
    }

    // 3. No similar message found, create new campaign
    const scamType = classificationResult.scam_type;
    const campaignName = `${scamType} Scam Campaign - ${new Date().toISOString().split('T')[0]}`;
    
    const { data: newCampaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        campaign_name: campaignName,
        scam_type: scamType,
        report_count: 1
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Insert new message history linking to this new campaign
    await supabase
      .from('message_history')
      .insert({
        message_hash: messageHash,
        campaign_id: newCampaign.id,
        embedding: embedding
      });

    return {
      campaign_id: newCampaign.id,
      campaign_name: newCampaign.campaign_name,
      report_count: newCampaign.report_count,
      first_seen: newCampaign.first_seen,
      last_seen: newCampaign.last_seen
    };

  } catch (error) {
    console.error('Error in campaign matching:', error);
    // If Supabase fails (e.g. not configured), we fail gracefully and return mock campaign data
    // so the API still functions without a database for demo purposes
    return {
      campaign_id: "camp_mock_001",
      campaign_name: `${classificationResult.scam_type} Scam Campaign (Mocked Database Error)`,
      report_count: 1,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString()
    };
  }
}

module.exports = {
  matchCampaign,
  generateEmbedding
};
