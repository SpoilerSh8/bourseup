import fs from "fs";
import formidable from "formidable";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { supabaseAdmin } from "../../lib/supabaseClient";
import { improveLetter } from "../../lib/anthropic";
import { getUserFromRequest } from "../../lib/authServer";

// Nécessaire pour accepter un upload de fichier (multipart/form-data) :
// le bodyParser JSON par défaut de Next.js ne sait pas le lire.
export const config = {
  api: { bodyParser: false },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 8 * 1024 * 1024 }); // 8 Mo max
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function extractTextFromFile(file) {
  const buffer = fs.readFileSync(file.filepath);
  const name = (file.originalFilename || "").toLowerCase();

  if (name.endsWith(".pdf") || file.mimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (name.endsWith(".docx") || file.mimetype?.includes("wordprocessingml")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error("Format non supporté. Utilise un fichier PDF ou .docx.");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Connecte-toi pour utiliser cette fonctionnalité." });

  const admin = supabaseAdmin();
  const { data: sub } = await admin.from("subscriptions").select("plan").eq("user_id", user.id).single();
  if (sub?.plan !== "pro") {
    return res.status(403).json({ error: "Cette fonctionnalité est réservée aux membres Pro." });
  }

  let fields, files;
  try {
    ({ fields, files } = await parseForm(req));
  } catch (err) {
    return res.status(400).json({ error: "Fichier trop volumineux ou requête invalide (8 Mo max)." });
  }

  const one = (f) => (Array.isArray(f) ? f[0] : f);
  let draftText = one(fields.draftText) || "";
  const scholarshipName = one(fields.scholarshipName) || "";
  const focus = one(fields.focus) || "";
  const letterType = one(fields.letterType) || "motivation_letter";
  const uploadedFile = one(files.file);


  if (uploadedFile) {
    try {
      draftText = await extractTextFromFile(uploadedFile);
    } catch (err) {
      return res.status(400).json({ error: err.message || "Impossible de lire ce fichier." });
    } finally {
      fs.unlink(uploadedFile.filepath, () => {});
    }
  }

  if (!draftText || draftText.trim().length < 50) {
    return res.status(400).json({ error: "Texte trop court. Vérifie ton fichier ou colle le texte directement." });
  }

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
    const { text, tokensUsed, costUsd } = await improveLetter({
      draftText, scholarshipName, focus,
      letterType: letterType,
    });


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
