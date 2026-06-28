import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('brnk_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('brnk_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('brnk_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner" style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#1a1a1a',
      border: '4px solid #ff6600',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      zIndex: 9999,
      boxShadow: '8px 8px 0px #000'
    }}>
      <div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: '#ff6600' }}>We Value Your Privacy</h3>
        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: '#FFFDF7' }}>
          We use cookies and similar technologies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
          By clicking "Accept All", you consent to our use of cookies. Read our <Link href="/privacy-policy" style={{ color: '#ff6600', textDecoration: 'underline' }}>Privacy Policy</Link> for more information.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleAccept}
          style={{
            backgroundColor: '#ff6600',
            color: '#000',
            border: '2px solid #FFFDF7',
            padding: '10px 24px',
            fontWeight: 'bold',
            fontFamily: 'inherit',
            cursor: 'pointer',
            flex: '1',
            minWidth: '120px'
          }}
        >
          Accept All
        </button>
        <button 
          onClick={handleDecline}
          style={{
            backgroundColor: 'transparent',
            color: '#FFFDF7',
            border: '2px solid #ff6600',
            padding: '10px 24px',
            fontWeight: 'bold',
            fontFamily: 'inherit',
            cursor: 'pointer',
            flex: '1',
            minWidth: '120px'
          }}
        >
          Decline Optional
        </button>
      </div>
    </div>
  );
}
