import { supabaseAdmin } from "../../lib/supabaseClient";
import { getUserFromRequest } from "../../lib/authServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Non connecté." });

  const { documentId } = req.body;
  if (!documentId) return res.status(400).json({ error: "documentId requis." });

  const admin = supabaseAdmin();

  const { data: doc } = await admin
    .from("documents")
    .select("id, generated_text, unlocked")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();
  if (!doc) return res.status(404).json({ error: "Lettre introuvable." });

  const { data: sub } = await admin.from("subscriptions").select("plan").eq("user_id", user.id).single();

  if (sub?.plan !== "pro" && !doc.unlocked) {
    return res.status(403).json({
      error: "Cette lettre est réservée aux membres Pro. Si tu viens de payer, patiente quelques secondes puis réessaie.",
    });
  }

  return res.status(200).json({ letter: doc.generated_text });
}
