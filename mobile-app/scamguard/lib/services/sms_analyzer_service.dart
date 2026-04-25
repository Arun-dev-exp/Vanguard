import 'package:flutter/foundation.dart';

class SmsAnalysisResult {
  final String riskLevel;
  final int confidence;
  final String pattern;
  final String reason;
  final String action;
  final String rawMessage;

  SmsAnalysisResult({
    required this.riskLevel,
    required this.confidence,
    required this.pattern,
    required this.reason,
    required this.action,
    required this.rawMessage,
  });
}

class SmsAnalyzerService {
  static const List<String> triggerKeywords = [
    'scan', 'qr', 'refund', 'cashback', 'urgent', 'click', 'pay', 'receive'
  ];

  /// Returns true if the message contains any trigger keywords
  static bool requiresAnalysis(String message) {
    final lower = message.toLowerCase();
    return triggerKeywords.any((keyword) => lower.contains(keyword));
  }

  /// Analyzes the message based on pure Dart rules imitating the AI prompt
  static SmsAnalysisResult analyze(String message) {
    final lower = message.toLowerCase();
    
    int confidence = 0;
    String pattern = "Unknown";
    String reason = "Message appears safe based on initial scan.";
    String action = "No specific action needed.";
    String riskLevel = "SAFE";

    // 1. Intent Detection (Receive vs Pay confusion)
    bool asksToReceive = lower.contains('receive') || lower.contains('get') || lower.contains('cashback') || lower.contains('refund');
    bool asksToPay = lower.contains('pay') || lower.contains('scan') || lower.contains('send');
    bool hasReceivePayConfusion = asksToReceive && asksToPay;

    // 2. Psychological Manipulation
    bool hasUrgency = lower.contains('urgent') || lower.contains('act now') || lower.contains('last chance') || lower.contains('immediate') || lower.contains('now');
    bool hasAuthority = lower.contains('bank') || lower.contains('rbi') || lower.contains('police') || lower.contains('kyc') || lower.contains('account block');
    bool hasRewards = lower.contains('cashback') || lower.contains('refund') || lower.contains('prize') || lower.contains('won');

    // 3. Scam Patterns
    bool hasQR = lower.contains('qr') || lower.contains('scan');
    bool hasLink = lower.contains('http') || lower.contains('www.') || lower.contains('.com') || lower.contains('.in');
    bool hasPayment = lower.contains('rs') || lower.contains('₹') || lower.contains('amount') || lower.contains('rupees');

    // Scoring logic
    if (hasQR && asksToReceive) {
      confidence += 40;
      pattern = "QR Scam";
      reason = "Message asks you to scan a QR to receive money, which actually triggers a payment.";
      action = "Do not scan the QR or send any money.";
    } else if (hasReceivePayConfusion) {
      confidence += 30;
      pattern = "Payment Request";
      reason = "Message tries to confuse you into paying instead of receiving money.";
      action = "Ignore this request. Receiving money never requires a PIN or scanning.";
    } else if (hasRewards && hasLink) {
      confidence += 30;
      pattern = "Refund/Reward Scam";
      reason = "Unsolicited reward or refund offer with a suspicious link.";
      action = "Do not click the link or provide banking details.";
    } else if (hasAuthority && hasUrgency) {
      confidence += 30;
      pattern = "Impersonation";
      reason = "Message claims false authority (e.g., Bank/KYC) and demands urgent action.";
      action = "Contact your bank directly. Do not follow instructions in this message.";
    }

    if (hasUrgency) confidence += 15;
    if (hasPayment) confidence += 15;
    if (hasLink) confidence += 10;
    if (hasAuthority) confidence += 10;

    // Cap confidence
    if (confidence > 100) confidence = 100;

    // Determine Risk Level (following Prompt rules: If payment + urgency + QR/link -> HIGH_RISK)
    if (hasPayment && hasUrgency && (hasQR || hasLink)) {
      confidence = confidence < 92 ? 92 : confidence;
      riskLevel = "HIGH_RISK";
    } else if (confidence >= 70) {
      riskLevel = "HIGH_RISK";
    } else if (confidence >= 40) {
      riskLevel = "SUSPICIOUS";
    } else {
      riskLevel = "SAFE";
      confidence = 0;
    }

    // Default fallbacks if risk was escalated by combined rule but pattern was empty
    if (riskLevel == "HIGH_RISK" && pattern == "Unknown") {
      pattern = "Suspicious Link/Payment";
      reason = "Message contains urgent demands for payment or link clicks.";
      action = "Do not click links or make payments.";
    }

    return SmsAnalysisResult(
      riskLevel: riskLevel,
      confidence: confidence,
      pattern: pattern,
      reason: reason,
      action: action,
      rawMessage: message,
    );
  }
}
