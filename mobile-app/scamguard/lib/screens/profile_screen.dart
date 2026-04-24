import 'package:flutter/material.dart';
import '../theme/sentinel_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),

            // Profile header
            Container(
              width: 72, height: 72,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.teal]),
                shape: BoxShape.circle,
              ),
              child: const Center(child: Text('AK', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 24))),
            ),
            const SizedBox(height: 12),
            const Text('Arun Kumar', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            const Text('+91 90000 00001', style: TextStyle(fontSize: 14, color: AppTheme.textMuted)),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: AppTheme.surface2, borderRadius: BorderRadius.circular(12)),
              child: const Text('arun@okaxis', style: TextStyle(fontSize: 12, color: AppTheme.primary, fontWeight: FontWeight.w500)),
            ),
            const SizedBox(height: 24),

            // Bank accounts card
            _section('Bank Accounts', [
              _bankTile('Axis Bank', '•••• 4521', 'Savings', AppTheme.primary),
              _bankTile('HDFC Bank', '•••• 7890', 'Savings', AppTheme.red),
            ]),

            // Payment settings
            _section('Payment Settings', [
              _settingTile(Icons.account_balance_wallet_outlined, 'UPI Settings', null),
              _settingTile(Icons.lock_outline, 'UPI PIN', null),
              _settingTile(Icons.notifications_outlined, 'Notifications', null),
              _settingTile(Icons.language, 'Language', 'English'),
            ]),

            // Security
            _section('Security', [
              _settingTile(Icons.fingerprint, 'Biometric Lock', null, hasSwitch: true),
              _settingTile(Icons.history, 'Login Activity', null),
              _settingTile(Icons.privacy_tip_outlined, 'Privacy', null),
            ]),

            // Support
            _section('Support', [
              _settingTile(Icons.help_outline, 'Help & FAQ', null),
              _settingTile(Icons.feedback_outlined, 'Report an Issue', null),
              _settingTile(Icons.info_outline, 'About', 'v1.0.0'),
            ]),

            const SizedBox(height: 16),
            TextButton(
              onPressed: () {},
              child: const Text('Log Out', style: TextStyle(color: AppTheme.red, fontWeight: FontWeight.w600, fontSize: 15)),
            ),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, List<Widget> children) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textMuted)),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(color: AppTheme.surface1, borderRadius: BorderRadius.circular(16)),
            child: Column(children: children),
          ),
        ],
      ),
    );
  }

  Widget _bankTile(String bank, String number, String type, Color color) {
    return ListTile(
      leading: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
        child: Icon(Icons.account_balance, color: color, size: 20),
      ),
      title: Text(bank, style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary, fontSize: 14)),
      subtitle: Text('$number · $type', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
      trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 20),
    );
  }

  Widget _settingTile(IconData icon, String title, String? subtitle, {bool hasSwitch = false}) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.textSecondary, size: 22),
      title: Text(title, style: const TextStyle(fontSize: 14, color: AppTheme.textPrimary)),
      trailing: hasSwitch
          ? Switch(value: true, onChanged: (_) {}, activeTrackColor: AppTheme.primary)
          : subtitle != null
              ? Text(subtitle, style: const TextStyle(fontSize: 13, color: AppTheme.textMuted))
              : const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 20),
    );
  }
}
