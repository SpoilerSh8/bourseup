-- Personne, côté client (anon ou authenticated), ne doit jamais lire ou écrire
-- directement dans "documents" — tout passe déjà par les routes API (service_role),
-- qui appliquent la logique d'aperçu et de déblocage. On retire donc tout accès client.
drop policy if exists "Users manage own documents" on public.documents;
