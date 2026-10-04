create table public.reminder_log (
  id uuid primary key default uuid_generate_v4(),
  user_scholarship_id uuid references public.user_scholarships(id) on delete cascade,
  days_before int not null,
  sent_at timestamptz default now(),
  unique(user_scholarship_id, days_before)
);

-- RLS activé sans policy : seule la clé service_role (utilisée par l'Edge Function) y accède.
alter table public.reminder_log enable row level security;
