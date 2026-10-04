import Head from "next/head";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LanguageGate from "../components/LanguageGate";
import { I18nProvider, useI18n } from "../lib/i18n";

function Shell({ Component, pageProps }) {
  const { needsChoice } = useI18n();
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
      {needsChoice && <LanguageGate />}
    </>
  );
}

export default function App(props) {
  return (
    <I18nProvider>
      <Shell {...props} />
    </I18nProvider>
  );
}
