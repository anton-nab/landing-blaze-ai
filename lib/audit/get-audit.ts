import { auditStore, type StoredAudit } from "./store";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { Report } from "./types";

export async function getAuditById(id: string): Promise<StoredAudit | null> {
  const local = auditStore.get(id);
  if (local) return local;

  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("audits")
    .select("id, url, report, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    url: data.url,
    report: data.report as Report,
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function listRecentAudits(limit = 8): Promise<StoredAudit[]> {
  const local = [...auditStore.values()].sort((a, b) => b.createdAt - a.createdAt);
  if (local.length > 0) return local.slice(0, limit);

  const supabase = getSupabaseServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("audits")
    .select("id, url, report, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    url: row.url,
    report: row.report as Report,
    createdAt: new Date(row.created_at).getTime(),
  }));
}
