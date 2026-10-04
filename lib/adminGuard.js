import { supabaseAdmin } from "./supabaseClient";

export async function requireAdmin(userId) {
  if (!userId) return false;
  const admin = supabaseAdmin();
  const { data } = await admin.from("profiles").select("is_admin").eq("id", userId).single();
  return !!data?.is_admin;
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
