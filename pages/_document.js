import { Html, Head, Main, NextScript } from "next/document";

// Évite le flash de la mauvaise langue : la page reste masquée (fond marine)
// jusqu'à ce que React ait appliqué la langue enregistrée.
const LANG_PENDING = `try{if(localStorage.getItem('bu_lang')!=='fr'){document.documentElement.setAttribute('data-lang-pending','1');setTimeout(function(){document.documentElement.removeAttribute('data-lang-pending')},2500)}}catch(e){}`;

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#1B3A4B" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=Noto+Sans+Thai:wght@400;500;600&family=Noto+Serif+Thai:wght@500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: LANG_PENDING }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
