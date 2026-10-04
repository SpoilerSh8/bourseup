export default function LegalLangToggle({ lang, setLang, t }) {
  return (
    <div className="legal-toggle">
      <button className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")}>{t("legal.onlyFrToggle")}</button>
      <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>{t("legal.onlyEnToggle")}</button>
    </div>
  );
}
