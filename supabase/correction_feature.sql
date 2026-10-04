alter table public.documents drop constraint if exists documents_type_check;
alter table public.documents add constraint documents_type_check
  check (type in ('motivation_letter','cv','recommendation','letter_correction'));
