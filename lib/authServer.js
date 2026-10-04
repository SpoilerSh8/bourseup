import { supabaseAdmin } from "./supabaseClient";

// Retrouve l'utilisateur réel à partir du jeton de session envoyé par le navigateur.
export async function getUserFromRequest(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error) return null;
  return data.user;
}
