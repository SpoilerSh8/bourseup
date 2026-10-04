import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import ScholarshipCard from "../components/ScholarshipCard";

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

  return (
    <div className="container">
      <h1>{t("list.title")}</h1>
      <div className="scholar-list">
        {scholarships.map((s) => (
          <ScholarshipCard
            key={s.id}
            scholarship={s}
            onTrack={trackScholarship}
            isTracked={trackedIds.has(s.id)}
          />
        ))}
      </div>
    </div>
  );
}
