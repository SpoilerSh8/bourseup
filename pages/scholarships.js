import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import ScholarshipCard from "../components/ScholarshipCard";
import styles from "../components/ScholarshipCard.module.css";
// ...
const [q, setQ] = useState("");
const [level, setLevel] = useState("");


export default function Scholarships() {
  const { user } = useUser();
  const { t } = useI18n();
  const [scholarships, setScholarships] = useState([]);
  const [trackedIds, setTrackedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scholarships")
      .then((r) => r.json())
      .then((data) => {
        setScholarships(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_scholarships").select("scholarship_id").eq("user_id", user.id)
      .then(({ data }) => setTrackedIds(new Set((data || []).map((r) => r.scholarship_id))));
  }, [user]);

  async function trackScholarship(scholarshipId) {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    await supabase.from("user_scholarships").upsert({
      user_id: user.id,
      scholarship_id: scholarshipId,
      status: "interested",
    });
    setTrackedIds((prev) => new Set(prev).add(scholarshipId));
  }

  if (loading) return <p className="loading">{t("list.loading")}</p>;

const norm = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const shown = scholarships.filter((s) =>
  (!level || s.level === level || s.level === "all") &&
  norm(`${s.name} ${s.country} ${s.provider}`).includes(norm(q))
);

  return (
    <div className="container">
      <h1>{t("list.title")}</h1>
      <div className={styles.filters}>
        <input placeholder="Rechercher une bourse ou un pays…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">—</option>
          {["bachelor", "master", "phd"].map((l) => <option key={l} value={l}>{t(`level.${l}`)}</option>)}
        </select>
      </div>
    <div className={styles.grid}>
  {shown.map((s, i) => (
    <ScholarshipCard key={s.id} index={i} scholarship={s} onTrack={trackScholarship} isTracked={trackedIds.has(s.id)} />
  ))}
</div>

    </div>
  );
}
