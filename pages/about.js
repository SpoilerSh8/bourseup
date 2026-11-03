import { useI18n } from "../lib/i18n";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "../lib/contact";

export default function About() {
  const { t } = useI18n();
  const values = ["1", "2", "3"];
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

      <section className="about-section">
        <img
          src="/img/shai1-banner.jpg"
          alt="SHAi1 — Building Tomorrow"
          style={{
            width: "100%",
            height: "auto",
            minHeight: 150,
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            borderRadius: 18,
            marginBottom: "1.5rem",
          }}
        />
        <h2>{t("about.companyTitle")}</h2>
        <p>{t("about.company")}</p>
        <h3>{t("about.missionTitle")}</h3>
        <p>{t("about.mission")}</p>
        <h3>{t("about.valuesTitle")}</h3>
        <ul>
          {values.map((n) => (
            <li key={n}>
              <strong>{t(`about.value${n}Title`)}</strong> — {t(`about.value${n}`)}
            </li>
          ))}
        </ul>
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