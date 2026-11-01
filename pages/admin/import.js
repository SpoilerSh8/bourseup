import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../../lib/useUser";
import { supabase } from "../../lib/supabaseClient";
import { adminFetch } from "../../lib/adminFetch";

export default function AdminImport() {
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState(null);
  const [items, setItems] = useState([]);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(!!data?.is_admin));
  }, [user]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      setItems(Array.isArray(data) ? data : [data]);
      setLog([]);
    } catch {
      setLog(["❌ JSON invalide"]);
    }
  }

  // Retire les champs internes (_a_verifier, _source...) et normalise
  function clean(s) {
    const out = {};
    for (const [k, v] of Object.entries(s)) if (!k.startsWith("_")) out[k] = v;
    out.deadline = out.deadline || null;
    out.word_limit = out.word_limit || null;
    return out;
  }

  async function runImport() {
    setBusy(true);
    const lines = [];
    for (const s of items) {
      const res = await adminFetch("/api/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clean(s)),
      });
      const d = await res.json().catch(() => ({}));
      lines.push(res.ok ? `✅ ${s.name}` : `❌ ${s.name} — ${d.error || res.status}`);
      setLog([...lines]);
    }
    setBusy(false);
  }

  if (loading || isAdmin === null) return <p className="loading">Chargement...</p>;
  if (!user || !isAdmin) return <div className="container"><h1>Accès refusé</h1></div>;

  return (
    <div className="container">
      <h1>Admin — Import de bourses</h1>
      <p><Link href="/admin">← Retour aux bourses</Link></p>
      <input type="file" accept=".json,application/json" onChange={onFile} />
      {items.length > 0 && (
        <>
          <p className="meta">{items.length} bourse(s) prête(s) :</p>
          <ul>{items.map((s, i) => <li key={i}>{s.name}</li>)}</ul>
          <button onClick={runImport} disabled={busy}>
            {busy ? "Import en cours..." : "Importer"}
          </button>
        </>
      )}
      <ul>{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}
