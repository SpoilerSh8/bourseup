alter table public.profiles add column if not exists whatsapp_number text;
alter table public.profiles add column if not exists whatsapp_opt_in boolean default false;
