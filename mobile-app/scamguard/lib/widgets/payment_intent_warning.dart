import 'package:flutter/material.dart';
import '../services/qr_analyzer_service.dart';
import '../theme/sentinel_theme.dart';

class PaymentIntentWarning extends StatelessWidget {
  final QRAnalysisResult analysis;

  const PaymentIntentWarning({super.key, required this.analysis});

  @override
  Widget build(BuildContext context) {
    if (analysis.riskLevel == RiskLevel.HIGH) return const SizedBox.shrink(); // High risk handled by ScamAlertDialog

    final isMedium = analysis.riskLevel == RiskLevel.MEDIUM;
    final bgColor = isMedium ? Colors.orange.withValues(alpha: 0.1) : AppTheme.primary.withValues(alpha: 0.1);
    final borderColor = isMedium ? Colors.orange.withValues(alpha: 0.3) : AppTheme.primary.withValues(alpha: 0.3);
    final iconColor = isMedium ? Colors.orange : AppTheme.primary;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline_rounded, color: iconColor, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  analysis.message,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  analysis.reason,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
