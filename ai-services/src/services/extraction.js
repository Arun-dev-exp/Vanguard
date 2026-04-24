/**
 * Extracts entities (UPI, URLs, Phone numbers) and determines flags based on text patterns.
 */

const UPI_REGEX = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g;
const URL_REGEX = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
// Basic Indian phone number regex with optional +91, 0, or plain 10 digits
const PHONE_REGEX = /(?:\+91|91|0)?[-\s]?[6-9]\d{9}/g;

const URGENT_KEYWORDS = ['urgent', 'immediately', 'click now', 'expire', 'expired', 'block', 'blocked', 'suspend'];
const IMPERSONATION_KEYWORDS = ['bank', 'npci', 'rbi', 'sbi', 'hdfc', 'icici', 'axis', 'kyc', 'pan', 'aadhar', 'police'];

function extractEntities(text) {
  const sanitizedText = text.toLowerCase();
  
  // Extract UPI
  const upiMatches = text.match(UPI_REGEX) || [];
  const upi_ids = [...new Set(upiMatches)];

  // Extract URLs
  // The simple regex might match upi as url in some cases, so let's filter those out
  let urlMatches = text.match(URL_REGEX) || [];
  urlMatches = urlMatches.filter(url => !url.includes('@'));
  const urls = [...new Set(urlMatches)];

  // Extract Phone Numbers
  const phoneMatches = text.match(PHONE_REGEX) || [];
  // Normalize phone numbers (remove spaces, -, etc)
  const phone_numbers = [...new Set(phoneMatches.map(p => p.replace(/[-\s]/g, '')))];

  // Determine flags
  const suspicious_link = urls.length > 0;
  const urgent_language = URGENT_KEYWORDS.some(keyword => sanitizedText.includes(keyword));
  const impersonation = IMPERSONATION_KEYWORDS.some(keyword => sanitizedText.includes(keyword));

  return {
    entities: {
      upi_ids,
      urls,
      phone_numbers
    },
    flags: {
      suspicious_link,
      urgent_language,
      impersonation
    }
  };
}

module.exports = {
  extractEntities
};
