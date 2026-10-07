import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";
import FormattedLetter from "../components/FormattedLetter";
import { downloadLetterPdf } from "../lib/letterPdf";


export default function Correct() {
  const { user, loading: userLoading } = useUser();
  const { t } = useI18n();
  const [isPro, setIsPro] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [file, setFile] = useState(null);
  const [scholarshipName, setScholarshipName] = useState("");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).single()
      .then(({ data }) => setIsPro(data?.plan === "pro"));
  }, [user]);

  function handleFile(e) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setDraftText(""); // le fichier prend le dessus sur le texte collé
  }

  async function submit(e) {
    e.preventDefault();
    if (!draftText.trim() && !file) {
      setError(t("correct.needContent"));
      return;
    }
    setLoading(true);
    setError("");
    setResult("");

    const { data: { session } } = await supabase.auth.getSession();
    const formData = new FormData();
    formData.append("draftText", draftText);
    formData.append("scholarshipName", scholarshipName);
    formData.append("focus", focus);
    if (file) formData.append("file", file);

    const res = await fetch("/api/correct-letter", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || t("gen.err.generic"));
    setResult(data.letter);
  }

  if (userLoading || (user && isPro === null)) return <p className="loading">{t("common.loading")}</p>;

  if (!user) {
    return (
      <div className="wiz">
        <h1 className="wiz-title">{t("correct.title")}</h1>
        <p className="wiz-sub">{t("gen.loginRequired")}</p>
        <Link href="/login"><button className="wiz-btn">{t("auth.loginTitle")}</button></Link>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="wiz">
        <h1 className="wiz-title">{t("correct.title")}</h1>
        <div className="unlock-card">
          <h3>{t("correct.proOnlyTitle")}</h3>
          <p>{t("correct.proOnlyText")}</p>
          <Link href="/pricing"><button className="wiz-btn primary">{t("gen.goPro")}</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wiz">
      <h1 className="wiz-title">{t("correct.title")}</h1>
      <p className="wiz-sub">{t("correct.lead")}</p>

      <form onSubmit={submit} className="wiz-card">
        <div className="wiz-field">
          <label>{t("correct.uploadLabel")}</label>
          <label className="upload-drop">
            <input type="file" accept=".pdf,.docx" onChange={handleFile} hidden />
            {file ? (
              <span>📄 {file.name}</span>
            ) : (
              <span>{t("correct.uploadHint")}</span>
            )}
          </label>
          {file && (
            <button type="button" className="upload-clear" onClick={() => setFile(null)}>
              {t("correct.removeFile")}
            </button>
          )}
        </div>

        <div className="wiz-divider"><span>{t("correct.or")}</span></div>

        <div className="wiz-field">
          <label>{t("correct.pasteLabel")}</label>
          <textarea
            style={{ minHeight: 200 }}
            placeholder={t("correct.pastePh")}
            value={draftText}
            disabled={!!file}
            onChange={(e) => setDraftText(e.target.value)}
          />
        </div>

        <div className="wiz-row">
          <div className="wiz-field">
            <label>{t("correct.scholarshipLabel")}</label>
            <input type="text" value={scholarshipName} onChange={(e) => setScholarshipName(e.target.value)} />
          </div>
          <div className="wiz-field">
            <label>{t("correct.focusLabel")}</label>
            <input type="text" placeholder={t("correct.focusPh")} value={focus} onChange={(e) => setFocus(e.target.value)} />
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        <button className="wiz-btn primary" type="submit" disabled={loading}>
          {loading ? t("correct.loading") : t("correct.submit")}
        </button>
      </form>

    {result && (
        <>
          <div className="letter-toolbar" style={{ marginTop: "1.5rem" }}>
            <button className="wiz-btn" onClick={async () => { await navigator.clipboard.writeText(result); }}>{t("letter.copy")}</button>
            <button className="wiz-btn" onClick={() => downloadLetterPdf(result, "lettre-corrigee.pdf")}>{t("letter.download")}</button>
            <button className="wiz-btn ghost" onClick={() => window.print()}>{t("letter.print")}</button>
          </div>
          <div className="letter-paper printable-letter">
            <h2>{t("correct.resultTitle")}</h2>
            <div className="letter-text">
              <FormattedLetter text={result} />
            </div>
          </div>
        </>
      )}

    </div>
  );
}
