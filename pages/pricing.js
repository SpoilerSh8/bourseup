import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";
import { isProActive, isProExpired } from "../lib/subscriptionStatus";

const PAYMENT_LOGOS = [
  { src: "/payments/wave.svg", alt: "Wave" },
  { src: "/payments/orange-money.svg", alt: "Orange Money" },
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

  async function upgrade() {
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

  const active = isProActive(sub);
  const expired = isProExpired(sub);

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
          <p className="pricing-amount">2 500 FCFA <span>/ mois</span></p>

          <div className="pay-methods">
            {PAYMENT_LOGOS.map((m) => (
              <button
                key={m.alt}
                type="button"
                className="pay-method-btn"
                onClick={upgrade}
                disabled={loading}
                aria-label={`${t("pricing.payWith")} ${m.alt}`}
              >
                <img src={m.src} alt={m.alt} />
              </button>
            ))}
          </div>
          <p className="pay-methods-note">{loading ? t("pricing.redirecting") : t("pricing.methodsNote")}</p>
        </>
      )}
    </div>
  );
}
