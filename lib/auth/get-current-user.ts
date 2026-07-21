import { createClient } from "@/lib/supabase/server-client";

export type Plan = "free" | "pro" | "agency";

export interface CurrentUser {
  id: string;
  email: string;
  plan: Plan;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();

  return {
    id: user.id,
    email: user.email ?? "",
    plan: (profile?.plan as Plan | undefined) ?? "free",
  };
}
