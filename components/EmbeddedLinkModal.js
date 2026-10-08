import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";

export default function EmbeddedLinkModal({ url, onClose }) {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setSlow(true), 3500);
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="embed-overlay" onClick={onClose}>
      <div className="embed-box" onClick={(e) => e.stopPropagation()}>
        <div className="embed-bar">
          <span className="embed-dot" />
          <button className="embed-close" onClick={onClose} aria-label={t("embed.close")}>✕</button>
        </div>
        <div className="embed-body">
          {!loaded && <div className="embed-loading">{t("embed.loading")}</div>}
          <iframe src={url} title="external-content" onLoad={() => setLoaded(true)} className="embed-iframe" />
        </div>
        {slow && (
          <div className="embed-fallback">
            <p>{t("embed.blockedHint")}</p>
            <a href={url} target="_blank" rel="noreferrer noopener">{t("embed.openNewTab")}</a>
          </div>
        )}
      </div>
    </div>
  );
}
