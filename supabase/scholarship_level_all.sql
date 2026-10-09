alter table public.scholarships drop constraint if exists scholarships_level_check;
alter table public.scholarships add constraint scholarships_level_check
  check (level in ('bachelor','master','phd','all'));
