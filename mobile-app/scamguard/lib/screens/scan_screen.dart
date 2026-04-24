import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../theme/sentinel_theme.dart';
import '../services/supabase_service.dart';
import '../services/qr_analyzer_service.dart';
import '../widgets/scam_alert_dialog.dart';
import '../data/mock_data.dart';
import 'send_money_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isProcessing = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  const Text('Scan & Pay', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => _controller.toggleTorch(),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: AppTheme.surface2, borderRadius: BorderRadius.circular(20)),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.flash_on, size: 16, color: AppTheme.yellow),
                          SizedBox(width: 4),
                          Text('Flash', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // QR Scanner frame
            Container(
              width: 260, height: 260,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(24)),
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: MobileScanner(
                      controller: _controller,
                      onDetect: (capture) async {
                        if (_isProcessing) return;
                        final List<Barcode> barcodes = capture.barcodes;
                        for (final barcode in barcodes) {
                          final raw = barcode.rawValue;
                          if (raw != null && raw.isNotEmpty) {
                            _processQRCode(raw);
                            break;
                          }
                        }
                      },
                    ),
                  ),
                  // Dark overlay border
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3), width: 2),
                    ),
                  ),
                  // Corner accents
                  ..._cornerAccents(),
                  // Scanning line
                  Positioned(
                    top: 60, left: 20, right: 20,
                    child: Container(
                      height: 2,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.transparent, AppTheme.primary, Colors.transparent],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Point camera at any QR code', style: TextStyle(color: AppTheme.textMuted, fontSize: 14)),

            const Spacer(),

            // Bottom actions
            Padding(
              padding: const EdgeInsets.fromLTRB(40, 0, 40, 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _bottomAction(Icons.image_outlined, 'Gallery'),
                  _bottomAction(Icons.link, 'UPI ID'),
                  _bottomAction(Icons.contacts_outlined, 'Contacts'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _bottomAction(IconData icon, String label) {
    return Column(
      children: [
        Container(
          width: 52, height: 52,
          decoration: BoxDecoration(color: AppTheme.surface2, shape: BoxShape.circle),
          child: Icon(icon, color: AppTheme.textSecondary, size: 22),
        ),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
      ],
    );
  }

  List<Widget> _cornerAccents() {
    const s = 30.0;
    const t = 3.0;
    const c = AppTheme.primary;
    return [
      Positioned(top: 0, left: 0, child: _corner(s, t, c, true, true)),
      Positioned(top: 0, right: 0, child: _corner(s, t, c, true, false)),
      Positioned(bottom: 0, left: 0, child: _corner(s, t, c, false, true)),
      Positioned(bottom: 0, right: 0, child: _corner(s, t, c, false, false)),
    ];
  }

  Widget _corner(double size, double thickness, Color color, bool isTop, bool isLeft) {
    return SizedBox(
      width: size, height: size,
      child: CustomPaint(painter: _CornerPainter(thickness, color, isTop, isLeft)),
    );
  }

  Future<void> _processQRCode(String rawValue) async {
    setState(() => _isProcessing = true);
    
    // Analyze QR intent
    final analysis = await QRAnalyzerService.analyze(rawValue);
    
    if (!mounted) return;

    if (analysis.riskLevel == RiskLevel.HIGH) {
      final proceed = await ScamAlertDialog.show(context, analysis.upiId);
      if (!proceed) {
        // User cancelled, reset scanner
        setState(() => _isProcessing = false);
        return;
      }
    }

    // Proceed to SendMoneyScreen
    final contact = Contact(name: analysis.name, phone: analysis.upiId, initials: analysis.name.isNotEmpty ? analysis.name[0] : 'U', color: 0); // Create a mock contact
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => SendMoneyScreen(prefill: contact, analysis: analysis)),
    ).then((_) {
      if (mounted) setState(() => _isProcessing = false);
    });
  }
}

class _CornerPainter extends CustomPainter {
  final double thickness;
  final Color color;
  final bool isTop;
  final bool isLeft;

  _CornerPainter(this.thickness, this.color, this.isTop, this.isLeft);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color..strokeWidth = thickness..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
    final path = Path();
    if (isTop && isLeft) {
      path.moveTo(0, size.height);
      path.lineTo(0, 8);
      path.quadraticBezierTo(0, 0, 8, 0);
      path.lineTo(size.width, 0);
    } else if (isTop && !isLeft) {
      path.moveTo(0, 0);
      path.lineTo(size.width - 8, 0);
      path.quadraticBezierTo(size.width, 0, size.width, 8);
      path.lineTo(size.width, size.height);
    } else if (!isTop && isLeft) {
      path.moveTo(0, 0);
      path.lineTo(0, size.height - 8);
      path.quadraticBezierTo(0, size.height, 8, size.height);
      path.lineTo(size.width, size.height);
    } else {
      path.moveTo(size.width, 0);
      path.lineTo(size.width, size.height - 8);
      path.quadraticBezierTo(size.width, size.height, size.width - 8, size.height);
      path.lineTo(0, size.height);
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
