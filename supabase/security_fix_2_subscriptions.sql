create or replace function public.prevent_self_plan_escalation()
returns trigger as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(current_setting('request.jwt.claims', true)::json->>'role', 'service_role');
  if jwt_role <> 'service_role' then
    if new.plan is distinct from old.plan then
      new.plan := old.plan;
    end if;
    if new.bonus_generations is distinct from old.bonus_generations then
      new.bonus_generations := old.bonus_generations;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists block_self_plan_escalation on public.subscriptions;
create trigger block_self_plan_escalation
before update on public.subscriptions
for each row execute function public.prevent_self_plan_escalation();
