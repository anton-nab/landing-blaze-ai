import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Anon-key, session-aware client for Server Components / Route Handlers —
// reads the signed-in user from cookies. NOT the same as lib/supabase/server.ts,
// which is the service-role admin client used by the audit pipeline (no session,
// bypasses RLS). Keep the two separate: this one respects RLS as the current user.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session on the next request instead. Safe to ignore.
          }
        },
      },
    },
  );
}
