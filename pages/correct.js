import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";

export default function Correct() {
  const { user, loading: userLoading } = useUser();
  const { t } = useI18n();
  const [isPro, setIsPro] = useState(null);
  const [draftText, setDraftText] = useState("");
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

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/correct-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ draftText, scholarshipName, focus }),
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
          <label>{t("correct.pasteLabel")}</label>
          <textarea style={{ minHeight: 220 }} placeholder={t("correct.pastePh")}
            value={draftText} onChange={(e) => setDraftText(e.target.value)} required />
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
        <div className="letter-paper" style={{ marginTop: "1.5rem" }}>
          <h2>{t("correct.resultTitle")}</h2>
          {result.split(/\n{2,}/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
    </div>
  );
}
