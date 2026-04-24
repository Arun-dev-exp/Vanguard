import 'package:flutter/material.dart';
import '../theme/sentinel_theme.dart';
import '../data/mock_data.dart';
import '../widgets/components.dart';
import 'send_money_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: CustomScrollView(
        slivers: [
          // ── Top Bar ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  // Profile pic
                  Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.teal]),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(child: Text('AK', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14))),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Hi, Arun', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                      Text('arun@okaxis', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                    ],
                  ),
                  const Spacer(),
                  _iconBtn(Icons.notifications_outlined),
                  const SizedBox(width: 4),
                  _iconBtn(Icons.search),
                ],
              ),
            ),
          ),

          // ── Balance Card ──
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1A237E), Color(0xFF0D47A1), Color(0xFF1565C0)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.2), blurRadius: 20, offset: const Offset(0, 8))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Balance', style: TextStyle(fontSize: 13, color: Colors.white70)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.account_balance, size: 14, color: Colors.white70),
                            SizedBox(width: 4),
                            Text('AXIS', style: TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('₹ 24,580.50', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -1)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _balanceChip('↑ Sent', '₹12,340', Colors.white70),
                      const SizedBox(width: 16),
                      _balanceChip('↓ Received', '₹18,000', const Color(0xFF81C784)),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── Quick Actions ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  PayWidgets.actionButton(Icons.arrow_upward_rounded, 'Send', AppTheme.primary, () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const SendMoneyScreen()));
                  }),
                  PayWidgets.actionButton(Icons.arrow_downward_rounded, 'Request', AppTheme.green, () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Request money tapped')));
                  }),
                  PayWidgets.actionButton(Icons.receipt_outlined, 'Bills', AppTheme.yellow, () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pay Bills tapped')));
                  }),
                  PayWidgets.actionButton(Icons.phone_android_rounded, 'Recharge', AppTheme.red, () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mobile Recharge tapped')));
                  }),
                ],
              ),
            ),
          ),

          // ── People (Horizontal scroll) ──
          SliverToBoxAdapter(child: PayWidgets.sectionHeader('People', action: 'See all')),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 90,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: MockData.recentContacts.length,
                itemBuilder: (_, i) {
                  final c = MockData.recentContacts[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: GestureDetector(
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => SendMoneyScreen(prefill: c)));
                      },
                      child: Column(
                        children: [
                          PayWidgets.avatar(c.initials, c.color),
                          const SizedBox(height: 6),
                          Text(c.name.split(' ')[0], style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // ── Promotions Banner ──
          SliverToBoxAdapter(
            child: GestureDetector(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Promo activated!')));
              },
              child: Container(
                margin: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.teal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.teal.withValues(alpha: 0.2)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(color: AppTheme.teal.withValues(alpha: 0.15), shape: BoxShape.circle),
                      child: const Icon(Icons.card_giftcard, color: AppTheme.teal, size: 22),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Cashback Offer!', style: TextStyle(fontWeight: FontWeight.w700, color: AppTheme.textPrimary, fontSize: 14)),
                          Text('Get ₹50 cashback on your next bill payment', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: AppTheme.textMuted),
                  ],
                ),
              ),
            ),
          ),

          // ── Recent Transactions ──
          SliverToBoxAdapter(child: PayWidgets.sectionHeader('Recent Transactions', action: 'See all')),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) {
                final t = MockData.transactions[i];
                return GestureDetector(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Transaction details for ${t.name}')));
                  },
                  child: _transactionTile(t),
                );
              },
              childCount: 5,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  static Widget _iconBtn(IconData icon) {
    return Container(
      width: 40, height: 40,
      decoration: BoxDecoration(color: AppTheme.surface2, shape: BoxShape.circle),
      child: Icon(icon, color: AppTheme.textSecondary, size: 20),
    );
  }

  static Widget _balanceChip(String label, String value, Color valueColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.white54)),
        Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: valueColor)),
      ],
    );
  }

  Widget _transactionTile(Transaction t) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.surface1,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: (t.isCredit ? AppTheme.green : AppTheme.primary).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                t.isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                color: t.isCredit ? AppTheme.green : AppTheme.primary,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(t.name, style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary, fontSize: 14)),
                  Text(t.time, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                ],
              ),
            ),
            PayWidgets.amount(t.amount, t.isCredit),
          ],
        ),
      ),
    );
  }
}
