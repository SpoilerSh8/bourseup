import { supabase, supabaseAdmin } from "../../lib/supabaseClient";
import { requireAdminFromRequest } from "../../lib/adminGuard";

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

  if (!["POST", "PUT", "DELETE"].includes(req.method)) {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // L'identité admin vient maintenant du vrai jeton de session, jamais d'un
  // adminUserId envoyé par le navigateur.
  const auth = await requireAdminFromRequest(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });
  const admin = supabaseAdmin();

  if (req.method === "POST") {
    const { adminUserId, ...scholarship } = req.body;
    const { data, error } = await admin.from("scholarships").insert(scholarship).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (req.method === "PUT") {
    const { adminUserId, id, ...updates } = req.body;
    const { data, error } = await admin.from("scholarships").update(updates).eq("id", id).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  const { id } = req.body;
  const { error } = await admin.from("scholarships").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
