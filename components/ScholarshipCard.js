import Link from "next/link";
import { useI18n } from "../lib/i18n";

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

export default function ScholarshipCard({ scholarship, onTrack, isTracked }) {
  const { t } = useI18n();
  const days = daysLeft(scholarship.deadline);
  const state = urgency(days);
  const meta = [scholarship.provider, scholarship.country, scholarship.level && t(`level.${scholarship.level}`)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`scholar-row ${state}`}>
      <div className="scholar-row-deadline">
        <span className="scholar-row-days">{days !== null ? Math.max(days, 0) : "—"}</span>
        <span className="scholar-row-days-label">{days !== null ? t("card.daysUnit") : t("card.na")}</span>
      </div>

      <div className="scholar-row-body">
        <Link href={`/scholarships/${scholarship.id}`} className="scholar-row-title">
          {scholarship.name}
        </Link>
        <p className="scholar-row-meta">{meta}</p>
        <span className={`status-tag ${state}`}>{t(`card.urgency.${state}`)}</span>
      </div>

      <div className="scholar-row-actions">
        <Link href={`/scholarships/${scholarship.id}`}><button className="secondary">{t("card.detail")}</button></Link>
        {isTracked ? (
          <Link href="/dashboard"><button>{t("card.tracked")}</button></Link>
        ) : (
          <button onClick={() => onTrack(scholarship.id)}>{t("card.track")}</button>
        )}
      </div>
    </div>
  );
}
