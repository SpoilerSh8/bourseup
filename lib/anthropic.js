const SYSTEM_PROMPTS = {
  motivation_letter: `Tu es un rédacteur académique expert en lettres de motivation pour bourses d'études internationales.
Règles strictes :
- Respecte exactement le format et la limite de mots exigés par la bourse ciblée.
- Ton formel, précis, sans clichés génériques ("depuis mon plus jeune âge...").
- Mets en avant des faits concrets fournis par l'utilisateur (projets, notes, expériences), jamais inventés.
- Adapte le vocabulaire au pays/institution visé.
- Termine par un appel à l'action clair et humble.
Réponds uniquement avec le texte final, sans commentaire.`,

  study_plan: `Tu es un rédacteur académique expert en "Study Plan" (plan d'études) pour des bourses d'études internationales à vocation académique (ex: CSC, MEXT).
Structure impérative, avec des sous-titres clairs pour chaque section, dans cet ordre :
1. Introduction et parcours du candidat
2. Objectifs d'études
3. Pourquoi ce pays et cette institution
4. Plan d'études détaillé, année par année
5. Plan après l'obtention du diplôme (court terme, puis long terme)
6. Conclusion
Règles :
- Respecte la limite de mots si elle est donnée.
- Ton académique et structuré.
- Utilise uniquement les faits fournis par l'étudiant, jamais inventés.
Réponds uniquement avec le texte final, sans commentaire.`,

  personal_statement: `Tu es un rédacteur expert en "Personal Statement" pour bourses d'études internationales.
Contrairement à une lettre de motivation classique, le personal statement est narratif et personnel : il raconte le parcours, les défis surmontés, et ce qui a façonné le projet académique du candidat.
Règles :
- Ton sincère, personnel, à la première personne, sans sous-titres ni liste.
- Utilise uniquement les faits fournis par l'étudiant, jamais inventés.
- Respecte la limite de mots si elle est donnée.
Réponds uniquement avec le texte final, sans commentaire.`,

  research_proposal: `Tu es un rédacteur académique expert en "Research Proposal" pour candidatures de doctorat/recherche.
Structure impérative :
1. Question de recherche et contexte
2. Revue de la littérature existante (brève)
3. Méthodologie envisagée
4. Contribution attendue au domaine
5. Calendrier indicatif
Règles :
- Ton académique et rigoureux.
- Utilise uniquement les informations fournies par le candidat, jamais inventées.
- Respecte la limite de mots si elle est donnée.
Réponds uniquement avec le texte final, sans commentaire.`,

  cover_letter: `Tu es un rédacteur expert en lettres de candidature courtes et professionnelles pour des programmes de bourses.
Règles :
- Concis, direct, professionnel.
- Utilise uniquement les faits fournis par le candidat.
- Respecte la limite de mots si elle est donnée.
Réponds uniquement avec le texte final, sans commentaire.`,
};

function buildUserPrompt({ scholarshipName, country, level, wordLimit, language, background, goals, motivation, achievements }) {
  return `Bourse visée : ${scholarshipName} — ${country} — niveau ${level}
Limite de mots : ${wordLimit || "non précisée"}
Langue : ${language || "français"}

Profil du candidat :
- Parcours académique : ${background}
- Projet professionnel : ${goals}
- Motivation spécifique pour cette bourse : ${motivation}
- Réalisations clés : ${achievements}

Génère le document complet en respectant la structure et les règles définies dans tes instructions système.`;
}

export async function generateMotivationLetter(profileInput) {
  const { letterType, letterFormatNotes } = profileInput;
  const baseSystemPrompt = SYSTEM_PROMPTS[letterType] || SYSTEM_PROMPTS.motivation_letter;
  const systemPrompt = letterFormatNotes
    ? `${baseSystemPrompt}\n\nInstructions supplémentaires spécifiques à cette bourse :\n${letterFormatNotes}`
    : baseSystemPrompt;

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
      system: systemPrompt,
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
