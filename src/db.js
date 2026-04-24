// ============================================================
// ScamGuard — Supabase Client
// Uses service_role key for server-side operations
// ============================================================

import { createClient } from "@supabase/supabase-js";
import config from "./config.js";

// Service role client — bypasses RLS for server-side CRUD
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
