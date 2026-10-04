import { useEffect, useState } from "react";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "../lib/contact";

function daysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

function urgency(days) {
  if (days === null) return "plenty";
  if (days < 0) return "closed";
  if (days <= 14) return "urgent";
  if (days <= 30) return "soon";
  return "plenty";
}

function stepIndex(status) {
  if (status === "interested") return 0;
  if (status === "submitted") return 1;
  return 2;
}

export default function Dashboard() {
  const { user, loading: userLoading } = useUser();
  const { t } = useI18n();
  const [tracked, setTracked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadTracked();
  }, [user]);

  async function loadTracked() {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_scholarships")
      .select("id, status, checked_documents, scholarships(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setTracked(data);
    setLoading(false);
  }

  async function toggleDocument(row, doc) {
    const current = new Set(row.checked_documents || []);
    if (current.has(doc)) current.delete(doc);
    else current.add(doc);
    const checkedArray = Array.from(current);

    const required = row.scholarships?.required_documents || [];
    const allChecked = required.length > 0 && required.every((d) => checkedArray.includes(d));

    let newStatus = row.status;
    if (row.status === "interested" || row.status === "submitted") {
      newStatus = allChecked ? "submitted" : "interested";
    }

    await supabase
      .from("user_scholarships")
      .update({ checked_documents: checkedArray, status: newStatus })
      .eq("id", row.id);
    loadTracked();
  }

  async function markSubmittedManually(rowId) {
    await supabase.from("user_scholarships").update({ status: "submitted" }).eq("id", rowId);
    loadTracked();
  }

  async function decide(rowId, status) {
    await supabase.from("user_scholarships").update({ status }).eq("id", rowId);
    loadTracked();
  }

  async function untrack(rowId) {
    if (!confirm(t("dash.confirmRemove"))) return;
    await supabase.from("user_scholarships").delete().eq("id", rowId);
    loadTracked();
  }

  if (userLoading) return <p className="loading">{t("common.loading")}</p>;
  if (!user) {
    return (
      <div className="container">
        <h1>{t("dash.title")}</h1>
        <p>{t("dash.loginPrompt")}</p>
        <a href="/login"><button>{t("auth.loginTitle")}</button></a>
      </div>
    );
  }
  if (loading) return <p className="loading">{t("common.loading")}</p>;

  const urgent = tracked.filter((row) => {
    const d = daysLeft(row.scholarships?.deadline);
    return d !== null && d >= 0 && d < 14 && !["accepted", "rejected"].includes(row.status);
  });

  return (
    <div className="container">
      <h1>{t("dash.title")}</h1>

      {urgent.length > 0 && (
        <div className="alert-banner">{t("dash.urgentBanner", { n: urgent.length })}</div>
      )}

      {tracked.length === 0 && (
        <p>{t("dash.empty")} <a href="/scholarships">{t("dash.emptyLink")}</a></p>
      )}

      <div className="tracker-list">
        {tracked.map((row) => {
          const s = row.scholarships;
          const d = daysLeft(s?.deadline);
          const required = s?.required_documents || [];
          const checked = row.checked_documents || [];
          const idx = stepIndex(row.status);
          const isFinal = row.status === "accepted" || row.status === "rejected";
          const meta = [s?.provider, s?.country, s?.level && t(`level.${s.level}`)].filter(Boolean).join(" · ");

          return (
            <div key={row.id} className="tracker-item">
              <div className="tracker-header">
                <div>
                  <h3>{s?.name}</h3>
                  <p className="tracker-meta">{meta}</p>
                </div>
                {d !== null && !isFinal && (
                  <span className={`status-tag ${urgency(d)}`}>
                    {d >= 0 ? t("dash.daysLeft", { n: d }) : t("dash.closed")}
                  </span>
                )}
                {isFinal && (
                  <span className={`final-badge ${row.status}`}>
                    {row.status === "accepted" ? t("dash.accepted") : t("dash.rejected")}
                  </span>
                )}
              </div>

              <div className="stepper">
                <div className={`stepper-step ${idx === 0 ? "active" : idx > 0 ? "done" : ""}`}>
                  <span className="stepper-dot" />{t("dash.step.interested")}
                </div>
                <div className="stepper-line" />
                <div className={`stepper-step ${idx === 1 ? "active" : idx > 1 ? "done" : ""}`}>
                  <span className="stepper-dot" />{t("dash.step.submitted")}
                </div>
                <div className="stepper-line" />
                <div className={`stepper-step ${idx === 2 ? "active" : ""}`}>
                  <span className="stepper-dot" />{t("dash.step.decision")}
                </div>
              </div>

              {!isFinal && required.length > 0 && (
                <>
                  <p className="checklist-progress">
                    {t("dash.docsProgress", { done: checked.length, total: required.length })}
                  </p>
                  <ul className="checklist">
                    {required.map((doc) => (
                      <li key={doc} className={checked.includes(doc) ? "checked" : ""}>
                        <input
                          type="checkbox"
                          checked={checked.includes(doc)}
                          onChange={() => toggleDocument(row, doc)}
                        />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {!isFinal && required.length === 0 && row.status === "interested" && (
                <button onClick={() => markSubmittedManually(row.id)}>{t("dash.markSubmitted")}</button>
              )}

              {row.status === "interested" && (
                <div className="accompaniment-box">
                  <span className="accompaniment-price">{t("dash.coach.price")}</span>
                  <p className="accompaniment-text">{t("dash.coach.text")}</p>
                  <div className="accompaniment-actions">
                    <a
                      href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("dash.coach.subject", { name: s?.name }))}&body=${encodeURIComponent(t("dash.coach.body", { name: s?.name }))}`}
                    >
                      <button className="secondary">{t("dash.coach.email")}</button>
                    </a>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("dash.coach.wa", { name: s?.name }))}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <button>💬 WhatsApp</button>
                    </a>
                  </div>
                </div>
              )}

              {row.status === "submitted" && (
                <div className="decision-actions">
                  <button className="accept" onClick={() => decide(row.id, "accepted")}>{t("dash.markAccepted")}</button>
                  <button className="reject" onClick={() => decide(row.id, "rejected")}>{t("dash.markRejected")}</button>
                </div>
              )}

              <div className="tracker-footer">
                <a href={`/scholarships/${s?.id}`}>{t("dash.viewDetail")}</a>
                <button onClick={() => untrack(row.id)}>{t("dash.remove")}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
