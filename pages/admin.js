import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "../lib/useUser";
import { supabase } from "../lib/supabaseClient";

const empty = {
  name: "", provider: "", country: "", level: "master",
  deadline: "", eligibility_criteria: "", official_link: "", word_limit: "",
  required_documents: "", application_steps: "", authority_info: "", tips: "",
  description: "", benefits: "",
  letter_type: "motivation_letter", letter_format_notes: "",
};




export default function Admin() {
  const { user, loading: userLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(!!data?.is_admin));
  }, [user]);

  useEffect(() => {
    if (isAdmin) loadScholarships();
  }, [isAdmin]);

  async function loadScholarships() {
    const res = await fetch("/api/scholarships");
    setScholarships(await res.json());
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

    function startEdit(s) {
    setEditingId(s.id);
    setForm({
      name: s.name || "", provider: s.provider || "", country: s.country || "",
      level: s.level || "master", deadline: s.deadline || "",
      eligibility_criteria: s.eligibility_criteria || "", official_link: s.official_link || "",
      word_limit: s.word_limit || "",
      required_documents: Array.isArray(s.required_documents) ? s.required_documents.join(", ") : "",
      application_steps: s.application_steps || "",
      authority_info: s.authority_info || "",
      tips: s.tips || "",
      description: s.description || "",
      benefits: s.benefits || "",
      letter_type: s.letter_type || "motivation_letter",
      letter_format_notes: s.letter_format_notes || "",
    });


  }


  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const method = editingId ? "PUT" : "POST";
    const documentsArray = form.required_documents
      .split(",").map((d) => d.trim()).filter(Boolean);
    const body = {
      adminUserId: user.id,
      ...form,
      required_documents: documentsArray,
      ...(editingId ? { id: editingId } : {}),
    };


    const res = await fetch("/api/scholarships", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
    } else {
      cancelEdit();
      loadScholarships();
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cette bourse ?")) return;
    await fetch("/api/scholarships", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUserId: user.id, id }),
    });
    loadScholarships();
  }

  if (userLoading || isAdmin === null) return <p className="loading">Chargement...</p>;

  if (!user || !isAdmin) {
    return (
      <div className="container">
        <h1>Accès refusé</h1>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Admin — Gestion des bourses</h1>
      <p>
        <Link href="/admin/users">→ Gérer les utilisateurs</Link> ·{" "}
        <Link href="/admin/stats">Statistiques</Link>
      </p>

      <form onSubmit={handleSubmit} className="form">
        <h3>{editingId ? "Modifier la bourse" : "Ajouter une bourse"}</h3>
        <input placeholder="Nom de la bourse" value={form.name} onChange={(e) => update("name", e.target.value)} required />
        <input placeholder="Organisme (ex: China Scholarship Council)" value={form.provider} onChange={(e) => update("provider", e.target.value)} />
        <input placeholder="Pays" value={form.country} onChange={(e) => update("country", e.target.value)} />
        <select value={form.level} onChange={(e) => update("level", e.target.value)}>
          <option value="bachelor">Licence</option>
          <option value="master">Master</option>
          <option value="phd">Doctorat</option>
        </select>
        <input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
        <textarea placeholder="Description de la bourse (paragraphe libre)" rows={3}
          value={form.description} onChange={(e) => update("description", e.target.value)} />
        <textarea placeholder="Avantages couverts — un avantage par ligne (ex: frais de scolarité, logement, assurance santé)" rows={4}
          value={form.benefits} onChange={(e) => update("benefits", e.target.value)} />
        <textarea placeholder="Critères d'éligibilité — un critère par ligne" rows={4}
          value={form.eligibility_criteria} onChange={(e) => update("eligibility_criteria", e.target.value)} />

        <input placeholder="Lien officiel" value={form.official_link} onChange={(e) => update("official_link", e.target.value)} />
        <input placeholder="Limite de mots (lettre)" value={form.word_limit} onChange={(e) => update("word_limit", e.target.value)} />
        <input placeholder="Documents requis, séparés par des virgules (ex: passeport, relevés de notes, lettres de recommandation)"
          value={form.required_documents} onChange={(e) => update("required_documents", e.target.value)} />
        <textarea placeholder="Étapes à suivre — une étape par ligne" rows={4}
          value={form.application_steps} onChange={(e) => update("application_steps", e.target.value)} />
        <textarea placeholder="Où déposer le dossier / administration compétente"
          value={form.authority_info} onChange={(e) => update("authority_info", e.target.value)} />
        <textarea placeholder="Conseils et bonnes pratiques"
          value={form.tips} onChange={(e) => update("tips", e.target.value)} />

        <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Type de document demandé</label>
        <select value={form.letter_type} onChange={(e) => update("letter_type", e.target.value)}>
          <option value="motivation_letter">Lettre de motivation (classique)</option>
          <option value="study_plan">Study Plan (plan d'études structuré, ex: CSC)</option>
          <option value="personal_statement">Personal Statement (récit personnel)</option>
          <option value="research_proposal">Research Proposal (projet de recherche, doctorat)</option>
          <option value="cover_letter">Lettre de candidature courte</option>
        </select>
        <textarea placeholder="Instructions spécifiques supplémentaires pour l'IA (optionnel) — ex: exigences de format propres à cette bourse"
          value={form.letter_format_notes} onChange={(e) => update("letter_format_notes", e.target.value)} />

        <div style={{ display: "flex", gap: "0.6rem" }}>

          <button type="submit">{editingId ? "Enregistrer" : "Ajouter"}</button>
          {editingId && <button type="button" onClick={cancelEdit}>Annuler</button>}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <h2 style={{ marginTop: "2rem" }}>Bourses existantes ({scholarships.length})</h2>
      <div className="grid">
        {scholarships.map((s) => (
          <div key={s.id} className="card">
            <h3>{s.name}</h3>
            <p className="meta">{s.country} · {s.level} · {s.deadline}</p>
            <div className="card-actions">
              <button onClick={() => startEdit(s)}>Modifier</button>
              <button onClick={() => handleDelete(s.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
