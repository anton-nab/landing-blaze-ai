import { createClient } from "@supabase/supabase-js";

// Server-only client (service role — bypasses RLS). Never import this from client components.
// Returns null when Supabase isn't configured yet, so audit persistence degrades
// gracefully to the in-memory store (see lib/audit/store.ts) during early local dev.
export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
