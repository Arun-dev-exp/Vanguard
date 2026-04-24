import 'package:flutter/material.dart';
import 'package:telephony/telephony.dart';
import 'sms_analyzer_service.dart';
import '../widgets/sms_alert_dialog.dart';

// Top-level function for background SMS handling
@pragma('vm:entry-point')
backgroundMessageHandler(SmsMessage message) async {
  // We can log background messages or send local notifications here.
  // For UI alerts, we primarily rely on the foreground listener.
  debugPrint("Background SMS received: ${message.body}");
}

class SmsMonitorService {
  static final Telephony telephony = Telephony.instance;
  static BuildContext? _appContext;

  static void initialize(BuildContext context) async {
    _appContext = context;
    
    // Request permissions
    bool? permissionsGranted = await telephony.requestPhoneAndSmsPermissions;
    if (permissionsGranted != null && permissionsGranted) {
      telephony.listenIncomingSms(
        onNewMessage: _onForegroundMessage,
        onBackgroundMessage: backgroundMessageHandler,
      );
      debugPrint("SmsMonitorService initialized and listening.");
    } else {
      debugPrint("SMS permissions denied.");
    }
  }

  static void _onForegroundMessage(SmsMessage message) {
    final body = message.body ?? "";
    debugPrint("Foreground SMS received: $body");

    if (SmsAnalyzerService.requiresAnalysis(body)) {
      final analysis = SmsAnalyzerService.analyze(body);
      
      if (analysis.riskLevel == 'HIGH_RISK' || analysis.riskLevel == 'SUSPICIOUS') {
        if (_appContext != null) {
          SmsAlertDialog.show(_appContext!, analysis);
        }
      }
    }
  }
  
  // For testing in emulator without an actual SMS
  static void simulateSms(String message) {
    final analysis = SmsAnalyzerService.analyze(message);
    if (_appContext != null) {
       SmsAlertDialog.show(_appContext!, analysis);
    }
  }
}
