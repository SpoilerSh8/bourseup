import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";
import LetterPreview from "../components/LetterPreview";

const STEP_KEYS = ["scholarship", "background", "motivation", "achievements"];
const LEVELS = ["bachelor", "master", "phd"];
const LANGUAGES = [
  { value: "français", label: "Français", locale: "fr" },
  { value: "English", label: "English", locale: "en" },
  { value: "ภาษาไทย (Thai)", label: "ไทย", locale: "th" },
];
const LOADING_KEYS = ["gen.loading1", "gen.loading2", "gen.loading3"];

const letterLanguageFor = (locale) =>
  (LANGUAGES.find((l) => l.locale === locale) || LANGUAGES[1]).value;

const initialForm = (locale) => ({
  scholarshipId: "", scholarshipName: "", country: "", level: "master", wordLimit: "",
  language: letterLanguageFor(locale),
  letterType: "motivation_letter", letterFormatNotes: "",
  background: "", goals: "", motivation: "", achievements: "",
});


export default function Generate() {
  const { user, loading: userLoading } = useUser();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => initialForm(locale));
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [quotaError, setQuotaError] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [catalog, setCatalog] = useState([]);
  const [showList, setShowList] = useState(false);
  const [fullName, setFullName] = useState("");

  // La langue de la lettre suit la langue du site (modifiable ensuite)
  useEffect(() => {
    setForm((f) => ({ ...f, language: letterLanguageFor(locale) }));
  }, [locale]);

  // Charge les bourses existantes pour la liste de suggestions
  useEffect(() => {
    fetch("/api/scholarships")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCatalog(d))
      .catch(() => {});
  }, []);

  // Préremplissage depuis la page détail d'une bourse
  useEffect(() => {
    if (!router.isReady || catalog.length === 0) return;
    const { scholarshipName, country, level, wordLimit, scholarshipId } = router.query;
    if (!scholarshipName) return;
    const match = scholarshipId ? catalog.find((s) => s.id === scholarshipId) : null;
    setForm((f) => ({
      ...f,
      scholarshipId: scholarshipId || "",
      scholarshipName,
      country: country || f.country,
      level: level || f.level,
      wordLimit: wordLimit || f.wordLimit,
      letterType: match?.letter_type || f.letterType,
      letterFormatNotes: match?.letter_format_notes || f.letterFormatNotes,
    }));
  }, [router.isReady, catalog]);
  
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single()
      .then(({ data }) => setFullName(data?.full_name || ""));
  }, [user]);


  useEffect(() => {
    if (status !== "loading") return;
    const timer = setInterval(() => setMsgIndex((m) => (m + 1) % LOADING_KEYS.length), 2500);
    return () => clearInterval(timer);
  }, [status]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const suggestions = catalog
    .filter((s) => {
      const q = form.scholarshipName.trim().toLowerCase();
      if (!q) return true;
      return [s.name, s.provider, s.country].some((v) => (v || "").toLowerCase().includes(q));
    })
    .slice(0, 8);

   function pickScholarship(s) {
    setForm((f) => ({
      ...f,
      scholarshipId: s.id,
      scholarshipName: s.name,
      country: s.country || f.country,
      level: s.level || f.level,
      wordLimit: s.word_limit ? String(s.word_limit) : f.wordLimit,
      letterType: s.letter_type || "motivation_letter",
      letterFormatNotes: s.letter_format_notes || "",
    }));
    setShowList(false);
  }


  const canNext = [
    form.scholarshipName.trim().length > 1,
    form.background.trim().length >= 30,
    form.motivation.trim().length >= 30,
    true,
  ][step];

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    };
  }

  async function generate() {
    setStatus("loading");
    setError("");
    setQuotaError(false);
    const res = await fetch("/api/generate-letter", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(
        res.status === 403 ? t("gen.err.quota") : res.status === 401 ? t("gen.err.login") : t("gen.err.generic")
      );
      setQuotaError(res.status === 403);
      setStatus("idle");
      return;
    }
    setResult(data);
    setStatus("done");
  }

  async function refreshAccess() {
    const res = await fetch("/api/get-letter", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ documentId: result.documentId }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult({ locked: false, letter: data.letter, documentId: result.documentId });
    } else {
      alert(t("gen.notActive"));
    }
  }

  function restart() {
    setResult(null);
    setStatus("idle");
    setStep(0);
    setForm(initialForm(locale));
  }

  if (userLoading) return <p className="loading">{t("common.loading")}</p>;

  if (!user) {
    return (
      <div className="wiz">
        <h1 className="wiz-title">{t("gen.pageTitle")}</h1>
        <p className="wiz-sub">{t("gen.loginRequired")}</p>
        <Link href="/login"><button className="wiz-btn">{t("auth.loginTitle")}</button></Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="wiz">
        <div className="wiz-loading">
          <div className="wiz-spinner" />
          <h2>{t(LOADING_KEYS[msgIndex])}</h2>
          <p className="wiz-sub">{t("gen.loadingSub")}</p>
        </div>
      </div>
    );
  }

  if (status === "done" && result) {
    return (
      <div className="wiz">
        <h1 className="wiz-title">{result.locked ? t("gen.previewTitle") : t("gen.readyTitle")}</h1>
        <p className="wiz-sub">{form.scholarshipName}</p>
        <LetterPreview result={result} onRefreshAccess={refreshAccess} userName={fullName} userEmail={user.email} />
        <div className="wiz-nav">
          <button className="wiz-btn ghost" onClick={() => { setStatus("idle"); setStep(3); }}>{t("gen.editAnswers")}</button>
          <button className="wiz-btn ghost" onClick={restart}>{t("gen.newLetter")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wiz">
      <h1 className="wiz-title">{t("gen.title")}</h1>
      <p className="wiz-sub">{t("gen.subtitle")}</p>

      <div className="wiz-progress">
        {STEP_KEYS.map((s, i) => (
          <span key={s} className={i < step ? "done" : i === step ? "current" : ""} />
        ))}
      </div>
      <p className="wiz-stepname">
        {t("gen.stepOf", { n: step + 1, total: STEP_KEYS.length, name: t(`gen.step.${STEP_KEYS[step]}`) })}
      </p>

      <div className="wiz-card">
        {step === 0 && (
          <>
            <h2>{t("gen.s0.title")}</h2>
            <p className="wiz-lead">{t("gen.s0.lead")}</p>

            <div className="wiz-field">
              <label>{t("gen.s0.name")}</label>
              <div className="combo-box">
                <input
                  type="text"
                  autoComplete="off"
                  placeholder={t("gen.s0.namePh")}
                  value={form.scholarshipName}
                  onFocus={() => setShowList(true)}
                  onBlur={() => setTimeout(() => setShowList(false), 150)}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, scholarshipName: e.target.value, scholarshipId: "" }));
                    setShowList(true);
                  }}
                />
                {showList && suggestions.length > 0 && (
                  <ul className="combo-list">
                    {suggestions.map((s) => (
                      <li key={s.id} onMouseDown={(e) => { e.preventDefault(); pickScholarship(s); }}>
                        <strong>{s.name}</strong>
                        <span>
                          {[s.provider, s.country, s.level && t(`level.${s.level}`)].filter(Boolean).join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="wiz-hint">
                {form.scholarshipId
                  ? <span>{t("gen.s0.fromCatalog")}</span>
                  : <span>{t("gen.s0.notListed")}</span>}
              </div>
              {form.scholarshipId && (
                <div className="letter-type-badge">
                  {t("gen.s0.letterTypeLabel")} : <strong>{t(`letterType.${form.letterType}`)}</strong>
                </div>
              )}
            </div>


            <div className="wiz-row">
              <div className="wiz-field">
                <label>{t("gen.s0.country")}</label>
                <input type="text" placeholder={t("gen.s0.countryPh")}
                  value={form.country} onChange={(e) => update("country", e.target.value)} />
              </div>
              <div className="wiz-field">
                <label>{t("gen.s0.words")}</label>
                <input type="number" placeholder={t("gen.s0.wordsPh")}
                  value={form.wordLimit} onChange={(e) => update("wordLimit", e.target.value)} />
              </div>
            </div>

            <div className="wiz-field">
              <label>{t("gen.s0.level")}</label>
              <div className="wiz-chips">
                {LEVELS.map((l) => (
                  <button key={l} type="button"
                    className={`wiz-chip ${form.level === l ? "selected" : ""}`}
                    onClick={() => update("level", l)}>{t(`level.${l}`)}</button>
                ))}
              </div>
            </div>

            <div className="wiz-field">
              <label>{t("gen.s0.language")}</label>
              <div className="wiz-chips">
                {LANGUAGES.map((l) => (
                  <button key={l.value} type="button"
                    className={`wiz-chip ${form.language === l.value ? "selected" : ""}`}
                    onClick={() => update("language", l.value)}>{l.label}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>{t("gen.s1.title")}</h2>
            <p className="wiz-lead">{t("gen.s1.lead")}</p>
            <div className="wiz-field">
              <textarea
                placeholder={t("gen.s1.ph")}
                value={form.background} onChange={(e) => update("background", e.target.value)} />
              <div className="wiz-hint">
                <span>{t("gen.s1.hint")}</span>
                <span>{t("gen.chars", { n: form.background.length, min: 30 })}</span>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>{t("gen.s2.title")}</h2>
            <p className="wiz-lead">{t("gen.s2.lead")}</p>
            <div className="wiz-field">
              <label>{t("gen.s2.goals")} <span style={{ fontWeight: 400, color: "#8A9296" }}>{t("gen.optional")}</span></label>
              <textarea style={{ minHeight: 90 }}
                placeholder={t("gen.s2.goalsPh")}
                value={form.goals} onChange={(e) => update("goals", e.target.value)} />
            </div>
            <div className="wiz-field">
              <label>{t("gen.s2.why")}</label>
              <textarea
                placeholder={t("gen.s2.whyPh")}
                value={form.motivation} onChange={(e) => update("motivation", e.target.value)} />
              <div className="wiz-hint">
                <span>{t("gen.s2.hint")}</span>
                <span>{t("gen.chars", { n: form.motivation.length, min: 30 })}</span>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>{t("gen.s3.title")}</h2>
            <p className="wiz-lead">{t("gen.s3.lead")}</p>
            <div className="wiz-field">
              <textarea
                placeholder={t("gen.s3.ph")}
                value={form.achievements} onChange={(e) => update("achievements", e.target.value)} />
              <div className="wiz-hint"><span>{t("gen.s3.hint")}</span></div>
            </div>
          </>
        )}

        {error && (
          <p className="error">
            {error}{" "}
            {quotaError && <Link href="/pricing">{t("gen.goPro")}</Link>}
          </p>
        )}

        <div className="wiz-nav">
          {step > 0 ? (
            <button className="wiz-btn ghost" onClick={() => setStep(step - 1)}>{t("gen.back")}</button>
          ) : <span />}
          {step < STEP_KEYS.length - 1 ? (
            <button className="wiz-btn" disabled={!canNext} onClick={() => setStep(step + 1)}>{t("gen.next")}</button>
          ) : (
            <button className="wiz-btn primary" onClick={generate}>{t("gen.generate")}</button>
          )}
        </div>
      </div>
    </div>
  );
}
