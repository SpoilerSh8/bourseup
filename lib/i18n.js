import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import fr from "../locales/fr";
import en from "../locales/en";
import th from "../locales/th";

export const LOCALES = [
  { code: "fr", label: "Français", short: "FR" },
  { code: "en", label: "English", short: "EN" },
  { code: "th", label: "ไทย", short: "TH" },
];

const DICTS = { fr, en, th };
const STORAGE_KEY = "bu_lang";
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const I18nContext = createContext({
  t: (key) => key,
  locale: "fr",
  setLocale: () => {},
  needsChoice: false,
  suggested: "fr",
});

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState("fr");
  const [ready, setReady] = useState(false);
  const [needsChoice, setNeedsChoice] = useState(false);
  const [suggested, setSuggested] = useState("fr");

  useIsoLayoutEffect(() => {
    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored && DICTS[stored]) {
      setLocaleState(stored);
    } else {
      const browser = (navigator.language || "").slice(0, 2).toLowerCase();
      setSuggested(DICTS[browser] ? browser : "en");
      setNeedsChoice(true);
    }
    setReady(true);
  }, []);

  useIsoLayoutEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    document.documentElement.removeAttribute("data-lang-pending");
  }, [ready, locale]);

  const setLocale = useCallback((code) => {
    if (!DICTS[code]) return;
    setLocaleState(code);
    setNeedsChoice(false);
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  }, []);

  const t = useCallback(
    (key, vars) => {
      let str = DICTS[locale][key] ?? DICTS.fr[key] ?? key;
      if (vars) {
        Object.keys(vars).forEach((k) => {
          str = str.split(`{${k}}`).join(String(vars[k]));
        });
      }
      return str;
    },
    [locale]
  );

  const value = useMemo(
    () => ({ t, locale, setLocale, needsChoice, suggested }),
    [t, locale, setLocale, needsChoice, suggested]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
