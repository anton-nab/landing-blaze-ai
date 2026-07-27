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
    .select("id, url, report, created_at, share_slug")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    url: data.url,
    report: data.report as Report,
    createdAt: new Date(data.created_at).getTime(),
    shareSlug: data.share_slug ?? undefined,
  };
}

export async function getAuditBySlug(slug: string): Promise<StoredAudit | null> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("audits")
    .select("id, url, report, created_at, share_slug")
    .eq("share_slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    url: data.url,
    report: data.report as Report,
    createdAt: new Date(data.created_at).getTime(),
    shareSlug: data.share_slug ?? undefined,
  };
}

// userId is required — audits are personal history, not a global feed.
// (The dev-only in-memory store never tracked ownership, so it's skipped
// entirely once a real userId is involved; it only ever mattered pre-Supabase.)
export async function listRecentAudits(userId: string | undefined, limit = 8): Promise<StoredAudit[]> {
  if (!userId) return [];

  const supabase = getSupabaseServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("audits")
    .select("id, url, report, created_at, share_slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    url: row.url,
    report: row.report as Report,
    createdAt: new Date(row.created_at).getTime(),
    shareSlug: row.share_slug ?? undefined,
  }));
}
