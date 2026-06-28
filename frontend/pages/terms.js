import Head from 'next/head';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - brnk.in</title>
        <meta name="description" content="Terms of Service for brnk.in URL shortener." />
      </Head>
      <div className="form-container" style={{ marginTop: '24px', maxWidth: '800px', lineHeight: '1.6' }}>
        <header style={{ marginBottom: '24px' }}>
          <h1 className="title">Terms of Service</h1>
          <p className="subtitle">Last Updated: October 2025</p>
        </header>

        <section style={{ marginBottom: '24px' }}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using brnk.in ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Service's particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>2. Description of Service</h2>
          <p>
            brnk.in is a free utility that allows users to shorten long URLs, generate QR codes, and track click analytics. We provide this service "as is" and do not require users to create an account to utilize our basic features. Users may optionally set custom slugs, expiration dates, and passwords for their shortened links.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>3. Permitted Use</h2>
          <p>
            You are permitted to use brnk.in for both personal and commercial purposes, provided your use complies with these Terms of Service. You may share your shortened links on social media, in emails, printed materials, and other communication channels.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>4. Prohibited Use</h2>
          <p>
            You agree not to use the Service to create short links that redirect to any of the following:
          </p>
          <ul>
            <li style={{ marginLeft: '20px' }}>Phishing, malware, viruses, or any other malicious software.</li>
            <li style={{ marginLeft: '20px' }}>Spam, unsolicited bulk email (UBE), or deceptive marketing schemes.</li>
            <li style={{ marginLeft: '20px' }}>Adult, explicit, or pornographic content.</li>
            <li style={{ marginLeft: '20px' }}>Content that promotes violence, hate speech, terrorism, or illegal acts.</li>
            <li style={{ marginLeft: '20px' }}>Content that infringes upon the copyrights, trademarks, or other intellectual property rights of any third party.</li>
            <li style={{ marginLeft: '20px' }}>Deceptive redirects (e.g., hiding the true destination to trick the user).</li>
          </ul>
          <p>
            We reserve the right to review, flag, and delete any shortened links that violate these terms without prior notice.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>5. Link Expiration and Deletion</h2>
          <p>
            brnk.in offers no guarantee regarding the permanence or uptime of any shortened link. We reserve the right to remove any link at any time, for any reason, particularly if it violates our prohibited use policy. Links may also expire if an expiration date was set during creation, or as part of routine database maintenance for inactive links.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>6. Intellectual Property</h2>
          <p>
            The brnk.in brand, logo, website design, and underlying technology are the exclusive property of the operator. You may not copy, reverse-engineer, or use our branding without explicit permission. Users retain all rights to the original URLs they submit to the service.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>7. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. We make no warranty that the service will meet your requirements, or that the service will be uninterrupted, timely, secure, or error-free.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>8. Limitation of Liability</h2>
          <p>
            brnk.in, its operators, and its affiliates shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses resulting from the use or the inability to use the service, or the destination content of any shortened links created by users.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>9. DMCA and Abuse Reporting</h2>
          <p>
            We take abuse and copyright infringement seriously. If you encounter a brnk.in link that points to malicious content or infringes upon your copyright, please report it immediately using our <a href="/report" style={{ color: '#ff6600', textDecoration: 'none' }}>Report Abuse</a> page. We comply with the Digital Millennium Copyright Act (DMCA) and will promptly remove infringing links.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Telangana, India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>12. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us via email at <a href="mailto:hello@brnk.in" style={{ color: '#ff6600', textDecoration: 'none' }}>hello@brnk.in</a> or through our <a href="/contact" style={{ color: '#ff6600', textDecoration: 'none' }}>Contact Page</a>.
          </p>
        </section>
      </div>
    </>
  );
}
