create or replace function public.prevent_self_admin_escalation()
returns trigger as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(current_setting('request.jwt.claims', true)::json->>'role', 'service_role');
  if jwt_role <> 'service_role' and new.is_admin is distinct from old.is_admin then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists block_self_admin_escalation on public.profiles;
create trigger block_self_admin_escalation
before update on public.profiles
for each row execute function public.prevent_self_admin_escalation();
