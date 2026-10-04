import { createInvoice } from "../../../lib/paydunya";

const PRO_PRICE_XOF = 2500; // ajuste selon le prix réel que tu veux facturer

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId requis." });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const result = await createInvoice({
    amount: PRO_PRICE_XOF,
    description: "BourseUp Pro — 1 mois",
    userId,
    siteUrl,
  });

  if (result.response_code !== "00") {
    return res.status(500).json({ error: result.response_text || "Erreur PayDunya." });
  }

  // Pour PayDunya, response_text contient directement l'URL de paiement
  return res.status(200).json({ checkoutUrl: result.response_text });
}
