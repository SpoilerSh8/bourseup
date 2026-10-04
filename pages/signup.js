import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { useI18n } from "../lib/i18n";

export default function Signup() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, country } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/scholarships");
    }
  }

  return (
    <div className="container">
      <h1>{t("auth.signupTitle")}</h1>
      <form onSubmit={handleSubmit} className="form">
        <input placeholder={t("auth.fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <input placeholder={t("auth.country")} value={country} onChange={(e) => setCountry(e.target.value)} />
        <input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder={t("auth.passwordMin")} value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <button type="submit" disabled={loading}>{loading ? t("auth.creating") : t("auth.signup")}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>{t("auth.haveAccount")} <a href="/login">{t("auth.loginTitle")}</a></p>
    </div>
  );
}
