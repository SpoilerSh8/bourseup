import { useEffect } from "react";
import { useI18n, LOCALES } from "../lib/i18n";

const CTA = { fr: "Continuer", en: "Continue", th: "ดำเนินการต่อ" };

export default function LanguageGate() {
  const { setLocale, suggested } = useI18n();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="lang-gate" role="dialog" aria-modal="true" aria-label="Choose your language">
      <div className="lang-gate-glow" />
      <div className="lang-gate-inner">
        <img src="/favicon.svg" alt="" className="lang-gate-logo" />
        <h1 className="lang-gate-title">Choisis ta langue</h1>
        <p className="lang-gate-sub">Choose your language · เลือกภาษาของคุณ</p>
        <div className="lang-cards">
          {LOCALES.map((l, i) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              autoFocus={suggested === l.code}
              className={`lang-card ${suggested === l.code ? "suggested" : ""}`}
              style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              onClick={() => setLocale(l.code)}
            >
              <span className="lang-card-badge">{l.short}</span>
              <span className="lang-card-name">{l.label}</span>
              <span className="lang-card-cta">{CTA[l.code]} →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
