import { useState } from "react";
import { useI18n } from "../lib/i18n";
import { CONTACT_EMAIL } from "../lib/contact";
import LegalLangToggle from "../components/LegalLangToggle";

export default function Privacy() {
  const { t, locale } = useI18n();
  const [lang, setLang] = useState(locale === "en" ? "en" : "fr");

  return (
    <div className="container legal-page">
      <LegalLangToggle lang={lang} setLang={setLang} t={t} />
      <p className="legal-updated">{lang === "fr" ? "Dernière mise à jour" : "Last updated"} : {new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long" })}</p>
      <p className="legal-disclaimer">{t("legal.notLegalAdvice")}</p>

      {lang === "fr" ? <PrivacyFR /> : <PrivacyEN />}
    </div>
  );
}

function PrivacyFR() {
  return (
    <>
      <h1>Politique de confidentialité</h1>

      <section className="legal-section">
        <h2>1. Qui nous sommes</h2>
        <p>
          BourseUp est un service édité à titre individuel par Serigne Habib Sy. Pour toute
          question relative à tes données personnelles, tu peux nous contacter à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Données que nous collectons</h2>
        <ul>
          <li><strong>Compte</strong> : nom, email, pays, mot de passe (chiffré, jamais lisible par nous)</li>
          <li><strong>Utilisation</strong> : bourses suivies, statut de tes candidatures, documents cochés</li>
          <li><strong>Lettres générées</strong> : les informations que tu fournis pour générer une lettre (parcours, motivation, réalisations) et le texte généré</li>
          <li><strong>Paiement</strong> : nous ne stockons aucune donnée bancaire ou de mobile money. Ces informations sont traitées directement par notre prestataire de paiement (PayDunya). Nous conservons uniquement le montant, le statut et une référence de transaction</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>3. Pourquoi nous les utilisons</h2>
        <ul>
          <li>Faire fonctionner ton compte et ton suivi de candidatures</li>
          <li>Générer tes lettres de motivation via l'API d'Anthropic (Claude)</li>
          <li>T'envoyer des rappels de deadlines et des emails liés à ton compte (via Resend)</li>
          <li>Traiter les paiements de l'abonnement Pro (via PayDunya)</li>
          <li>Assurer la sécurité du service et prévenir les abus</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>4. Avec qui tes données sont partagées</h2>
        <p>Nous ne vendons aucune donnée. Certains prestataires techniques traitent des données en notre nom, dans le seul cadre du fonctionnement du service :</p>
        <ul>
          <li><strong>Supabase</strong> — hébergement de la base de données et authentification</li>
          <li><strong>Anthropic</strong> — génération des lettres de motivation (le contenu que tu saisis est envoyé pour traitement, non conservé par Anthropic au-delà du traitement de la requête)</li>
          <li><strong>Resend</strong> — envoi des emails transactionnels et des rappels</li>
          <li><strong>PayDunya</strong> — traitement des paiements (Wave, Orange Money, cartes)</li>
          <li><strong>Vercel</strong> — hébergement du site</li>
        </ul>
        <p>Ces prestataires peuvent traiter des données sur des serveurs situés hors de ton pays de résidence.</p>
      </section>

      <section className="legal-section">
        <h2>5. Accès de notre équipe support à ton compte</h2>
        <p>
          En cas de besoin d'assistance, un administrateur peut consulter des métadonnées
          agrégées de ton compte (plan, nombre de lettres générées, dernière activité) — jamais
          le contenu de tes lettres par défaut. La consultation du contenu d'une lettre précise
          n'est possible qu'avec une justification écrite, et chaque action est enregistrée dans
          un journal d'audit horodaté, qui ne peut être ni consulté ni modifié depuis
          l'application elle-même.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Combien de temps nous conservons tes données</h2>
        <p>
          Tant que ton compte est actif. Tu peux demander la suppression de ton compte et de
          tes données à tout moment en nous écrivant à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          Certaines données liées aux paiements peuvent être conservées plus longtemps si une
          obligation légale ou comptable l'impose.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Tes droits</h2>
        <p>Tu peux à tout moment nous demander : l'accès à tes données, leur correction, leur suppression, ou une copie de celles-ci. Il te suffit d'écrire à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </section>

      <section className="legal-section">
        <h2>8. Cookies et stockage local</h2>
        <p>
          Nous utilisons le stockage local de ton navigateur pour retenir ta session de connexion
          et ta préférence de langue. Nous n'utilisons pas de cookies publicitaires ni de
          traceurs tiers à des fins de marketing.
        </p>
      </section>

      <section className="legal-section">
        <h2>9. Sécurité</h2>
        <p>Les connexions sont chiffrées (HTTPS). L'accès aux données administratives est limité, tracé, et soumis à justification pour toute consultation sensible.</p>
      </section>

      <section className="legal-section">
        <h2>10. Modifications</h2>
        <p>Cette politique peut évoluer. Les changements importants te seront signalés par email ou via une notification sur le site.</p>
      </section>
    </>
  );
}

function PrivacyEN() {
  return (
    <>
      <h1>Privacy Policy</h1>

      <section className="legal-section">
        <h2>1. Who we are</h2>
        <p>
          BourseUp is a service operated individually by Serigne Habib Sy. For any question
          about your personal data, contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Data we collect</h2>
        <ul>
          <li><strong>Account</strong>: name, email, country, password (encrypted, never readable by us)</li>
          <li><strong>Usage</strong>: tracked scholarships, application status, checked documents</li>
          <li><strong>Generated letters</strong>: the information you provide to generate a letter (background, motivation, achievements) and the generated text</li>
          <li><strong>Payment</strong>: we do not store any banking or mobile money details. This information is processed directly by our payment provider (PayDunya). We only keep the amount, status, and a transaction reference</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>3. Why we use it</h2>
        <ul>
          <li>Operating your account and application tracker</li>
          <li>Generating your motivation letters via Anthropic's API (Claude)</li>
          <li>Sending deadline reminders and account-related emails (via Resend)</li>
          <li>Processing Pro plan payments (via PayDunya)</li>
          <li>Keeping the service secure and preventing abuse</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>4. Who your data is shared with</h2>
        <p>We do not sell any data. Some technical providers process data on our behalf, solely to operate the service:</p>
        <ul>
          <li><strong>Supabase</strong> — database hosting and authentication</li>
          <li><strong>Anthropic</strong> — generating motivation letters (content you submit is sent for processing, not retained by Anthropic beyond handling the request)</li>
          <li><strong>Resend</strong> — sending transactional emails and reminders</li>
          <li><strong>PayDunya</strong> — payment processing (Wave, Orange Money, cards)</li>
          <li><strong>Vercel</strong> — website hosting</li>
        </ul>
        <p>These providers may process data on servers located outside your country of residence.</p>
      </section>

      <section className="legal-section">
        <h2>5. Support team access to your account</h2>
        <p>
          When you need help, an administrator may view aggregated metadata about your account
          (plan, number of letters generated, last activity) — never the content of your letters
          by default. Viewing the content of a specific letter requires a written justification,
          and every action is recorded in a timestamped audit log that cannot be viewed or
          altered from within the application itself.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. How long we keep your data</h2>
        <p>
          For as long as your account is active. You can request deletion of your account and
          data at any time by writing to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          Some payment-related data may be kept longer where required by legal or accounting
          obligations.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Your rights</h2>
        <p>You can request access to, correction of, deletion of, or a copy of your data at any time by writing to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      </section>

      <section className="legal-section">
        <h2>8. Cookies and local storage</h2>
        <p>
          We use your browser's local storage to remember your login session and language
          preference. We do not use advertising cookies or third-party marketing trackers.
        </p>
      </section>

      <section className="legal-section">
        <h2>9. Security</h2>
        <p>Connections are encrypted (HTTPS). Access to administrative data is restricted, logged, and requires justification for any sensitive lookup.</p>
      </section>

      <section className="legal-section">
        <h2>10. Changes</h2>
        <p>This policy may evolve. Significant changes will be communicated by email or via a notice on the site.</p>
      </section>
    </>
  );
}
