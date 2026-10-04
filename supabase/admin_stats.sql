alter table public.documents add column if not exists scholarship_name text;

create or replace view public.admin_scholarship_stats as
select
  s.id,
  s.name,
  s.country,
  s.level,
  s.deadline,
  (select count(*) from public.user_scholarships us where us.scholarship_id = s.id) as followers_count,
  (select count(*) from public.user_scholarships us where us.scholarship_id = s.id and us.status = 'interested') as interested_count,
  (select count(*) from public.user_scholarships us where us.scholarship_id = s.id and us.status = 'submitted') as submitted_count,
  (select count(*) from public.user_scholarships us where us.scholarship_id = s.id and us.status = 'accepted') as accepted_count,
  (select count(*) from public.user_scholarships us where us.scholarship_id = s.id and us.status = 'rejected') as rejected_count,
  (select count(*) from public.documents d where d.scholarship_id = s.id) as letters_count,
  (select count(*) from public.documents d where d.scholarship_id = s.id and d.unlocked) as letters_unlocked_count,
  (select coalesce(sum(g.cost_usd), 0)
     from public.generation_logs g
     join public.documents d on d.id = g.document_id
     where d.scholarship_id = s.id) as ai_cost_usd
from public.scholarships s;

-- Ces vues ne doivent être lisibles que par les routes serveur (clé service_role).
revoke all on public.admin_scholarship_stats from anon, authenticated;
revoke all on public.admin_user_overview from anon, authenticated;
