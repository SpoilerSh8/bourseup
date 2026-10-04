alter table public.scholarships add column if not exists letter_type text default 'motivation_letter';
alter table public.scholarships add column if not exists letter_format_notes text;
