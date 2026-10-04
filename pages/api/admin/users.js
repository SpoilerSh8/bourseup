import { supabaseAdmin } from "../../../lib/supabaseClient";
import { requireAdmin, logAdminAction } from "../../../lib/adminGuard";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  const { adminUserId, q } = req.query;
  if (!(await requireAdmin(adminUserId))) {
    return res.status(403).json({ error: "Accès réservé aux admins." });
  }

  const admin = supabaseAdmin();

  const { data: overview, error: overviewError } = await admin
    .from("admin_user_overview")
    .select("*")
    .order("created_at", { ascending: false });

  if (overviewError) return res.status(500).json({ error: overviewError.message });

  const { data: authList, error: authError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) return res.status(500).json({ error: authError.message });

  const emailById = Object.fromEntries(authList.users.map((u) => [u.id, u.email]));

  let users = overview.map((u) => ({ ...u, email: emailById[u.id] || null }));

  if (q) {
    const needle = q.toLowerCase();
    users = users.filter(
      (u) => u.email?.toLowerCase().includes(needle) || u.full_name?.toLowerCase().includes(needle)
    );
  }

  await logAdminAction({ adminId: adminUserId, action: "list_users", metadata: { query: q || null, count: users.length } });

  return res.status(200).json(users);
}
