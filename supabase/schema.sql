-- ScholarPrep — schéma de base de données (Postgres / Supabase)
-- À exécuter dans l'éditeur SQL de Supabase.

-- Extension pour les UUID
create extension if not exists "uuid-ossp";

-- ============ USERS ============
-- Supabase gère déjà auth.users (email, password). On étend avec un profil.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  country text,
  target_degree text check (target_degree in ('bachelor','master','phd')),
  created_at timestamptz default now()
);

-- ============ SCHOLARSHIPS ============
create table public.scholarships (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  provider text,
  country text,
  level text check (level in ('bachelor','master','phd')),
  deadline date,
  eligibility_criteria text,
  required_documents jsonb default '[]',
  word_limit int,
  official_link text,
  created_at timestamptz default now()
);

-- ============ USER_SCHOLARSHIPS (relation many-to-many) ============
create table public.user_scholarships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  scholarship_id uuid references public.scholarships(id) on delete cascade,
  status text check (status in ('interested','applied','submitted','rejected','accepted')) default 'interested',
  reminder_date date,
  created_at timestamptz default now(),
  unique(user_id, scholarship_id)
);

-- ============ DOCUMENTS ============
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  scholarship_id uuid references public.scholarships(id) on delete set null,
  type text check (type in ('motivation_letter','cv','recommendation')) default 'motivation_letter',
  input_text text,
  generated_text text,
  version int default 1,
  created_at timestamptz default now()
);

-- ============ SUBSCRIPTIONS ============
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade unique,
  plan text check (plan in ('free','pro')) default 'free',
  stripe_customer_id text,
  status text default 'active',
  current_period_end timestamptz
);

-- ============ GENERATION_LOGS ============
create table public.generation_logs (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references public.documents(id) on delete cascade,
  tokens_used int,
  cost_usd numeric(10,4),
  created_at timestamptz default now()
);

-- ============ RLS (Row Level Security) ============
-- Chaque utilisateur ne voit que ses propres données ; les bourses sont publiques en lecture.
alter table public.profiles enable row level security;
alter table public.user_scholarships enable row level security;
alter table public.documents enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scholarships enable row level security;

create policy "Public read scholarships" on public.scholarships
  for select using (true);

create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users manage own tracked scholarships" on public.user_scholarships
  for all using (auth.uid() = user_id);

create policy "Users manage own documents" on public.documents
  for all using (auth.uid() = user_id);

create policy "Users manage own subscription" on public.subscriptions
  for all using (auth.uid() = user_id);

-- Index utiles
create index idx_scholarships_deadline on public.scholarships(deadline);
create index idx_documents_user on public.documents(user_id);
create index idx_user_scholarships_user on public.user_scholarships(user_id);
