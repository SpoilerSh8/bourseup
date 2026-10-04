import { supabase } from "../../../lib/supabaseClient";
import { requireAdmin, logAdminAction } from "../../../lib/adminGuard";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { adminUserId, targetUserId, targetEmail, reason } = req.body;

  if (!(await requireAdmin(adminUserId))) {
    return res.status(403).json({ error: "Accès réservé aux admins." });
  }
  if (!targetEmail) return res.status(400).json({ error: "targetEmail requis." });
  if (!reason || reason.trim().length < 3) {
    return res.status(400).json({ error: "Une justification est requise." });
  }

  // On déclenche l'email de récupération standard de Supabase — l'admin ne voit
  // jamais le lien ni ne définit lui-même le mot de passe. C'est l'utilisateur
  // qui choisit son nouveau mot de passe, via le lien reçu par email.
  const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) return res.status(500).json({ error: error.message });

  await logAdminAction({
    adminId: adminUserId,
    targetUserId,
    action: "trigger_password_reset",
    reason,
    metadata: { email: targetEmail },
  });

  return res.status(200).json({ success: true });
}
