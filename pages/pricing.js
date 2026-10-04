import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";

export default function Pricing() {
  const { user } = useUser();
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    const res = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      alert(t("pricing.error"));
    }
  }

  return (
    <div className="container">
      <h1>{t("pricing.title")}</h1>
      {router.query.success && <div className="alert-banner">{t("pricing.success")}</div>}
      <p>{t("pricing.text")}</p>
      <button onClick={upgrade} disabled={loading}>
        {loading ? t("pricing.redirecting") : t("pricing.button")}
      </button>
    </div>
  );
}
