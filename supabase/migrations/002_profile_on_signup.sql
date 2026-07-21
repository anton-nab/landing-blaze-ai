-- Auto-crée une ligne public.profiles (plan='free') à chaque inscription Supabase Auth.
-- À exécuter une fois dans le SQL Editor du projet (schema.sql a déjà créé la table profiles).

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
