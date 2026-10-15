import { supabase } from "./supabaseClient";

// fetch qui joint le vrai jeton de connexion à chaque appel admin.
export async function adminFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${session?.access_token}` },
  });
}
