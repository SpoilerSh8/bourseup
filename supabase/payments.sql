create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  provider text default 'paydunya',
  invoice_token text unique,
  amount numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Users view own payments" on public.payments
  for select using (auth.uid() = user_id);
-- Les écritures ne passent que par service_role (routes /api/checkout/*)
