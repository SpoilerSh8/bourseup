-- À exécuter après schema.sql et auth_trigger.sql

alter table public.profiles add column is_admin boolean default false;

-- Passe TON compte en admin après ton inscription (remplace l'email) :
-- update public.profiles set is_admin = true
-- where id = (select id from auth.users where email = 'ton-email@exemple.com');


