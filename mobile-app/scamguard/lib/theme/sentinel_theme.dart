import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  AppTheme._();

  // ── Core Colors ──
  static const Color bg = Color(0xFFF8F9FA); // Light gray background
  static const Color surface1 = Color(0xFFFFFFFF); // White cards
  static const Color surface2 = Color(0xFFF1F3F4); // Light gray highlights
  static const Color surface3 = Color(0xFFE8EAED); // Slightly darker gray highlights

  static const Color primary = Color(0xFF1A73E8);      // Google Blue
  static const Color green = Color(0xFF1E8E3E);         // Google Green
  static const Color yellow = Color(0xFFF9AB00);        // Google Yellow
  static const Color red = Color(0xFFD93025);           // Google Red
  static const Color teal = Color(0xFF00897B);

  static const Color textPrimary = Color(0xFF202124); // Dark gray text
  static const Color textSecondary = Color(0xFF5F6368); // Medium gray text
  static const Color textMuted = Color(0xFF80868B); // Light gray text
  static const Color divider = Color(0xFFDADCE0); // Light gray divider

  static ThemeData get lightTheme {
    final textTheme = GoogleFonts.interTextTheme(ThemeData.light().textTheme);
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.light(
        surface: bg,
        primary: primary,
        secondary: teal,
        error: red,
      ),
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: bg,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: textPrimary),
        titleTextStyle: textTheme.titleLarge?.copyWith(color: textPrimary, fontWeight: FontWeight.w600),
      ),
    );
  }

  // Backwards compatibility for main.dart that might be calling AppTheme.darkTheme
  static ThemeData get darkTheme => lightTheme;
}
