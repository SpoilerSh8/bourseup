import { useState } from "react";
import Link from "next/link";
import { useI18n } from "../lib/i18n";
import styles from "./ScholarshipCard.module.css";

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

const CAPITALS = [
  ["turquie", "ankara", "🇹🇷", "center"],
  ["hongrie", "budapest", "🇭🇺", "center"],
  ["royaume", "london", "🇬🇧", "center"],
  ["france", "paris", "🇫🇷", "center"],
  ["europe", "bruxelles", "🇪🇺", "center"],
  ["coree", "seoul", "🇰🇷", "center"],
  ["chine", "beijing", "🇨🇳", "center"],
];

const norm = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function ScholarshipCard({ scholarship, onTrack, isTracked, index = 0 }) {
  const { t } = useI18n();
  const [imgFailed, setImgFailed] = useState(false);
  const days = daysLeft(scholarship.deadline);
  const state = urgency(days);
  const match = CAPITALS.find(([key]) => norm(scholarship.country).includes(key));
  const benefits = (scholarship.benefits || "").split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 3);
  const meta = [scholarship.provider, scholarship.country].filter(Boolean).join(" · ");

  return (
    <article className={`${styles.card} ${styles[state] || ""}`} style={{ animationDelay: `${index * 80}ms` }}>
      <div className={styles.cover}>
        {match && !imgFailed && (
          <img
            src={`/img/capitales/${match[1]}.jpg`}
            alt=""
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            style={{ objectPosition: match[3] }}
            onError={() => setImgFailed(true)}
          />

        )}
        {match && <span className={styles.flag}>{match[2]}</span>}
        {scholarship.level && <span className={styles.lvl}>{t(`level.${scholarship.level}`)}</span>}
        <span className={styles.tag}>{t(`card.urgency.${state}`)}</span>
      </div>

      <div className={styles.body}>
        <Link href={`/scholarships/${scholarship.id}`} className={styles.title}>{scholarship.name}</Link>
        <p className={styles.prov}>{meta}</p>
        {scholarship.description && <p className={styles.desc}>{scholarship.description}</p>}
        {benefits.length > 0 && (
          <div className={styles.chips}>{benefits.map((b, i) => <span key={i} className={styles.chip}>{b}</span>)}</div>
        )}

        <div className={styles.foot}>
          <div className={styles.dl}>
            {days !== null ? t("card.daysUnit") : t("card.na")}
            <b>{days !== null ? Math.max(days, 0) : "—"}</b>
          </div>
          <div className={styles.actions}>
            <Link href={`/scholarships/${scholarship.id}`}><button className="secondary">{t("card.detail")}</button></Link>
            {isTracked ? (
              <Link href="/dashboard"><button>{t("card.tracked")}</button></Link>
            ) : (
              <button onClick={() => onTrack(scholarship.id)}>{t("card.track")}</button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
