import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { useI18n } from "../lib/i18n";

export default function Login() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(t("auth.badCreds"));
    } else {
      router.push("/scholarships");
    }
  }

  async function forgotPassword(e) {
    e.preventDefault();
    if (!email) return alert(t("auth.forgotNeedEmail"));
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    alert(t("auth.forgotSent"));
  }

  return (
    <div className="container">
      <h1>{t("auth.loginTitle")}</h1>
      <form onSubmit={handleSubmit} className="form">
        <input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder={t("auth.password")} value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? t("auth.loggingIn") : t("auth.loginTitle")}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p><a href="#" onClick={forgotPassword}>{t("auth.forgot")}</a></p>
      <p>{t("auth.noAccount")} <a href="/signup">{t("auth.signup")}</a></p>
    </div>
  );
}
