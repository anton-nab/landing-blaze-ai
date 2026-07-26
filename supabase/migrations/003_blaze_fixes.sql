-- Blaze Fix (Pro/Agency) : réécritures de copy avant/après, mises en cache par audit.
create table public.blaze_fixes (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null,
  created_at timestamptz not null default now()
);
create unique index blaze_fixes_audit_id_key on public.blaze_fixes (audit_id);
create index blaze_fixes_user_created on public.blaze_fixes (user_id, created_at desc);

alter table public.blaze_fixes enable row level security;
create policy "own blaze fixes" on public.blaze_fixes
  for select using (auth.uid() = user_id);
-- Écriture + lecture du cache partagé (par audit_id, quel que soit le user_id d'origine)
-- passent par la route API service-role — voir app/api/blaze-fix/route.ts.
