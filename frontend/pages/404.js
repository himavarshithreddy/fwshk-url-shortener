import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="app-container">
      <Head>
        <title>404 - Page Not Found | brnk.in</title>
        <meta name="description" content="The page you're looking for doesn't exist or has been moved." />
      </Head>
      <main className="form-container" style={{ textAlign: 'center', padding: '60px 20px', minHeight: '60vh' }}>
        <h1 className="title" style={{ fontSize: '3rem', marginBottom: '20px' }}>Page Not Found</h1>
        <p className="subtitle" style={{ fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          The page you're looking for doesn't exist or has been moved. 
          If you followed a short link that doesn't work, it may have expired or been deleted.
          Here are some places to start instead:
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <Link href="/" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '15px 30px' }}>
            Go Home
          </Link>
          <Link href="/blog" className="track-links-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '15px 30px' }}>
            Read Our Blog
          </Link>
        </div>

        <div style={{ marginTop: '40px', padding: '20px', border: '3px solid #ff6600', backgroundColor: '#1a1a1a', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#ff6600' }}>Popular Links</h2>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link href="/track" style={{ color: '#FFFDF7', textDecoration: 'underline' }}>Track a Short Link</Link></li>
            <li><Link href="/about" style={{ color: '#FFFDF7', textDecoration: 'underline' }}>About brnk.in</Link></li>
            <li><Link href="/contact" style={{ color: '#FFFDF7', textDecoration: 'underline' }}>Contact Support</Link></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
