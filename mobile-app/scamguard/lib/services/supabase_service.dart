import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';

class SupabaseService {
  static final SupabaseClient _client = Supabase.instance.client;

  /// Checks if a given UPI ID exists in the entity_risks table and is flagged as a scam.
  static Future<bool> isUpiScam(String upiId) async {
    try {
      final response = await _client
          .from('entity_risks')
          .select()
          .eq('entity_type', 'UPI')
          .eq('entity_value', upiId)
          .inFilter('status', ['ACTIVE', 'REPORTED'])
          .maybeSingle();

      if (response != null) {
        debugPrint('Scam found! Risk score: ${response['risk_score']}');
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error checking UPI scam status: $e');
      // On error, default to false so we don't block legitimate transactions
      return false;
    }
  }
}
