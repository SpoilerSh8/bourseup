import Link from "next/link";
import { useI18n } from "../lib/i18n";
import { CONTACT_EMAIL } from "../lib/contact";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/logo.svg" alt="BourseUp" height={32} />
          <p>{t("footer.tagline")}</p>
        </div>

        <div className="footer-col">
          <h4>{t("footer.product")}</h4>
          <Link href="/scholarships">{t("nav.scholarships")}</Link>
          <Link href="/generate">{t("nav.generate")}</Link>
          <Link href="/dashboard">{t("nav.dashboard")}</Link>
        </div>

        <div className="footer-col">
          <h4>{t("footer.about")}</h4>
          <Link href="/about">{t("footer.story")}</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{t("footer.contact")}</a>
        </div>

        <div className="footer-col">
          <h4>{t("footer.legal")}</h4>
          <Link href="/privacy">{t("footer.privacy")}</Link>
          <Link href="/terms">{t("footer.terms")}</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BourseUp. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
