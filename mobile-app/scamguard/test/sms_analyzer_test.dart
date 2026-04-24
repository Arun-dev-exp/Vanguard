import 'package:flutter_test/flutter_test.dart';
import 'package:scamguard/services/sms_analyzer_service.dart';

void main() {
  test('SmsAnalyzer detects HIGH_RISK QR Scam', () {
    String message = "Scan this QR to receive ₹2000 cashback now";
    
    expect(SmsAnalyzerService.requiresAnalysis(message), true);
    
    final result = SmsAnalyzerService.analyze(message);
    
    expect(result.riskLevel, 'HIGH_RISK');
    expect(result.pattern, 'QR Scam');
    expect(result.confidence, greaterThanOrEqualTo(92));
  });

  test('SmsAnalyzer detects SAFE message', () {
    String message = "Hey are we still meeting tomorrow?";
    
    expect(SmsAnalyzerService.requiresAnalysis(message), false);
  });
  
  test('SmsAnalyzer detects Payment/Impersonation scam', () {
    String message = "Urgent: Your HDFC Bank account is blocked. Pay Rs 500 immediately to link PAN. Click here: http://bit.ly/hdfc";
    
    expect(SmsAnalyzerService.requiresAnalysis(message), true);
    
    final result = SmsAnalyzerService.analyze(message);
    
    expect(result.riskLevel, 'HIGH_RISK');
    expect(result.confidence, greaterThanOrEqualTo(70));
    expect(result.pattern, 'Impersonation');
  });
}
