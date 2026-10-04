import { supabaseAdmin } from "../../../lib/supabaseClient";
import { requireAdmin } from "../../../lib/adminGuard";
import { getUserFromRequest } from "../../../lib/authServer";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  // Identité vérifiée via le jeton de session, pas via un id envoyé par le navigateur.
  const user = await getUserFromRequest(req);
  if (!user || !(await requireAdmin(user.id))) {
    return res.status(403).json({ error: "Accès réservé aux admins." });
  }

  const admin = supabaseAdmin();

  const { data: stats, error } = await admin
    .from("admin_scholarship_stats")
    .select("*");
  if (error) return res.status(500).json({ error: error.message });

  // Lettres générées pour des bourses absentes du catalogue, regroupées par nom saisi.
  const { data: orphans } = await admin
    .from("documents")
    .select("scholarship_name")
    .eq("type", "motivation_letter")
    .is("scholarship_id", null);

  const groups = {};
  (orphans || []).forEach((d) => {
    const raw = (d.scholarship_name || "").trim();
    if (!raw) return;
    const key = raw.toLowerCase();
    groups[key] = groups[key] || { name: raw, count: 0 };
    groups[key].count += 1;
  });
  const uncatalogued = Object.values(groups).sort((a, b) => b.count - a.count).slice(0, 10);

  return res.status(200).json({ stats, uncatalogued });
}
