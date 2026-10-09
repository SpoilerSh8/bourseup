import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "../../lib/useUser";
import { useI18n } from "../../lib/i18n";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function daysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

function urgencyClass(days) {
  if (days === null) return "plenty";
  if (days < 0) return "closed";
  if (days <= 14) return "urgent";
  if (days <= 30) return "soon";
  return "plenty";
}

const lines = (text) => (text || "").split("\n").filter(Boolean);

export default function ScholarshipDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { t } = useI18n();
  const [scholarship, setScholarship] = useState(null);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("scholarships").select("*").eq("id", id).single()
      .then(({ data }) => setScholarship(data));
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    supabase.from("user_scholarships").select("id").eq("user_id", user.id).eq("scholarship_id", id).single()
      .then(({ data }) => setTracked(!!data));
  }, [id, user]);

  async function track() {
    if (!user) { window.location.href = "/login"; return; }
    await supabase.from("user_scholarships").upsert({ user_id: user.id, scholarship_id: id, status: "interested" });
    setTracked(true);
  }

  if (!scholarship) return <p className="loading">{t("common.loading")}</p>;

  const days = daysLeft(scholarship.deadline);
  const documents = Array.isArray(scholarship.required_documents) ? scholarship.required_documents : [];
  const benefits = lines(scholarship.benefits);
  const criteria = lines(scholarship.eligibility_criteria);
  const empty = <p>{t("detail.notProvided")}</p>;

  return (
    <div className="detail-page">
      <div className="detail-sidebar">
        <div className={`deadline-block ${urgencyClass(days)}`}>
          <span className="deadline-number">{days !== null ? Math.max(days, 0) : "—"}</span>
          <span className="deadline-label">
            {days !== null ? (days >= 0 ? t("detail.daysLeft") : t("detail.closed")) : t("detail.noDate")}
          </span>
        </div>

        <dl className="fact-list">
          <dt>{t("detail.provider")}</dt><dd>{scholarship.provider || "—"}</dd>
          <dt>{t("detail.country")}</dt><dd>{scholarship.country || "—"}</dd>
          <dt>{t("detail.level")}</dt><dd>{scholarship.level ? t(`level.${scholarship.level}`) : "—"}</dd>
          {scholarship.word_limit && (<><dt>{t("detail.wordLimit")}</dt><dd>{scholarship.word_limit}</dd></>)}
        </dl>

        <div className="sidebar-actions">
          {tracked ? (
            <a href="/dashboard"><button>{t("detail.trackedGo")}</button></a>
          ) : (
            <button onClick={track}>{t("detail.track")}</button>
          )}
          <a href={`/generate?scholarshipId=${scholarship.id}&scholarshipName=${encodeURIComponent(scholarship.name)}&country=${encodeURIComponent(scholarship.country || "")}&level=${scholarship.level === "all" ? "" : scholarship.level}&wordLimit=${scholarship.word_limit || ""}`}>
            <button className="secondary">{t("detail.generate")}</button>
          </a>
          {scholarship.official_link && user && (
            <a href={scholarship.official_link} target="_blank" rel="noreferrer">{t("detail.official")}</a>          )}
        </div>
      </div>

      <div className="detail-main">
        <p className="detail-eyebrow"><a href="/scholarships">{t("detail.back")}</a></p>
        <h1>{scholarship.name}</h1>

        {scholarship.description && (
          <section className="detail-section description">
            <p>{scholarship.description}</p>
          </section>
        )}

        <section className="detail-section">
          <h2>{t("detail.benefits")}</h2>
          {benefits.length > 0 ? (
            <ul className="benefit-list">{benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
          ) : empty}
        </section>

        <section className="detail-section">
          <h2>{t("detail.criteria")}</h2>
          {criteria.length > 0 ? (
            <ul className="criteria-list">{criteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
          ) : empty}
        </section>

        {scholarship.application_steps && (
          <section className="detail-section steps-markdown">
            <h2>{t("detail.steps")}</h2>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{ a: ({ href, children }) => <ExternalLink href={href}>{children}</ExternalLink> }}
            >
              {scholarship.application_steps}
            </ReactMarkdown>
          </section>
        )}

        <section className="detail-section">
          <h2>{t("detail.documents")}</h2>
          {documents.length > 0 ? (
            <ul className="doc-checklist">{documents.map((d, i) => <li key={i}>{d}</li>)}</ul>
          ) : empty}
        </section>

        <section className="detail-section">
          <h2>{t("detail.where")}</h2>
          <p>{scholarship.authority_info || t("detail.seeOfficial")}</p>
        </section>

        {scholarship.tips && (
          <section className="detail-section tips-box">
            <h2>{t("detail.tips")}</h2>
            <p>{scholarship.tips}</p>
          </section>
        )}
      </div>
    </div>
  );
}
