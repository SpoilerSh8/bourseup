import { useI18n, LOCALES } from "../lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label={t("nav.language")}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          title={l.label}
          className={locale === l.code ? "active" : ""}
          onClick={() => setLocale(l.code)}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
