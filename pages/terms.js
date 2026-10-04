import { useState } from "react";
import { useI18n } from "../lib/i18n";
import { CONTACT_EMAIL } from "../lib/contact";
import LegalLangToggle from "../components/LegalLangToggle";

export default function Terms() {
  const { t, locale } = useI18n();
  const [lang, setLang] = useState(locale === "en" ? "en" : "fr");

  return (
    <div className="container legal-page">
      <LegalLangToggle lang={lang} setLang={setLang} t={t} />
      <p className="legal-updated">{lang === "fr" ? "Dernière mise à jour" : "Last updated"} : {new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long" })}</p>
      <p className="legal-disclaimer">{t("legal.notLegalAdvice")}</p>

      {lang === "fr" ? <TermsFR /> : <TermsEN />}
    </div>
  );
}

function TermsFR() {
  return (
    <>
      <h1>Conditions d'utilisation</h1>

      <section className="legal-section">
        <h2>1. Acceptation</h2>
        <p>En créant un compte sur BourseUp, tu acceptes les présentes conditions. Si tu n'es pas d'accord, n'utilise pas le service.</p>
      </section>

      <section className="legal-section">
        <h2>2. Description du service</h2>
        <p>
          BourseUp propose une base de bourses d'études, un générateur de lettres de motivation
          assisté par IA, un outil de suivi de candidatures, et un service optionnel
          d'accompagnement personnalisé payant. Le service est fourni "en l'état", sans garantie
          de résultat.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Contenu généré par IA</h2>
        <p>
          Les lettres générées sont produites par un modèle d'intelligence artificielle à partir
          des informations que tu fournis. <strong>Nous ne garantissons ni l'exactitude, ni
          l'adéquation, ni le succès d'une candidature utilisant ce contenu.</strong> Tu es seul
          responsable de relire, corriger et adapter toute lettre avant de l'envoyer à un
          organisme de bourse. BourseUp n'est affilié à aucun organisme de bourse mentionné sur
          la plateforme.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. Ton compte</h2>
        <p>Tu es responsable de la confidentialité de ton mot de passe et de toute activité effectuée depuis ton compte. Les informations que tu fournis doivent être exactes.</p>
      </section>

      <section className="legal-section">
        <h2>5. Abonnement Pro et paiements</h2>
        <p>
          Le plan gratuit inclut un nombre limité de générations par mois. Le plan Pro, payant,
          est facturé via notre prestataire PayDunya (Wave, Orange Money, Visa, Mastercard). Une
          génération de lettre déjà effectuée n'est pas remboursable. Si un paiement est débité
          sans que le service correspondant ait été fourni, contacte-nous à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> pour un remboursement.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Accompagnement personnalisé</h2>
        <p>
          Le service d'accompagnement personnalisé proposé depuis ton tableau de suivi est
          distinct de l'abonnement Pro, convenu séparément par email ou WhatsApp, et n'est pas
          couvert par ces conditions générales.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Utilisation acceptable</h2>
        <p>Tu t'engages à ne pas : utiliser le service à des fins illégales, tenter de contourner les quotas ou la sécurité du service, ou revendre l'accès à ton compte.</p>
      </section>

      <section className="legal-section">
        <h2>8. Propriété intellectuelle</h2>
        <p>Le contenu que tu fournis et les lettres générées à partir de celui-ci t'appartiennent. La marque, le design et le code de BourseUp restent la propriété de son éditeur.</p>
      </section>

      <section className="legal-section">
        <h2>9. Limitation de responsabilité</h2>
        <p>
          BourseUp ne peut être tenu responsable des décisions prises par des organismes de
          bourses tiers, ni des conséquences d'une candidature basée sur un contenu généré par
          IA. Le service est fourni sans garantie de disponibilité continue.
        </p>
      </section>

      <section className="legal-section">
        <h2>10. Résiliation</h2>
        <p>Nous pouvons suspendre ou supprimer un compte en cas de violation de ces conditions. Tu peux supprimer ton compte à tout moment en nous contactant.</p>
      </section>

      <section className="legal-section">
        <h2>11. Modifications</h2>
        <p>Ces conditions peuvent être mises à jour. La poursuite de l'utilisation du service après une modification vaut acceptation des nouvelles conditions.</p>
      </section>

      <section className="legal-section">
        <h2>12. Contact</h2>
        <p>Pour toute question : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </section>
    </>
  );
}

function TermsEN() {
  return (
    <>
      <h1>Terms of Use</h1>

      <section className="legal-section">
        <h2>1. Acceptance</h2>
        <p>By creating an account on BourseUp, you accept these terms. If you disagree, do not use the service.</p>
      </section>

      <section className="legal-section">
        <h2>2. Description of the service</h2>
        <p>
          BourseUp provides a scholarship database, an AI-assisted motivation letter generator,
          an application tracker, and an optional paid personalized coaching service. The
          service is provided "as is", with no guarantee of outcome.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. AI-generated content</h2>
        <p>
          Generated letters are produced by an AI model based on the information you provide.{" "}
          <strong>We do not guarantee the accuracy, suitability, or success of any application
          using this content.</strong> You are solely responsible for reviewing, correcting, and
          adapting any letter before submitting it to a scholarship provider. BourseUp is not
          affiliated with any scholarship provider listed on the platform.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. Your account</h2>
        <p>You are responsible for keeping your password confidential and for any activity performed from your account. Information you provide must be accurate.</p>
      </section>

      <section className="legal-section">
        <h2>5. Pro subscription and payments</h2>
        <p>
          The free plan includes a limited number of generations per month. The paid Pro plan is
          billed through our provider PayDunya (Wave, Orange Money, Visa, Mastercard). A letter
          generation already delivered is non-refundable. If you are charged without receiving
          the corresponding service, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for a refund.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Personalized coaching</h2>
        <p>
          The personalized coaching service offered from your tracker is separate from the Pro
          subscription, arranged individually by email or WhatsApp, and is not covered by these
          terms.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Acceptable use</h2>
        <p>You agree not to: use the service for unlawful purposes, attempt to bypass usage quotas or security, or resell access to your account.</p>
      </section>

      <section className="legal-section">
        <h2>8. Intellectual property</h2>
        <p>The content you submit and the letters generated from it belong to you. BourseUp's brand, design, and code remain the property of its operator.</p>
      </section>

      <section className="legal-section">
        <h2>9. Limitation of liability</h2>
        <p>
          BourseUp cannot be held responsible for decisions made by third-party scholarship
          providers, or for the outcome of an application based on AI-generated content. The
          service is provided without guarantee of continuous availability.
        </p>
      </section>

      <section className="legal-section">
        <h2>10. Termination</h2>
        <p>We may suspend or delete an account that violates these terms. You may delete your account at any time by contacting us.</p>
      </section>

      <section className="legal-section">
        <h2>11. Changes</h2>
        <p>These terms may be updated. Continuing to use the service after a change constitutes acceptance of the new terms.</p>
      </section>

      <section className="legal-section">
        <h2>12. Contact</h2>
        <p>For any question: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </section>
    </>
  );
}
