import { useState } from "react";
import Link from "next/link";
import { useUser } from "../lib/useUser";
import { useI18n } from "../lib/i18n";
import { supabase } from "../lib/supabaseClient";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { user, loading } = useUser();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  function logout() {
    supabase.auth.signOut();
    closeMenu();
  }

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
        <Link href="/pricing" onClick={closeMenu}>{t("nav.pricing")}</Link>
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
