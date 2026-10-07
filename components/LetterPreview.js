import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "../lib/i18n";
import FormattedLetter from "./FormattedLetter";
import { downloadLetterPdf } from "../lib/letterPdf";

export default function LetterPreview({ result, onRefreshAccess, userName, userEmail }) {
  const { t } = useI18n();
  const locked = result.locked;
  const text = locked ? result.preview : result.letter;
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!locked) return;
    let timer;
    const hideFor = (ms = 1500) => {
      setHidden(true);
      clearTimeout(timer);
      timer = setTimeout(() => setHidden(false), ms);
    };
    const onKeyDown = (e) => {
      const k = (e.key || "").toLowerCase();
      if (e.key === "PrintScreen") {
        hideFor(2500);
        navigator.clipboard?.writeText("").catch(() => {});
      }
      if (e.metaKey && e.shiftKey) hideFor();
      if ((e.ctrlKey || e.metaKey) && ["c", "p", "s", "a"].includes(k)) e.preventDefault();
    };
    const onKeyUp = (e) => {
      if (e.key === "PrintScreen") {
        hideFor(2500);
        navigator.clipboard?.writeText("").catch(() => {});
      }
    };
    const onVisibility = () => setHidden(document.hidden);
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [locked]);

  const block = locked ? (e) => e.preventDefault() : undefined;

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    downloadLetterPdf(text, "lettre-de-motivation.pdf", { name: userName, email: userEmail });
  }

  return (
    <div className="letter-wrap">
      {!locked && (
        <div className="letter-toolbar">
          <button className="wiz-btn" onClick={copy}>{copied ? t("letter.copied") : t("letter.copy")}</button>
          <button className="wiz-btn" onClick={download}>{t("letter.download")}</button>
          <button className="wiz-btn ghost" onClick={() => window.print()}>{t("letter.print")}</button>
        </div>
      )}

      <div
        className={`letter-paper ${locked ? "locked" : "printable-letter"} ${hidden ? "is-hidden" : ""}`}
        onContextMenu={block}
        onCopy={block}
        onCut={block}
        onDragStart={block}
      >
        {(userName || userEmail) && (
          <div className="letter-header">
            {userName && <strong>{userName}</strong>}
            {userEmail && <span>{userEmail}</span>}
          </div>
        )}

        <div className="letter-text">
          <FormattedLetter text={text} />
        </div>

        {locked && (
          <>
            <div className="locked-tail" aria-hidden="true">
              <span style={{ width: "96%" }} />
              <span style={{ width: "88%" }} />
              <span style={{ width: "93%" }} />
              <span style={{ width: "72%" }} />
              <span style={{ width: "40%" }} />
            </div>
            <div className="letter-watermark" />
          </>
        )}
      </div>

      {locked && <div className="print-blocked printable-letter">{t("letter.printBlocked")}</div>}

      {locked && (
        <div className="unlock-card">
          <h3>{t("letter.unlockTitle")}</h3>
          <p>{t("letter.unlockText", { n: Math.round((result.totalWords || 0) * 0.65) })}</p>
          <div className="unlock-actions">
            <Link href="/pricing"><button className="wiz-btn primary">{t("letter.unlockBtn")}</button></Link>
            <button className="wiz-btn ghost" onClick={onRefreshAccess}>{t("letter.alreadyPaid")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
