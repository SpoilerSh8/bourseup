import Link from "next/link";
import { useI18n } from "../lib/i18n";

export default function Home() {
  const { t } = useI18n();
  return (
    <>
      <section className="landing-hero">
        <div className="landing-hero-text">
          <p className="landing-kicker">{t("home.kicker")}</p>
          <h1>{t("home.title")}</h1>
          <p className="landing-lede">{t("home.lede")}</p>
          <div className="hero-actions">
            <Link href="/scholarships"><button>{t("home.ctaScholarships")}</button></Link>
            <Link href="/generate"><button className="secondary">{t("home.ctaGenerate")}</button></Link>
          </div>
        </div>
        <div className="landing-hero-media">
          <video className="landing-video" src="/hero-animation.mp4" poster="/hero-poster.jpg" autoPlay loop muted playsInline />
        </div>
      </section>

      <section className="landing-steps">
        <h2>{t("home.howTitle")}</h2>
        <div className="steps-row">
          {[1, 2, 3].map((n) => (
            <div className="landing-step" key={n}>
              <span className="landing-step-number">{n}</span>
              <h3>{t(`home.step${n}.title`)}</h3>
              <p>{t(`home.step${n}.text`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta-band">
        <h2>{t("home.ctaTitle")}</h2>
        <Link href="/signup"><button>{t("home.ctaSignup")}</button></Link>
      </section>
    </>
  );
}
