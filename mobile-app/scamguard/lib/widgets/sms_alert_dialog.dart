import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/sms_analyzer_service.dart';
import '../theme/sentinel_theme.dart';

class SmsAlertDialog extends StatelessWidget {
  final SmsAnalysisResult analysis;
  final VoidCallback onDismiss;

  const SmsAlertDialog({
    super.key,
    required this.analysis,
    required this.onDismiss,
  });

  static void show(BuildContext context, SmsAnalysisResult analysis) {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: Colors.transparent,
      builder: (context) => SmsAlertDialog(
        analysis: analysis,
        onDismiss: () => Navigator.pop(context),
      ),
    );
  }

  Future<void> _reportToBot() async {
    const String botUsername = "VanguardAIBot"; // Replace with actual bot username
    final String text = Uri.encodeComponent("Suspicious SMS detected:\n\n${analysis.rawMessage}");
    final Uri url = Uri.parse("tg://resolve?domain=$botUsername&text=$text");

    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      // Fallback to web link if Telegram app is not installed
      final Uri webUrl = Uri.parse("https://t.me/$botUsername?text=$text");
      if (await canLaunchUrl(webUrl)) {
        await launchUrl(webUrl, mode: LaunchMode.externalApplication);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isHighRisk = analysis.riskLevel == 'HIGH_RISK';
    final Color riskColor = isHighRisk ? AppTheme.red : Colors.orange;
    final IconData riskIcon = isHighRisk ? Icons.gpp_bad_rounded : Icons.warning_rounded;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: AppTheme.surface1,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: riskColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(riskIcon, color: riskColor, size: 32),
            ),
            const SizedBox(height: 16),
            Text(
              isHighRisk ? 'Critical Scam Alert' : 'Suspicious Message',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: riskColor,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surface2,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.divider),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.analytics_outlined, color: AppTheme.textSecondary, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        'Pattern: ${analysis.pattern}',
                        style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    analysis.reason,
                    style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary, height: 1.4),
                  ),
                  const Divider(height: 24, color: AppTheme.divider),
                  Row(
                    children: [
                      Icon(Icons.shield_outlined, color: riskColor, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          analysis.action,
                          style: TextStyle(fontWeight: FontWeight.w700, color: riskColor),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: onDismiss,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Dismiss', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _reportToBot,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: const Text('Report to Bot', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
