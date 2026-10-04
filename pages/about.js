import { useI18n } from "../lib/i18n";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "../lib/contact";

export default function About() {
  const { t } = useI18n();
  return (
    <div className="container about-page">
      <section className="about-hero">
        <h1>{t("about.title")}</h1>
        <p className="about-lede">{t("about.lede")}</p>
      </section>

      <section className="about-section">
        <h2>{t("about.genesisTitle")}</h2>
        <p>{t("about.genesis")}</p>
      </section>

      <section className="about-section founder-section">
        <h2>{t("about.founderTitle")}</h2>
        <div className="founder-card">
          <img src="/founder.jpg" alt={t("about.photoAlt")} className="founder-photo" />
          <div>
            <h3>Serigne Habib Sy</h3>
            <p className="founder-role">{t("about.founderRole")}</p>
            <p>{t("about.bio")}</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>{t("about.contactTitle")}</h2>
        <p>{t("about.contactText")}</p>
        <div className="about-contact-actions">
          <a href={`mailto:${CONTACT_EMAIL}`}><button className="secondary">✉️ Email</button></a>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><button>💬 WhatsApp</button></a>
        </div>
      </section>
    </div>
  );
}
