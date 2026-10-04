alter table public.user_scholarships add column if not exists checked_documents jsonb default '[]';

-- 1. D'abord corriger les données existantes
update public.user_scholarships set status = 'interested' where status = 'applied';

-- 2. Ensuite seulement, retirer l'ancienne contrainte et poser la nouvelle
alter table public.user_scholarships drop constraint if exists user_scholarships_status_check;
alter table public.user_scholarships add constraint user_scholarships_status_check
  check (status in ('interested','submitted','accepted','rejected'));
