import 'package:flutter/material.dart';
import '../theme/sentinel_theme.dart';

class ScamAlertDialog extends StatelessWidget {
  final String upiId;

  const ScamAlertDialog({super.key, required this.upiId});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppTheme.surface1,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppTheme.red.withValues(alpha: 0.3), width: 2),
          boxShadow: [
            BoxShadow(
              color: AppTheme.red.withValues(alpha: 0.15),
              blurRadius: 40,
              spreadRadius: 10,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Warning Icon
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.red.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.gpp_bad_rounded,
                color: AppTheme.red,
                size: 48,
              ),
            ),
            const SizedBox(height: 20),
            
            // Title
            const Text(
              'Security Alert',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppTheme.red,
              ),
            ),
            const SizedBox(height: 12),
            
            // Description
            RichText(
              textAlign: TextAlign.center,
              text: TextSpan(
                style: const TextStyle(
                  fontSize: 15,
                  color: AppTheme.textPrimary,
                  height: 1.5,
                ),
                children: [
                  const TextSpan(text: 'The UPI ID '),
                  TextSpan(
                    text: upiId,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const TextSpan(
                    text: ' has been reported multiple times for fraudulent activities.\n\nSending money to this account is highly unsafe.',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // Actions
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.red,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                  elevation: 0,
                ),
                onPressed: () => Navigator.of(context).pop(false), // Return false (cancel)
                child: const Text(
                  'Cancel Transaction',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Proceed Anyway (subtle)
            GestureDetector(
              onTap: () => Navigator.of(context).pop(true), // Return true (proceed)
              child: const Text(
                'Proceed anyway (Not Recommended)',
                style: TextStyle(
                  fontSize: 13,
                  color: AppTheme.textMuted,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Helper to show the dialog and wait for the result
  static Future<bool> show(BuildContext context, String upiId) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => ScamAlertDialog(upiId: upiId),
    );
    return result ?? false;
  }
}
