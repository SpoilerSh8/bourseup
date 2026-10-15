import { supabaseAdmin } from "./supabaseClient";
import { getUserFromRequest } from "./authServer";

export async function requireAdmin(userId) {
  if (!userId) return false;
  const admin = supabaseAdmin();
  const { data } = await admin.from("profiles").select("is_admin").eq("id", userId).single();
  return !!data?.is_admin;
}

// Vérifie l'identité RÉELLE via le jeton de session envoyé dans l'en-tête Authorization
// (jamais un id transmis par le client), puis confirme que CET utilisateur est admin.
export async function requireAdminFromRequest(req) {
  const user = await getUserFromRequest(req);
  if (!user) return { error: "Non connecté.", status: 401 };
  if (!(await requireAdmin(user.id))) return { error: "Accès réservé aux admins.", status: 403 };
  return { user };
}

export async function logAdminAction({ adminId, targetUserId, action, reason, metadata }) {
  const admin = supabaseAdmin();
  await admin.from("admin_audit_log").insert({
    admin_id: adminId,
    target_user_id: targetUserId || null,
    action,
    reason: reason || null,
    metadata: metadata || null,
  });
}
