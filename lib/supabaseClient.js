import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client côté navigateur (respecte les policies RLS liées à l'utilisateur connecté)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client côté serveur avec la clé service_role (à utiliser UNIQUEMENT dans pages/api,
// jamais exposé au navigateur) — nécessaire pour écrire generation_logs, etc.
export function supabaseAdmin() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
