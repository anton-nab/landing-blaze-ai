-- Schéma Supabase — LandingBlaze
create table public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null, -- null = audit anonyme
  url text not null,
  score int not null check (score between 0 and 100),
  report jsonb not null,           -- Report complet (types.ts), reportVersion inclus
  screenshot_url text,
  share_slug text unique default encode(gen_random_bytes(6), 'hex'), -- /r/[slug]
  created_at timestamptz not null default now()
);
create index audits_user_created on public.audits (user_id, created_at desc);
create index audits_url on public.audits (url);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','pro','agency')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.audits enable row level security;
alter table public.profiles enable row level security;

create policy "own audits" on public.audits
  for select using (auth.uid() = user_id);
create policy "insert own audits" on public.audits
  for insert with check (auth.uid() = user_id or user_id is null);
-- Lecture publique par share_slug : passer par une route API service-role
-- (ne pas ouvrir de policy select publique sur la table).

create policy "own profile" on public.profiles
  for select using (auth.uid() = id);

-- Auto-crée une ligne profiles (plan='free') à chaque inscription Supabase Auth.
-- Voir migrations/002_profile_on_signup.sql pour l'exécuter sur un projet existant.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Blaze Fix (Pro/Agency) : réécritures de copy avant/après, mises en cache par audit.
-- Voir migrations/003_blaze_fixes.sql pour l'exécuter sur un projet existant.
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
