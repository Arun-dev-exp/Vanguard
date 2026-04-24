import 'package:flutter/material.dart';
import '../theme/sentinel_theme.dart';
import 'home_screen.dart';
import 'history_screen.dart';
import 'scan_screen.dart';
import 'profile_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});
  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _idx = 0;

  final _screens = const [
    HomeScreen(),
    HistoryScreen(),
    ScanScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: IndexedStack(index: _idx, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface1,
          border: Border(top: BorderSide(color: AppTheme.divider.withValues(alpha: 0.3))),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _tab(0, Icons.home_rounded, Icons.home_outlined, 'Home'),
                _tab(1, Icons.receipt_long_rounded, Icons.receipt_long_outlined, 'History'),
                _scanButton(),
                _tab(3, Icons.person_rounded, Icons.person_outlined, 'Profile'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _tab(int idx, IconData activeIcon, IconData inactiveIcon, String label) {
    final active = _idx == idx;
    return GestureDetector(
      onTap: () => setState(() => _idx = idx),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(active ? activeIcon : inactiveIcon, color: active ? AppTheme.primary : AppTheme.textMuted, size: 24),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 11, color: active ? AppTheme.primary : AppTheme.textMuted, fontWeight: active ? FontWeight.w600 : FontWeight.w400)),
          ],
        ),
      ),
    );
  }

  Widget _scanButton() {
    return GestureDetector(
      onTap: () => setState(() => _idx = 2),
      child: Container(
        width: 56, height: 56,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [AppTheme.primary, Color(0xFF1A73E8)]),
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 26),
      ),
    );
  }
}
