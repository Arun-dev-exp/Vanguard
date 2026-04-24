/**
 * Classifies messages into FRAUD or SAFE and determines scam types.
 * Currently uses a heuristic/rule-based approach as a placeholder for the ML model.
 */

function classifyMessage(text, extractionResult) {
  const { flags, entities } = extractionResult;
  const sanitizedText = text.toLowerCase();

  let fraudScore = 0.0;
  
  // Base weights for flags
  if (flags.suspicious_link) fraudScore += 0.4;
  if (flags.urgent_language) fraudScore += 0.3;
  if (flags.impersonation) fraudScore += 0.3;

  // Add weight if entities are present
  if (entities.upi_ids.length > 0) fraudScore += 0.2;
  
  // Cap at 0.99 for heuristics (1.0 implies absolute certainty)
  fraudScore = Math.min(fraudScore, 0.99);

  // Confidence threshold for FRAUD is >= 0.70 according to PRD
  const isFraud = fraudScore >= 0.70;

  // Determine scam type
  let scamType = 'OTHER';
  if (isFraud) {
    if (sanitizedText.includes('kyc') || sanitizedText.includes('pan') || sanitizedText.includes('aadhar')) {
      scamType = 'KYC';
    } else if (sanitizedText.includes('loan')) {
      scamType = 'LOAN';
    } else if (sanitizedText.includes('job') || sanitizedText.includes('salary') || sanitizedText.includes('work from home')) {
      scamType = 'JOB';
    } else if (sanitizedText.includes('prize') || sanitizedText.includes('lucky draw') || sanitizedText.includes('won')) {
      scamType = 'PRIZE';
    }
  } else {
      scamType = 'N/A'; // Or whatever is appropriate for SAFE messages
  }

  // Ensure precision for output
  const riskScore = parseFloat(fraudScore.toFixed(2));

  return {
    verdict: isFraud ? 'FRAUD' : 'SAFE',
    risk_score: riskScore,
    scam_type: isFraud ? scamType : undefined // Omit or set to null if safe
  };
}

module.exports = {
  classifyMessage
};
