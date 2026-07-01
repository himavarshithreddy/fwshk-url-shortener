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
    <div className="cookie-banner">
      <div className="cookie-content">
        <strong>We Value Your Privacy</strong>
        <p>
          We use cookies and similar technologies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
          By clicking "Accept All", you consent to our use of cookies. Read our <Link href="/privacy-policy">Privacy Policy</Link> for more information.
        </p>
      </div>
      <div className="cookie-buttons">
        <button onClick={handleAccept} className="cookie-btn cookie-btn-accept">
          Accept All
        </button>
        <button onClick={handleDecline} className="cookie-btn cookie-btn-decline">
          Decline Optional
        </button>
      </div>
    </div>
  );
}
