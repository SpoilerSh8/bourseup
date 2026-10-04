import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../../lib/useUser";
import { supabase } from "../../lib/supabaseClient";

const SORTS = {
  followers_count: "Nombre de suivis",
  letters_count: "Lettres générées",
  accept_rate: "Taux d'acceptation",
  ai_cost_usd: "Coût IA",
};

function StatusBar({ s }) {
  if (!s.followers_count) return <span className="meta">—</span>;
  const pct = (n) => `${(n / s.followers_count) * 100}%`;
  return (
    <div
      className="status-bar"
      title={`${s.interested_count} intéressés · ${s.submitted_count} soumis · ${s.accepted_count} acceptés · ${s.rejected_count} refusés`}
    >
      <span className="s-interested" style={{ width: pct(s.interested_count) }} />
      <span className="s-submitted" style={{ width: pct(s.submitted_count) }} />
      <span className="s-accepted" style={{ width: pct(s.accepted_count) }} />
      <span className="s-rejected" style={{ width: pct(s.rejected_count) }} />
    </div>
  );
}

export default function AdminStats() {
  const { user, loading: userLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("followers_count");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(!!data?.is_admin));
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/scholarship-stats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) return setError(json.error || "Erreur de chargement.");
      setData(json);
    })();
  }, [isAdmin]);

  if (userLoading || isAdmin === null) return <p className="loading">Chargement...</p>;
  if (!user || !isAdmin) {
    return (
      <div className="container">
        <h1>Accès refusé</h1>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }
  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!data) return <p className="loading">Chargement des statistiques...</p>;

  const rows = data.stats
    .map((s) => {
      const n = (k) => Number(s[k]) || 0;
      const accepted = n("accepted_count");
      const rejected = n("rejected_count");
      return {
        ...s,
        followers_count: n("followers_count"),
        interested_count: n("interested_count"),
        submitted_count: n("submitted_count"),
        accepted_count: accepted,
        rejected_count: rejected,
        letters_count: n("letters_count"),
        letters_unlocked_count: n("letters_unlocked_count"),
        ai_cost_usd: n("ai_cost_usd"),
        accept_rate: accepted + rejected > 0 ? accepted / (accepted + rejected) : -1,
      };
    })
    .sort((a, b) => b[sort] - a[sort]);

  const total = (k) => rows.reduce((sum, r) => sum + r[k], 0);
  const lettersTotal = total("letters_count");
  const unlockedTotal = total("letters_unlocked_count");
  const fullRate = lettersTotal ? Math.round((unlockedTotal / lettersTotal) * 100) : null;

  return (
    <div className="container" style={{ maxWidth: 1000 }}>
      <h1>Admin — Statistiques par bourse</h1>
      <p>
        <Link href="/admin">→ Gérer les bourses</Link> ·{" "}
        <Link href="/admin/users">Gérer les utilisateurs</Link>
      </p>

      <div className="stat-cards">
        <div className="stat-card"><div className="stat-value">{total("followers_count")}</div><div className="stat-label">Suivis au total</div></div>
        <div className="stat-card"><div className="stat-value">{lettersTotal}</div><div className="stat-label">Lettres (bourses du catalogue)</div></div>
        <div className="stat-card"><div className="stat-value">{fullRate === null ? "—" : `${fullRate} %`}</div><div className="stat-label">Lettres complètes (Pro ou offertes)</div></div>
        <div className="stat-card"><div className="stat-value">${total("ai_cost_usd").toFixed(2)}</div><div className="stat-label">Coût IA cumulé</div></div>
      </div>

      <div className="status-legend">
        <span><i style={{ background: "#B7C0C2" }} />Intéressé</span>
        <span><i style={{ background: "#1B3A4B" }} />Soumis</span>
        <span><i style={{ background: "#7C9885" }} />Accepté</span>
        <span><i style={{ background: "#C0392B" }} />Refusé</span>
      </div>

      <div className="stats-toolbar">
        <label htmlFor="sort">Trier par</label>
        <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <p>Aucune bourse dans le catalogue pour l'instant.</p>
      ) : (
        <div className="stats-table-wrap">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Bourse</th>
                <th className="num">Suivis</th>
                <th>Avancement</th>
                <th className="num">Lettres</th>
                <th className="num">Complètes</th>
                <th className="num">Acceptation</th>
                <th className="num">Coût IA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="stats-name">
                    <strong>{s.name}</strong>
                    <span>{[s.country, s.level].filter(Boolean).join(" · ")}</span>
                  </td>
                  <td className="num">{s.followers_count}</td>
                  <td><StatusBar s={s} /></td>
                  <td className="num">{s.letters_count}</td>
                  <td className="num">{s.letters_unlocked_count}</td>
                  <td className="num">{s.accept_rate < 0 ? "—" : `${Math.round(s.accept_rate * 100)} %`}</td>
                  <td className="num">${s.ai_cost_usd.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ marginTop: "2.2rem" }}>Demandes hors catalogue</h2>
      <p className="meta">
        Bourses saisies à la main dans le générateur de lettres. Les plus demandées sont
        celles à ajouter en priorité au catalogue.
      </p>
      {data.uncatalogued.length === 0 ? (
        <p>Rien pour l'instant.</p>
      ) : (
        <ul className="uncat-list">
          {data.uncatalogued.map((u) => (
            <li key={u.name}><span>{u.name}</span><strong>{u.count} lettre(s)</strong></li>
          ))}
        </ul>
      )}
    </div>
  );
}
