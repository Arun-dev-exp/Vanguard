import 'supabase_service.dart';

enum RiskLevel { LOW, MEDIUM, HIGH }

class QRAnalysisResult {
  final RiskLevel riskLevel;
  final String message;
  final String reason;
  final String upiId;
  final String name;
  final String? amount;

  const QRAnalysisResult({
    required this.riskLevel,
    required this.message,
    required this.reason,
    required this.upiId,
    required this.name,
    this.amount,
  });
}

class QRAnalyzerService {
  /// Analyzes a scanned UPI URI and generates a strict security warning.
  static Future<QRAnalysisResult> analyze(String uriString) async {
    String upiId = uriString;
    String name = 'Unknown';
    String? amount;

    // Parse URI
    if (uriString.toLowerCase().startsWith('upi://')) {
      final uri = Uri.tryParse(uriString);
      if (uri != null) {
        if (uri.queryParameters.containsKey('pa')) {
          upiId = uri.queryParameters['pa']!;
        }
        if (uri.queryParameters.containsKey('pn')) {
          name = uri.queryParameters['pn']!;
        } else {
          name = upiId.split('@').first;
        }
        if (uri.queryParameters.containsKey('am')) {
          amount = uri.queryParameters['am'];
        }
      }
    } else {
      // Fallback if not a standard upi:// URI but might just be a UPI ID string
      name = upiId.split('@').first;
    }

    // Check scam DB
    final isScam = await SupabaseService.isUpiScam(upiId);

    if (isScam) {
      return QRAnalysisResult(
        riskLevel: RiskLevel.HIGH,
        message: '⚠️ SCAM ALERT! You are about to send money to a known scammer.',
        reason: 'This UPI ID has been reported multiple times for fraudulent activities.',
        upiId: upiId,
        name: name,
        amount: amount,
      );
    }

    // Not a flagged scam. Analyze payment intent to prevent confusion.
    if (amount != null && amount.isNotEmpty) {
      return QRAnalysisResult(
        riskLevel: RiskLevel.MEDIUM,
        message: '⚠️ You are about to PAY ₹$amount to $name ($upiId) — not receive money.',
        reason: 'The QR code explicitly requests a payment of ₹$amount. Scanning will deduct money from your account.',
        upiId: upiId,
        name: name,
        amount: amount,
      );
    } else {
      return QRAnalysisResult(
        riskLevel: RiskLevel.LOW,
        message: '⚠️ You are initiating a PAYMENT to $name ($upiId).',
        reason: 'Scanning a QR code will NEVER receive money into your account. Proceed only to PAY.',
        upiId: upiId,
        name: name,
        amount: amount,
      );
    }
  }
}
