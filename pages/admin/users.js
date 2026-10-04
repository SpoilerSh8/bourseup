import { useEffect, useState, Fragment } from "react";
import { useUser } from "../../lib/useUser";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function AdminUsers() {
  const { user, loading: userLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [revealedDoc, setRevealedDoc] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(!!data?.is_admin));
  }, [user]);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  async function loadUsers(q = "") {
    const res = await fetch(`/api/admin/users?adminUserId=${user.id}&q=${encodeURIComponent(q)}`);
    setUsers(await res.json());
  }

  async function openActivity(targetUserId) {
    if (expandedUser === targetUserId) {
      setExpandedUser(null);
      setDocs([]);
      return;
    }
    setExpandedUser(targetUserId);
    setRevealedDoc(null);
    const res = await fetch(`/api/admin/user-activity?adminUserId=${user.id}&targetUserId=${targetUserId}`);
    setDocs(await res.json());
  }

  async function revealDocument(targetUserId, documentId) {
    const reason = prompt(
      "Justification obligatoire (ex: \"L'utilisateur signale une lettre vide, je vérifie sur son ticket support #123\") :"
    );
    if (!reason || reason.trim().length < 3) {
      alert("Une justification d'au moins quelques mots est requise — action annulée.");
      return;
    }
    const res = await fetch(
      `/api/admin/user-activity?adminUserId=${user.id}&targetUserId=${targetUserId}&revealDocumentId=${documentId}&reason=${encodeURIComponent(reason)}`
    );
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    setRevealedDoc(data);
  }
  async function resetPassword(targetUserId, targetEmail) {
    const reason = prompt(`Justification pour réinitialiser le mot de passe de ${targetEmail} :`);
    if (!reason || reason.trim().length < 3) {
      alert("Action annulée : une justification est requise.");
      return;
    }
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUserId: user.id, targetUserId, targetEmail, reason }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert(`Email de réinitialisation envoyé à ${targetEmail}.`);
  }


  async function runAction(targetUserId, action, value) {
    const reason = prompt("Justification obligatoire pour cette action :");
    if (!reason || reason.trim().length < 3) {
      alert("Action annulée : une justification est requise.");
      return;
    }
    setError("");
    const res = await fetch("/api/admin/user-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUserId: user.id, targetUserId, action, value, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      loadUsers(query);
    }
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
      <h1>Admin — Utilisateurs</h1>
        <p>
        <Link href="/admin">→ Gérer les bourses</Link> ·{" "}
        <Link href="/admin/stats">Statistiques</Link>
      </p>

      <p className="meta">
        Par défaut, tu vois uniquement des métadonnées (plan, nombre de lettres, dernière activité).
        Le contenu d'une lettre n'est visible qu'après justification écrite — chaque consultation est enregistrée.
      </p>

      <div className="form" style={{ maxWidth: 400, marginBottom: "1.5rem" }}>
        <input
          placeholder="Rechercher par email ou nom..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadUsers(query)}
        />
        <button onClick={() => loadUsers(query)}>Rechercher</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>

        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #D6E4E5" }}>
            <th style={{ padding: "0.5rem" }}>Utilisateur</th>
            <th>Plan</th>
            <th>Lettres</th>
            <th>Inscrit le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <Fragment key={u.id}>
              <tr style={{ borderBottom: "1px solid #D6E4E5" }}>
                <td style={{ padding: "0.5rem" }}>
                  <strong>{u.full_name || "(sans nom)"}</strong>
                  <br />
                  <span className="meta">{u.email}</span>
                  {u.is_admin && <span className="badge" style={{ marginLeft: "0.5rem" }}>admin</span>}
                </td>
                <td>{u.plan}{u.bonus_generations > 0 && ` (+${u.bonus_generations} bonus)`}</td>
                <td>{u.documents_count}</td>
                <td>{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    <button onClick={() => openActivity(u.id)}>
                      {expandedUser === u.id ? "Fermer" : "Voir activité"}
                    </button>
                    <button onClick={() => runAction(u.id, "set_plan", u.plan === "pro" ? "free" : "pro")}>
                      {u.plan === "pro" ? "Repasser Free" : "Passer Pro"}
                    </button>
                      <button onClick={() => runAction(u.id, "grant_bonus", 1)}>+1 lettre bonus</button>
                      <button onClick={() => resetPassword(u.id, u.email)}>Réinitialiser mot de passe</button>

                  </div>
                </td>
              </tr>
              {expandedUser === u.id && (
                <tr>
                  <td colSpan={5} style={{ background: "#F7FAFA", padding: "1rem" }}>
                    <strong>Documents (métadonnées uniquement) :</strong>
                    <ul>
                      {docs.map((d) => (
                        <li key={d.id}>
                          {d.type} — {new Date(d.created_at).toLocaleString("fr-FR")}{" "}
                          <button onClick={() => revealDocument(u.id, d.id)}>Voir le contenu (justifier)</button>
                        </li>
                      ))}
                      {docs.length === 0 && <li>Aucun document.</li>}
                    </ul>
                    {revealedDoc && (
                      <div className="result">
                        <p className="meta">Document {revealedDoc.id} — consultation enregistrée dans l'audit log</p>
                        <pre>{revealedDoc.generated_text}</pre>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
                </tbody>
      </table>
      </div>
    </div>
  );
}

