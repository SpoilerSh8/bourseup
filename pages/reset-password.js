import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { useI18n } from "../lib/i18n";

export default function ResetPassword() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  if (success) {
    return <div className="container"><p>{t("auth.resetDone")}</p></div>;
  }

  if (!ready) {
    return (
      <div className="container">
        <h1>{t("auth.linkInvalid")}</h1>
        <p>{t("auth.linkInvalidText")} <a href="/login">{t("auth.goLogin")}</a></p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{t("auth.resetTitle")}</h1>
      <form onSubmit={handleSubmit} className="form">
        <input type="password" placeholder={t("auth.newPassword")} value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <button type="submit">{t("auth.update")}</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
