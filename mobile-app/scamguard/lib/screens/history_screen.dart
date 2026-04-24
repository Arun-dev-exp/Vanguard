import 'package:flutter/material.dart';
import '../theme/sentinel_theme.dart';
import '../data/mock_data.dart';
import '../widgets/components.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});
  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String _filter = 'all';

  List<Transaction> get _filtered {
    if (_filter == 'all') return MockData.transactions;
    if (_filter == 'sent') return MockData.transactions.where((t) => !t.isCredit).toList();
    return MockData.transactions.where((t) => t.isCredit).toList();
  }

  Map<String, List<Transaction>> get _grouped {
    final map = <String, List<Transaction>>{};
    for (final t in _filtered) {
      map.putIfAbsent(t.date, () => []).add(t);
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  const Text('Transaction History', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                  const Spacer(),
                  IconButton(icon: const Icon(Icons.download_outlined, color: AppTheme.textMuted), onPressed: () {}),
                ],
              ),
            ),
          ),

          // Filter chips
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
              child: Row(
                children: [
                  _chip('All', 'all'),
                  const SizedBox(width: 8),
                  _chip('Sent', 'sent'),
                  const SizedBox(width: 8),
                  _chip('Received', 'received'),
                ],
              ),
            ),
          ),

          // Transaction groups
          ..._grouped.entries.expand((entry) => [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Text(entry.key, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textMuted)),
              ),
            ),
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (_, i) => _txTile(entry.value[i]),
                childCount: entry.value.length,
              ),
            ),
          ]),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _chip(String label, String value) {
    final active = _filter == value;
    return GestureDetector(
      onTap: () => setState(() => _filter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppTheme.primary : AppTheme.surface2,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: active ? Colors.white : AppTheme.textSecondary)),
      ),
    );
  }

  Widget _txTile(Transaction t) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppTheme.surface1, borderRadius: BorderRadius.circular(14)),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: (t.isCredit ? AppTheme.green : AppTheme.red).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(t.isCredit ? Icons.south_west_rounded : Icons.north_east_rounded,
                color: t.isCredit ? AppTheme.green : AppTheme.red, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(t.name, style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary, fontSize: 14)),
                  Text(t.upiId, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                PayWidgets.amount(t.amount, t.isCredit),
                Text(t.time, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
