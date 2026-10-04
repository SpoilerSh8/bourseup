-- À exécuter après admin_role.sql

create table public.admin_audit_log (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid references public.profiles(id),
  target_user_id uuid references public.profiles(id),
  action text not null,
  reason text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.admin_audit_log enable row level security;

alter table public.subscriptions add column bonus_generations int default 0;

create or replace view public.admin_user_overview as
select
  p.id,
  p.full_name,
  p.country,
  p.is_admin,
  coalesce(s.plan, 'free') as plan,
  coalesce(s.bonus_generations, 0) as bonus_generations,
  (select count(*) from public.documents d where d.user_id = p.id) as documents_count,
  (select max(d.created_at) from public.documents d where d.user_id = p.id) as last_activity_at,
  p.created_at
from public.profiles p
left join public.subscriptions s on s.user_id = p.id;
