import { supabaseAdmin } from "../../../lib/supabaseClient";
import { requireAdminFromRequest, logAdminAction } from "../../../lib/adminGuard";

const ALLOWED_ACTIONS = ["set_plan", "grant_bonus", "toggle_admin"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const auth = await requireAdminFromRequest(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });
  const adminUserId = auth.user.id;
  const { targetUserId, action, value, reason } = req.body;
  if (!ALLOWED_ACTIONS.includes(action)) {
    return res.status(400).json({ error: "Action inconnue." });
  }
  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId requis." });
  }
  // La justification est vérifiée AVANT toute modification.
  if (!reason || reason.trim().length < 3) {
    return res.status(400).json({ error: "Une justification (raison) est requise pour cette action." });
  }

  const admin = supabaseAdmin();

  try {
    if (action === "set_plan") {
      if (!["free", "pro"].includes(value)) return res.status(400).json({ error: "value doit être 'free' ou 'pro'." });
      // Un Pro accordé manuellement par un admin n'expire pas tout seul (pas de current_period_end).
      await admin.from("subscriptions").update({ plan: value, current_period_end: null }).eq("user_id", targetUserId);
    }

    if (action === "grant_bonus") {
      const amount = parseInt(value, 10) || 1;
      const { data: sub } = await admin.from("subscriptions").select("bonus_generations").eq("user_id", targetUserId).single();
      await admin.from("subscriptions").update({ bonus_generations: (sub?.bonus_generations || 0) + amount }).eq("user_id", targetUserId);
    }

    if (action === "toggle_admin") {
      if (value) {
        const { count } = await admin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("is_admin", true);
        if ((count || 0) >= 2) {
          return res.status(400).json({ error: "Limite atteinte : 2 comptes admin maximum. Retire d'abord un accès existant." });
        }
      }
      await admin.from("profiles").update({ is_admin: !!value }).eq("id", targetUserId);
    }

    await logAdminAction({ adminId: adminUserId, targetUserId, action, reason, metadata: { value } });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de l'action admin." });
  }
}
