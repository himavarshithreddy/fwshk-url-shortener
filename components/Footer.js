import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer style={{
      width: '100%',
      padding: '40px 20px',
      borderTop: '3px solid #333',
      backgroundColor: '#111',
      marginTop: '60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '30px',
      color: '#e0e0e0'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', width: '100%', maxWidth: '1000px', paddingBottom: '30px', borderBottom: '1px solid #333' }}>
        
        <div>
          <h3 style={{ color: '#ff6600', marginBottom: '15px', fontSize: '1.2rem' }}>brnk.in</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#a8a8a8' }}>
            A premium, privacy-first URL shortener and QR code generator built for modern teams and creators.
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FFFDF7', textDecoration: 'none' }} aria-label="Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FFFDF7', textDecoration: 'none' }} aria-label="GitHub">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#FFFDF7', marginBottom: '15px' }}>Resources</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link href="/" className="footer-link">URL Shortener</Link></li>
            <li><Link href="/blog" className="footer-link">Blog & Guides</Link></li>
            <li><Link href="/track" className="footer-link">Link Analytics</Link></li>
            <li><Link href="/about" className="footer-link">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FFFDF7', marginBottom: '15px' }}>Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link href="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
            <li><Link href="/terms" className="footer-link">Terms of Service</Link></li>
            <li><Link href="/report" className="footer-link">Report Abuse (DMCA)</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FFFDF7', marginBottom: '15px' }}>Headquarters</h4>
          <address style={{ fontStyle: 'normal', color: '#a8a8a8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            brnk.in Technologies<br />
            Raidurg, Hyderabad, 500012<br />
            Telangana, India<br />
            <Link href="/contact" style={{ color: '#ff6600', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>Contact Support →</Link>
          </address>
        </div>

      </div>
      
      <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', width: '100%' }}>
        &copy; {new Date().getFullYear()} brnk.in &mdash; All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
