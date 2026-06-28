import '../styles/globals.css';
import '../styles/App.css';
import '../styles/AdModal.css';
import Layout from '../components/Layout';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CookieBanner from '../components/CookieBanner';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>brnk - Simple URL Shortener</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "brnk",
            "url": "https://brnk.in",
            "description": "Free URL shortener and QR code generator. No sign-up required.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://brnk.in/blog?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        `}} />
      </Head>
      <div className="font-sans">
        <style jsx global>{`
          :root {
            --font-space-grotesk: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-syne: 'Syne', sans-serif;
          }
          h1, h2, h3, .title, .logo {
            font-family: var(--font-syne), sans-serif !important;
          }
          body, p, input, button {
            font-family: var(--font-space-grotesk), sans-serif;
          }
        `}</style>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <CookieBanner />
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{
            backgroundColor: '#ff6600',
            color: '#000',
            borderRadius: '0px',
            border: '3px solid #FFFDF7',
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: '700',
            boxShadow: '4px 4px 0px #FFFDF7'
          }}
        />
      </div>
    </>
  );
}

export default MyApp;
