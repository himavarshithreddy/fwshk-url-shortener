import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" dir="ltr" prefix="og: https://ogp.me/ns#">
      <Head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0TQ8RG4JWW"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() {
                dataLayer.push(arguments);
              }
              gtag('js', new Date());
              gtag('config', 'G-0TQ8RG4JWW');
            `,
          }}
        />
        
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9965145907448266" crossOrigin="anonymous"></script>
        <meta name="google-adsense-account" content="ca-pub-9965145907448266" />

        <meta charSet="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ff6600" />
        <meta name="color-scheme" content="dark" />

        <meta name="author" content="brnk" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="referrer" content="origin-when-cross-origin" />
        
        <meta property="og:site_name" content="brnk" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://brnk.in/logo512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content="brnk URL Shortener logo" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://brnk.in/logo512.png" />
        <meta name="twitter:image:alt" content="brnk URL Shortener logo" />

        <meta name="application-name" content="brnk" />
        <meta name="apple-mobile-web-app-title" content="brnk" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
