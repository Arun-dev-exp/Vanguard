import 'package:flutter/material.dart';
import '../theme/sentinel_theme.dart';
import '../data/mock_data.dart';

class PayWidgets {
  // ── Avatar Circle ──
  static Widget avatar(String initials, int colorIndex, {double size = 48}) {
    final colors = MockData.avatarColors[colorIndex % MockData.avatarColors.length];
    return Container(
      width: size, height: size,
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [Color(colors[0]), Color(colors[1])], begin: Alignment.topLeft, end: Alignment.bottomRight),
        shape: BoxShape.circle,
      ),
      child: Center(child: Text(initials, style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: size * 0.32))),
    );
  }

  // ── Amount Text ──
  static Widget amount(double amt, bool isCredit, {double fontSize = 15}) {
    return Text(
      '${isCredit ? '+' : '-'} ₹${amt.toStringAsFixed(0)}',
      style: TextStyle(
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: isCredit ? AppTheme.green : AppTheme.textPrimary,
      ),
    );
  }

  // ── Action Button (circular icon + label) ──
  static Widget actionButton(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 26),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  // ── Section Header ──
  static Widget sectionHeader(String title, {String? action, VoidCallback? onAction}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
          if (action != null)
            GestureDetector(
              onTap: onAction,
              child: Text(action, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.primary)),
            ),
        ],
      ),
    );
  }
}
