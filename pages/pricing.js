import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";
import { isProActive, isProExpired } from "../lib/subscriptionStatus";
import { WHATSAPP_NUMBER, WAVE_NUMBER, WAVE_ACCOUNT_NAME, PRO_PRICE_LABEL, PAYMENTS_ENABLED } from "../lib/contact";

const PAYMENT_LOGOS = [
  { src: "/payments/wave.png", alt: "Wave" },
  { src: "/payments/orange-money.png", alt: "Orange Money" },
  { src: "/payments/visa.svg", alt: "Visa" },
  { src: "/payments/mastercard.svg", alt: "Mastercard" },
];

export default function Pricing() {
  const { user } = useUser();
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sub, setSub] = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      setSubLoading(false);
      return;
    }
    supabase.from("subscriptions").select("plan, current_period_end").eq("user_id", user.id).single()
      .then(({ data }) => {
        setSub(data);
        setSubLoading(false);
      });
  }, [user]);

  // Paiement en ligne (PayDunya) : conservé tel quel, mais inactif tant que PAYMENTS_ENABLED est faux.
  async function upgrade() {
    if (!PAYMENTS_ENABLED) return; // on reste sur place, rien ne se passe
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setLoading(false);
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      alert(t("pricing.error"));
    }
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(WAVE_NUMBER.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  }

  const active = isProActive(sub);
  const expired = isProExpired(sub);
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t("pricing.manual.waText", { amount: PRO_PRICE_LABEL, email: user?.email || "—" })
  )}`;

  return (
    <div className="container">
      <h1>{t("pricing.title")}</h1>
      {router.query.success && <div className="alert-banner">{t("pricing.success")}</div>}

      {!subLoading && active && (
        <div className="unlock-card">
          <h3>{t("pricing.alreadyProTitle")}</h3>
          <p>
            {sub.current_period_end
              ? t("pricing.alreadyProUntil", { date: new Date(sub.current_period_end).toLocaleDateString() })
              : t("pricing.alreadyProNoDate")}
          </p>
        </div>
      )}

      {!subLoading && !active && (
        <>
          <p>{expired ? t("pricing.expiredText") : t("pricing.text")}</p>
          <p className="pricing-amount">{PRO_PRICE_LABEL} <span>/ mois</span></p>

          <div className={`pay-methods ${PAYMENTS_ENABLED ? "" : "is-disabled"}`}>
            {PAYMENT_LOGOS.map((m) => (
              <button
                key={m.alt}
                type="button"
                className="pay-method-btn"
                onClick={upgrade}
                disabled={loading}
                aria-disabled={!PAYMENTS_ENABLED}
                aria-label={`${t("pricing.payWith")} ${m.alt}`}
              >
                <img src={m.src} alt={m.alt} />
              </button>
            ))}
          </div>

          {PAYMENTS_ENABLED ? (
            <p className="pay-methods-note">{loading ? t("pricing.redirecting") : t("pricing.methodsNote")}</p>
          ) : (
            <div className="manual-pay">
              <div className="manual-pay-alert">
                <strong>{t("pricing.unavailableTitle")}</strong>
                <p>{t("pricing.unavailableText")}</p>
              </div>

              <ol className="manual-pay-steps">
                <li>
                  {t("pricing.manual.step1", { amount: PRO_PRICE_LABEL })}
                  <div className="wave-card">
                    <div><span>{t("pricing.manual.number")}</span><strong>{WAVE_NUMBER}</strong></div>
                    <div><span>{t("pricing.manual.name")}</span><strong>{WAVE_ACCOUNT_NAME}</strong></div>
                    <button type="button" onClick={copyNumber}>{copied ? t("letter.copied") : t("letter.copy")}</button>
                  </div>
                </li>
                <li>{t("pricing.manual.step2")}</li>
                <li>{t("pricing.manual.step3")}</li>
              </ol>

              {!user && (
                <p className="meta">{t("pricing.manual.createAccount")} <a href="/signup">{t("nav.signup")}</a></p>
              )}

              <a href={waLink} target="_blank" rel="noreferrer">
                <button className="wiz-btn primary">💬 {t("pricing.manual.whatsappBtn")}</button>
              </a>
              <p className="pay-methods-note">{t("pricing.manual.noWave")}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

