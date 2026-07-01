import Head from 'next/head';

export default function About() {
  return (
    <>
      <Head>
        <title>About Us - brnk.in</title>
        <meta name="description" content="Learn about brnk.in, the minimalist URL shortener and QR code generator." />
      </Head>
      <div className="form-container" style={{ marginTop: '24px', lineHeight: '1.6' }}>
        <header style={{ marginBottom: '24px' }}>
          <h1 className="title">About brnk.in</h1>
          <p className="subtitle">Putting your URLs on a diet.</p>
        </header>

        <section style={{ marginBottom: '24px' }}>
          <h2>Our Mission</h2>
          <p>
            The internet is full of long, unwieldy, and frankly ugly URLs. Whether you're trying to share a Google Doc with a colleague, post a link on social media, or print a flyer for an upcoming event, complex web addresses simply don't work. They break in emails, they take up too much space, and they are impossible to read aloud.
          </p>
          <p>
            That's why we built brnk.in. Our mission is simple: to make sharing links fast, easy, and elegant. We believe that a URL shortener shouldn't require you to jump through hoops, create a mandatory account, or navigate through a cluttered interface. We built a tool that gets straight to the point—paste your long URL, click shorten, and get a clean, manageable link instantly.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>What Makes brnk.in Different</h2>
          <p>
            While there are many URL shorteners out there, brnk.in was designed with a focus on speed, privacy, and functionality without the friction. Here is what sets us apart:
          </p>
          <ul>
            <li style={{ marginLeft: '20px', marginBottom: '10px' }}><strong>No Account Required:</strong> We respect your time and privacy. You can start shortening links and generating QR codes immediately without ever handing over your email address or setting up an account.</li>
            <li style={{ marginLeft: '20px', marginBottom: '10px' }}><strong>Instant QR Codes:</strong> Every time you shorten a link, a beautiful, branded QR code is generated automatically. No need to use a separate app or tool.</li>
            <li style={{ marginLeft: '20px', marginBottom: '10px' }}><strong>Expiry Control:</strong> You have the power to decide how long your links live. Set links to expire after an hour, a day, a week, or a month, ensuring that temporary content doesn't linger forever.</li>
            <li style={{ marginLeft: '20px', marginBottom: '10px' }}><strong>Redirect Type Control:</strong> Advanced users can choose between standard 302 temporary redirects, or 308 permanent redirects, giving you full control over your SEO impact.</li>
            <li style={{ marginLeft: '20px', marginBottom: '10px' }}><strong>Built-in Click Analytics:</strong> Simply visit our track page to see real-time click counts and metrics for any link you've created.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>Who Uses brnk.in</h2>
          <p>
            Our minimalist platform is designed for anyone who needs to share information efficiently. We proudly serve:
          </p>
          <ul>
            <li style={{ marginLeft: '20px' }}><strong>Digital Marketers:</strong> Tracking campaign performance and creating branded links for social media.</li>
            <li style={{ marginLeft: '20px' }}><strong>Developers:</strong> Testing API endpoints and managing temporary redirects.</li>
            <li style={{ marginLeft: '20px' }}><strong>Content Creators:</strong> Sharing resources in YouTube descriptions and Instagram bios.</li>
            <li style={{ marginLeft: '20px' }}><strong>Small Business Owners:</strong> Printing QR codes for physical menus, storefronts, and business cards.</li>
            <li style={{ marginLeft: '20px' }}><strong>Students & Educators:</strong> Sharing class materials and research links cleanly.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>Our Commitment to Safety</h2>
          <p>
            We know that URL shorteners can unfortunately be abused by malicious actors to hide spam and phishing links. We take the safety of our users and the broader internet community extremely seriously. 
          </p>
          <p>
            brnk.in employs automated monitoring and integrates with security APIs to prevent the shortening of known malicious URLs. Furthermore, we maintain a strict zero-tolerance policy for abuse. Our dedicated DMCA and abuse reporting mechanisms ensure that any flagged content is reviewed and swiftly removed. We do not allow our platform to be a safe haven for deceptive practices.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>The Technology</h2>
          <p>
            Built on a modern serverless architecture, brnk.in is designed for speed. By utilizing globally distributed edge networks, we ensure that when someone clicks your shortened link in Tokyo, New York, or London, the redirect happens in milliseconds. Our frontend is powered by Next.js and React, delivering a seamless, single-page application experience.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>Meet the Team</h2>
          <div className="about-team-box">
            <img src="/logo192.png" alt="brnk Team Logo" style={{ width: '80px', height: '80px' }} />

            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#ff6600' }}>The brnk Developers</h3>
              <p style={{ margin: '0', fontSize: '0.95rem' }}>We are a small, passionate group of web developers and digital marketers dedicated to building fast, privacy-first tools for the modern web. We were tired of clunky, ad-infested URL shorteners, so we built the tool we wanted to use ourselves.</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>Company Details</h2>
          <p>
            Transparency is important to us. brnk.in is operated as a registered digital property. 
          </p>
          <address style={{ fontStyle: 'normal', backgroundColor: '#111', padding: '16px', borderLeft: '4px solid #ff6600', marginTop: '12px' }}>
            <strong>brnk.in Technologies</strong><br />
            Raidurg, Hyderabad, 500012<br />
            Telangana, India
          </address>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2>Get In Touch</h2>
          <p>
            Have feedback, a feature request, or just want to say hi? We'd love to hear from you. Visit our <a href="/contact" style={{ color: '#ff6600', textDecoration: 'none' }}>Contact Page</a> or send an email directly to <a href="mailto:hello@brnk.in" style={{ color: '#ff6600', textDecoration: 'none' }}>hello@brnk.in</a>.
          </p>
        </section>
      </div>
    </>
  );
}
