import 'package:flutter/material.dart';
import '../theme/sentinel_theme.dart';
import '../data/mock_data.dart';
import '../widgets/components.dart';
import '../services/supabase_service.dart';
import '../widgets/scam_alert_dialog.dart';
import '../services/qr_analyzer_service.dart';
import '../widgets/payment_intent_warning.dart';

class SendMoneyScreen extends StatefulWidget {
  final Contact? prefill;
  final QRAnalysisResult? analysis;
  const SendMoneyScreen({super.key, this.prefill, this.analysis});

  @override
  State<SendMoneyScreen> createState() => _SendMoneyScreenState();
}

class _SendMoneyScreenState extends State<SendMoneyScreen> {
  final _upiCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _noteCtrl = TextEditingController();
  bool _processing = false;
  bool _done = false;

  @override
  void dispose() {
    _upiCtrl.dispose();
    _amountCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  void _pay() async {
    final upiId = widget.prefill?.phone ?? _upiCtrl.text.trim();
    if (upiId.isEmpty || _amountCtrl.text.isEmpty) return;

    setState(() => _processing = true);
    
    // Verify Scam Status
    final isScam = await SupabaseService.isUpiScam(upiId);
    if (!mounted) return;
    
    if (isScam) {
      final proceed = await ScamAlertDialog.show(context, upiId);
      if (!proceed) {
        setState(() => _processing = false);
        return; // User cancelled
      }
    }

    // Simulate payment
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() { _processing = false; _done = true; });
  }

  @override
  Widget build(BuildContext context) {
    if (_done) return _successScreen();

    final contact = widget.prefill;
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        backgroundColor: AppTheme.bg,
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
        title: const Text('Send Money', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            if (widget.analysis != null)
              PaymentIntentWarning(analysis: widget.analysis!),
            
            // Recipient
            if (contact != null) ...[
              PayWidgets.avatar(contact.initials, contact.color, size: 64),
              const SizedBox(height: 12),
              Text(contact.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              Text(contact.phone, style: const TextStyle(fontSize: 14, color: AppTheme.textMuted)),
              const SizedBox(height: 32),
            ] else ...[
              // UPI ID input
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(color: AppTheme.surface1, borderRadius: BorderRadius.circular(14)),
                child: TextField(
                  controller: _upiCtrl,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(
                    hintText: 'Enter UPI ID or phone number',
                    hintStyle: TextStyle(color: AppTheme.textMuted),
                    border: InputBorder.none,
                    prefixIcon: Icon(Icons.person_outline, color: AppTheme.textMuted),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Amount input
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(color: AppTheme.surface1, borderRadius: BorderRadius.circular(14)),
              child: Row(
                children: [
                  const Text('₹', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w300, color: AppTheme.textMuted)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _amountCtrl,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                      decoration: const InputDecoration(
                        hintText: '0',
                        hintStyle: TextStyle(fontSize: 36, fontWeight: FontWeight.w300, color: AppTheme.textMuted),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Note
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(color: AppTheme.surface1, borderRadius: BorderRadius.circular(14)),
              child: TextField(
                controller: _noteCtrl,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(
                  hintText: 'Add a note (optional)',
                  hintStyle: TextStyle(color: AppTheme.textMuted),
                  border: InputBorder.none,
                  prefixIcon: Icon(Icons.edit_outlined, color: AppTheme.textMuted, size: 20),
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Quick amount chips
            Wrap(
              spacing: 10,
              children: [100, 200, 500, 1000, 2000].map((amt) {
                return GestureDetector(
                  onTap: () => _amountCtrl.text = amt.toString(),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppTheme.surface2,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.divider),
                    ),
                    child: Text('₹$amt', style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 40),

            // Pay button
            SizedBox(
              width: double.infinity, height: 56,
              child: ElevatedButton(
                onPressed: _processing ? null : _pay,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: _processing
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : const Text('Pay Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _successScreen() {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(color: AppTheme.green.withValues(alpha: 0.15), shape: BoxShape.circle),
              child: const Icon(Icons.check_rounded, color: AppTheme.green, size: 44),
            ),
            const SizedBox(height: 24),
            Text('₹${_amountCtrl.text}', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
            const SizedBox(height: 8),
            Text('Sent to ${widget.prefill?.name ?? 'Recipient'}', style: const TextStyle(fontSize: 16, color: AppTheme.textSecondary)),
            const SizedBox(height: 8),
            const Text('Payment Successful', style: TextStyle(fontSize: 14, color: AppTheme.green, fontWeight: FontWeight.w600)),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.surface2,
                foregroundColor: AppTheme.textPrimary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
              ),
              child: const Text('Done', style: TextStyle(fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }
}
