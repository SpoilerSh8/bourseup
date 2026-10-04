import { supabaseAdmin } from "../../lib/supabaseClient";
import { improveLetter } from "../../lib/anthropic";
import { getUserFromRequest } from "../../lib/authServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Connecte-toi pour utiliser cette fonctionnalité." });

  const { draftText, scholarshipName, focus } = req.body;
  if (!draftText || draftText.trim().length < 50) {
    return res.status(400).json({ error: "Colle une lettre d'au moins quelques phrases." });
  }

  const admin = supabaseAdmin();

  const { data: sub } = await admin.from("subscriptions").select("plan").eq("user_id", user.id).single();
  if (sub?.plan !== "pro") {
    return res.status(403).json({ error: "Cette fonctionnalité est réservée aux membres Pro." });
  }

  // Même plafond de sécurité que pour la génération, appliqué séparément ici.
  const HARD_MONTHLY_CAP = 30;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await admin
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("type", "letter_correction")
    .gte("created_at", startOfMonth.toISOString());

  if ((count || 0) >= HARD_MONTHLY_CAP) {
    return res.status(429).json({ error: `Limite de sécurité atteinte (${HARD_MONTHLY_CAP} corrections/mois).` });
  }

  try {
    const { text, tokensUsed, costUsd } = await improveLetter({ draftText, scholarshipName, focus });

    const { data: doc, error: docError } = await admin
      .from("documents")
      .insert({
        user_id: user.id,
        type: "letter_correction",
        input_text: draftText,
        generated_text: text,
        unlocked: true,
      })
      .select()
      .single();
    if (docError) throw docError;

    await admin.from("generation_logs").insert({ document_id: doc.id, tokens_used: tokensUsed, cost_usd: costUsd });

    return res.status(200).json({ letter: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de la correction." });
  }
}
