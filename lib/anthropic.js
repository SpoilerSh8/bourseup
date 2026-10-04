const SYSTEM_PROMPT = `Tu es un rédacteur académique expert en lettres de motivation pour bourses d'études internationales.
Règles strictes :
- Respecte exactement le format et la limite de mots exigés par la bourse ciblée.
- Ton formel, précis, sans clichés génériques ("depuis mon plus jeune âge...").
- Mets en avant des faits concrets fournis par l'utilisateur (projets, notes, expériences), jamais inventés.
- Adapte le vocabulaire au pays/institution visé (ex: CSC = insister sur la coopération académique Chine-Afrique).
- Termine par un appel à l'action clair et humble.
Réponds uniquement avec le texte final de la lettre, sans commentaire.`;

function buildUserPrompt({ scholarshipName, country, level, wordLimit, language, background, goals, motivation, achievements }) {
  return `Bourse visée : ${scholarshipName} — ${country} — niveau ${level}
Limite de mots : ${wordLimit || "non précisée"}
Langue : ${language || "français"}

Profil du candidat :
- Parcours académique : ${background}
- Projet professionnel : ${goals}
- Motivation spécifique pour cette bourse : ${motivation}
- Réalisations clés : ${achievements}

Génère la lettre de motivation complète en respectant le format ci-dessus.`;
}

// Appel direct à l'API Anthropic (server-side uniquement — la clé ne doit jamais
// être exposée côté navigateur).
export async function generateMotivationLetter(profileInput) {
  const userPrompt = buildUserPrompt(profileInput);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.content.map((b) => b.text || "").join("\n");
  const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

  // Tarif indicatif Sonnet (à ajuster selon le pricing en vigueur) : ~3$/M tokens input, ~15$/M output
  const costUsd =
    ((data.usage?.input_tokens || 0) * 3 + (data.usage?.output_tokens || 0) * 15) / 1_000_000;

  return { text, tokensUsed, costUsd };
}
const CORRECTION_SYSTEM_PROMPT = `Tu es un éditeur expert en lettres de motivation pour bourses d'études internationales.
On te donne une lettre déjà écrite par l'étudiant. Ton rôle :
- Corriger la grammaire, l'orthographe et la syntaxe.
- Améliorer la clarté, la fluidité et l'impact persuasif, sans dénaturer la voix de l'auteur.
- Supprimer les répétitions et les formulations génériques.
- Ne jamais inventer de faits, d'expériences ou de chiffres qui n'étaient pas dans le texte original.
- Si une zone d'intérêt est précisée, concentre une partie de tes améliorations dessus.
Réponds uniquement avec le texte corrigé final, sans commentaire ni explication.`;

export async function improveLetter({ draftText, scholarshipName, focus }) {
  const userPrompt = `${scholarshipName ? `Bourse visée : ${scholarshipName}\n` : ""}${focus ? `Zone d'attention particulière : ${focus}\n` : ""}
Lettre à corriger et améliorer :
"""
${draftText}
"""`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: CORRECTION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.content.map((b) => b.text || "").join("\n");
  const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
  const costUsd = ((data.usage?.input_tokens || 0) * 3 + (data.usage?.output_tokens || 0) * 15) / 1_000_000;

  return { text, tokensUsed, costUsd };
}
