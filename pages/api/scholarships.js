import { supabase, supabaseAdmin } from "../../lib/supabaseClient";

async function requireAdmin(userId) {
  if (!userId) return false;
  const admin = supabaseAdmin();
  const { data } = await admin.from("profiles").select("is_admin").eq("id", userId).single();
  return !!data?.is_admin;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { country, level } = req.query;
    let query = supabase.from("scholarships").select("*").order("deadline", { ascending: true });
    if (country) query = query.eq("country", country);
    if (level) query = query.eq("level", level);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { adminUserId, ...scholarship } = req.body;
    if (!(await requireAdmin(adminUserId))) return res.status(403).json({ error: "Accès réservé aux admins." });

    const admin = supabaseAdmin();
    const { data, error } = await admin.from("scholarships").insert(scholarship).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (req.method === "PUT") {
    const { adminUserId, id, ...updates } = req.body;
    if (!(await requireAdmin(adminUserId))) return res.status(403).json({ error: "Accès réservé aux admins." });

    const admin = supabaseAdmin();
    const { data, error } = await admin.from("scholarships").update(updates).eq("id", id).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (req.method === "DELETE") {
    const { adminUserId, id } = req.body;
    if (!(await requireAdmin(adminUserId))) return res.status(403).json({ error: "Accès réservé aux admins." });

    const admin = supabaseAdmin();
    const { error } = await admin.from("scholarships").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Méthode non autorisée" });
}
