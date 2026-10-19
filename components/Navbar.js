import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";
import { isProActive, isProExpired } from "../lib/subscriptionStatus";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { user, loading } = useUser();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(null);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    if (!user) {
      setSub(null);
      return;
    }
    supabase.from("subscriptions").select("plan, current_period_end").eq("user_id", user.id).single()
      .then(({ data }) => setSub(data));
  }, [user]);

  function logout() {
    supabase.auth.signOut();
    closeMenu();
  }

  const active = isProActive(sub);
  const expired = isProExpired(sub);

  return (
    <nav className="navbar">
      <Link href="/" className="brand" onClick={closeMenu}>
        <img src="/logo.svg" alt="BourseUp" height={36} />
      </Link>

      <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label={t("nav.menu")}>
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-links ${open ? "open" : ""}`}>
        <Link href="/scholarships" onClick={closeMenu}>{t("nav.scholarships")}</Link>
        <Link href="/generate" onClick={closeMenu}>{t("nav.generate")}</Link>
        <Link href="/correct" onClick={closeMenu}>{t("nav.correct")}</Link>
        {user && <Link href="/dashboard" onClick={closeMenu}>{t("nav.dashboard")}</Link>}
        {!active && (
          <Link href="/pricing" onClick={closeMenu}>
            {expired ? t("nav.renew") : t("nav.pricing")}
          </Link>
        )}
        <LanguageSwitcher />
        {!loading && (
          user ? (
            <button onClick={logout}>{t("nav.logout")}</button>
          ) : (
            <>
              <Link href="/login" onClick={closeMenu}>{t("nav.login")}</Link>
              <Link href="/signup" onClick={closeMenu}><button>{t("nav.signup")}</button></Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}
