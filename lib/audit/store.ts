import type { Report } from "./types";

export interface StoredAudit {
  id: string;
  url: string;
  report: Report;
  createdAt: number;
  shareSlug?: string;
}

// Dev-only in-memory cache (survives HMR via globalThis, not process restarts).
// Real persistence goes through Supabase (see lib/supabase/server.ts) once configured.
const g = globalThis as unknown as { __auditStore?: Map<string, StoredAudit> };
if (!g.__auditStore) g.__auditStore = new Map();

export const auditStore = g.__auditStore;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function findRecentAuditByUrl(url: string): StoredAudit | undefined {
  const now = Date.now();
  for (const audit of auditStore.values()) {
    if (audit.url === url && now - audit.createdAt < ONE_DAY_MS) return audit;
  }
  return undefined;
}
