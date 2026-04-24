import 'package:flutter_test/flutter_test.dart';
import 'package:scamguard/main.dart';

void main() {
  testWidgets('ScamGuard app launches', (WidgetTester tester) async {
    await tester.pumpWidget(const ScamGuardApp());
    expect(find.text('ScamGuard'), findsOneWidget);
  });
}
