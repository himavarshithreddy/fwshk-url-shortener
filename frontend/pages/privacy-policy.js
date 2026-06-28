import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - brnk.in</title>
        <meta name="description" content="Privacy Policy for brnk.in URL shortener." />
      </Head>
      <div className="form-container" style={{ marginTop: '24px', maxWidth: '800px', lineHeight: '1.6' }}>
        <header style={{ marginBottom: '24px' }}>
          <h1 className="title">Privacy Policy</h1>
          <p className="subtitle">Last Updated: October 2025</p>
        </header>

        <section style={{ marginBottom: '24px' }}>
          <h2>1. Introduction</h2>
          <p>
            Welcome to brnk.in ("we", "our", "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website brnk.in and use our URL shortening, QR code generation, and link tracking services.
          </p>
          <p>
            By using our service, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access the site. We designed brnk.in to be minimal and privacy-friendly, meaning we do not require user accounts and we collect only the necessary data required to make the service function efficiently and securely.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>2. Information We Collect</h2>
          <p>
            When you use brnk.in, we collect certain information automatically. The data we collect depends on how you interact with our service:
          </p>
          <p>
            <strong>Shortened Links & QR Codes:</strong> When you shorten a URL or generate a QR code, we store the original destination URL, the generated short code (or custom slug), the creation timestamp, and the expiration date if one is provided. This data is essential for our service to redirect users properly.
          </p>
          <p>
            <strong>Click Analytics:</strong> When a user clicks on a brnk.in shortened link, we collect telemetry data to provide click analytics. This includes the timestamp of the click, the referer URL (where the click came from), the user agent (browser and device type), and the country/region derived from the IP address. We do not store full IP addresses permanently for analytics; they are anonymized or hashed to protect user identity.
          </p>
          <p>
            <strong>Security & Abuse Prevention Logs:</strong> To prevent abuse, spam, and malware distribution, our firewall (Cloudflare) and server logs temporarily capture IP addresses of users creating links or accessing the site. These raw logs are routinely purged and are only reviewed if suspicious activity or a Terms of Service violation is detected.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>3. How We Use Your Information</h2>
          <p>
            We use the information we collect primarily to deliver, maintain, and improve our services. Specifically, we use the data to:
          </p>
          <ul>
            <li style={{ marginLeft: '20px' }}>Provide the core functionality of URL redirection and QR code generation.</li>
            <li style={{ marginLeft: '20px' }}>Display aggregated click statistics to the creator of the short link.</li>
            <li style={{ marginLeft: '20px' }}>Monitor for and prevent abusive, illegal, or spammy activities on our network.</li>
            <li style={{ marginLeft: '20px' }}>Analyze traffic patterns to optimize server performance and improve user experience.</li>
            <li style={{ marginLeft: '20px' }}>Respond to your customer service inquiries, abuse reports, or DMCA requests.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>4. Cookies and Tracking Technologies</h2>
          <p>
            We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. 
          </p>
          <p>
            <strong>Service Cookies:</strong> We use essential cookies to manage your session and preferences (such as remembering your recent links or UI state). These do not track you across other websites.
          </p>
          <p>
            <strong>Google AdSense:</strong> We use Google AdSense to serve advertisements to help fund our free service. Google, as a third-party vendor, uses cookies (such as the DoubleClick cookie) to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising by visiting Google's <a href="https://myadcenter.google.com/" target="_blank" rel="noreferrer" style={{ color: '#ff6600' }}>Ads Settings</a>.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>5. Third-Party Services</h2>
          <p>
            We may share your data with trusted third-party vendors, service providers, and hosting partners who assist us in operating our website, conducting our business, or servicing you. These include:
          </p>
          <ul>
            <li style={{ marginLeft: '20px' }}><strong>Hosting & CDN:</strong> Vercel and Cloudflare, which process traffic to keep the site fast and secure.</li>
            <li style={{ marginLeft: '20px' }}><strong>Analytics:</strong> Vercel Analytics, which helps us understand how visitors interact with our homepage (independent of link click analytics).</li>
            <li style={{ marginLeft: '20px' }}><strong>Advertising:</strong> Google AdSense (as detailed in the Cookies section).</li>
          </ul>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties for marketing purposes.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>6. Data Retention</h2>
          <p>
            We retain the data related to your shortened URLs for as long as the link remains active and compliant with our Terms of Service. If a link is flagged for abuse, it may be permanently deleted, along with its associated analytics data. Raw server logs containing IP addresses are typically kept for no longer than 30 days.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>7. User Rights</h2>
          <p>
            If you have created a short link that you wish to have removed, you can use the "Delete URL" functionality provided at the time of creation (if you saved the deletion password). If you lost the password but need a link removed for legal or privacy reasons, you may contact us. While we do not have user accounts, we will honor reasonable requests to delete data if ownership can be verified.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>8. Children's Privacy</h2>
          <p>
            Our service is not directed to, and we do not knowingly collect personal information from, children under the age of 13. If you become aware that a child has provided us with personal information, please contact us so we can delete such information from our servers.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time in order to reflect changes to our practices or for other operational, legal, or regulatory reasons. The updated version will be indicated by an updated "Last Updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>10. Contact Information</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:hello@brnk.in" style={{ color: '#ff6600', textDecoration: 'none' }}>hello@brnk.in</a>
          </p>
          <p>
            You may also reach out via our <a href="/contact" style={{ color: '#ff6600', textDecoration: 'none' }}>Contact Page</a>.
          </p>
        </section>
      </div>
    </>
  );
}
