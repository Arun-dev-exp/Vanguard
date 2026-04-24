import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'theme/sentinel_theme.dart';
import 'screens/main_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF121212),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  await Supabase.initialize(
    url: 'https://ecrtsqbpgjupiqoasoqr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcnRzcWJwZ2p1cGlxb2Fzb3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTUwODUsImV4cCI6MjA5MjU5MTA4NX0.I_mHd-Z1emRCRzchmNA8rQg2b3aq31-8NwtojX-weWk',
  );

  runApp(const ScamGuardApp());
}

class ScamGuardApp extends StatelessWidget {
  const ScamGuardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VenguardPay',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainShell(),
    );
  }
}
