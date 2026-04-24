// ============================================================
// ScamGuard — User Store (Supabase)
// Manages Telegram bot user registrations
// ============================================================

import supabase from "./db.js";

/**
 * Register a new user (phone → Telegram chatId mapping).
 * Upserts — if phone already registered, updates chatId and name.
 */
export async function registerUser(phoneNumber, chatId, name = "User") {
  const normalized = normalizePhone(phoneNumber);

  const { data, error } = await supabase
    .from("users")
    .upsert(
      { phone_number: normalized, chat_id: chatId, name },
      { onConflict: "phone_number" }
    )
    .select()
    .single();

  if (error) {
    console.error("[UserStore] Registration failed:", error.message);
    throw error;
  }

  console.log(`[UserStore] Registered: ${normalized} → chatId ${chatId}`);
  return data;
}

/**
 * Find a user by their phone number.
 * Returns null if not found (caller is not registered).
 */
export async function findUserByPhone(phoneNumber) {
  const normalized = normalizePhone(phoneNumber);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone_number", normalized)
    .maybeSingle();

  if (error) {
    console.error("[UserStore] Lookup failed:", error.message);
    return null;
  }

  return data;
}

/**
 * Find a user by their Telegram chatId.
 */
export async function findUserByChatId(chatId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle();

  if (error) {
    console.error("[UserStore] ChatId lookup failed:", error.message);
    return null;
  }

  return data;
}

/**
 * Get all registered users.
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[UserStore] List failed:", error.message);
    return [];
  }

  return data;
}

/**
 * Normalize phone number to E.164 format.
 * Ensures consistent lookups regardless of input format.
 */
function normalizePhone(phone) {
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (!cleaned.startsWith("+")) {
    // Assume Indian number if no country code
    cleaned = cleaned.startsWith("0") ? "+91" + cleaned.slice(1) : "+91" + cleaned;
  }
  return cleaned;
}
