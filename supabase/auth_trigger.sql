-- À exécuter après schema.sql
-- Crée automatiquement une ligne dans profiles et subscriptions dès qu'un utilisateur s'inscrit via Supabase Auth.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, country)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'country');

  insert into public.subscriptions (user_id, plan)
  values (new.id, 'free');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
