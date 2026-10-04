import { supabaseAdmin } from "../../lib/supabaseClient";
import { generateMotivationLetter } from "../../lib/anthropic";
import { getUserFromRequest } from "../../lib/authServer";

function buildPreview(text, ratio = 0.35) {
  const paragraphs = text.split(/\n{2,}/);
  const total = text.split(/\s+/).filter(Boolean).length;
  let budget = Math.max(40, Math.floor(total * ratio));
  const out = [];
  for (const p of paragraphs) {
    const words = p.split(/\s+/).filter(Boolean);
    if (words.length <= budget) {
      out.push(p);
      budget -= words.length;
    } else {
      out.push(words.slice(0, budget).join(" ") + "…");
      break;
    }
    if (budget <= 0) break;
  }
  return { preview: out.join("\n\n"), totalWords: total };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Connecte-toi pour générer une lettre." });
  const userId = user.id;

  const {
    scholarshipId, scholarshipName, country, level, wordLimit,
    language, background, goals, motivation, achievements,
    letterType, letterFormatNotes,
  } = req.body;

  if (!scholarshipName || !background || !motivation) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  const admin = supabaseAdmin();

  try {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("plan, bonus_generations")
      .eq("user_id", userId)
      .single();

    const plan = sub?.plan || "free";
    const bonus = sub?.bonus_generations || 0;
    let useBonus = false;

    if (plan === "free" && bonus <= 0) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await admin
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("type", "motivation_letter")
        .gte("created_at", startOfMonth.toISOString());

      if ((count || 0) >= 1) {
        return res.status(403).json({
          error: "Quota gratuit atteint (1 lettre/mois). Passe au plan Pro pour continuer.",
        });
      }
    } else if (plan === "free" && bonus > 0) {
      useBonus = true;
    }

    // Plafond de sécurité global : s'applique à TOUS les plans, y compris Pro.
    const HARD_MONTHLY_CAP = 30;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: totalThisMonth } = await admin
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "motivation_letter")
      .gte("created_at", startOfMonth.toISOString());

    if ((totalThisMonth || 0) >= HARD_MONTHLY_CAP) {
      return res.status(429).json({
        error: `Limite de sécurité atteinte (${HARD_MONTHLY_CAP} lettres/mois). Contacte-nous si tu as un besoin légitime au-delà.`,
      });
    }

    const { text, tokensUsed, costUsd } = await generateMotivationLetter({
      scholarshipName, country, level, wordLimit, language,
      background, goals, motivation, achievements,
      letterType: letterType || "motivation_letter",
      letterFormatNotes,
    });

    const unlocked = plan === "pro" || useBonus;

    const { data: doc, error: docError } = await admin
      .from("documents")
      .insert({
        user_id: userId,
        scholarship_id: scholarshipId || null,
        scholarship_name: scholarshipName,
        type: "motivation_letter",
        input_text: JSON.stringify({ background, goals, motivation, achievements }),
        generated_text: text,
        unlocked,
      })
      .select()
      .single();

    if (docError) throw docError;

    if (useBonus) {
      await admin.from("subscriptions").update({ bonus_generations: bonus - 1 }).eq("user_id", userId);
    }

    await admin.from("generation_logs").insert({
      document_id: doc.id,
      tokens_used: tokensUsed,
      cost_usd: costUsd,
    });

    if (unlocked) {
      return res.status(200).json({ locked: false, letter: text, documentId: doc.id });
    }

    const { preview, totalWords } = buildPreview(text);
    return res.status(200).json({ locked: true, preview, totalWords, documentId: doc.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de la génération de la lettre." });
  }
}
