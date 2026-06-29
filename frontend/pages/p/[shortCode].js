import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PasswordProtectedPage() {
  const router = useRouter();
  const { shortCode } = router.query;

  const [error, setError] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [expiryCountdown, setExpiryCountdown] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [showWarning, setShowWarning] = useState(false);
  const [warningReason, setWarningReason] = useState(null);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://back.brnk.in').replace(/\/+$/, '');

  const doRedirect = useCallback(() => {
    window.location.replace(`${apiUrl}/${encodeURIComponent(shortCode)}`);
  }, [apiUrl, shortCode]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!shortCode || !/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
      setError('Invalid short code.');
      return;
    }

    // Use link-info endpoint to check trust score and get warning info
    fetch(`${apiUrl}/link-info/${encodeURIComponent(shortCode)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Link not found');
        return res.json();
      })
      .then((data) => {
        setExpiresAt(data.expiresAt || null);
        if (data.passwordProtected) {
          setPasswordRequired(true);
          return;
        }
        setDestinationUrl(data.originalUrl);
        if (data.showWarning) {
          setShowWarning(true);
          setWarningReason(data.warningReason);
        } else {
            // Not password protected and no warning? Just redirect immediately
            doRedirect();
        }
      })
      .catch(() => {
        setError('Link not found');
      });
  }, [router.isReady, shortCode, apiUrl, doRedirect]);

  useEffect(() => {
    if (!expiresAt) {
      setExpiryCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        setExpiryCountdown('Expired');
        return;
      }

      const hours = Math.floor(remaining / 3_600_000);
      const minutes = Math.floor((remaining % 3_600_000) / 60_000);
      const seconds = Math.floor((remaining % 60_000) / 1_000);
      setExpiryCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (destinationUrl && !showWarning && !passwordRequired) {
      doRedirect();
    }
    if (destinationUrl && showWarning && userConfirmed && !passwordRequired) {
      doRedirect();
    }
  }, [destinationUrl, showWarning, userConfirmed, passwordRequired, doRedirect]);

  // Countdown timer — purely cosmetic, does not affect the redirect
  useEffect(() => {
    if (!destinationUrl || showWarning || passwordRequired) return;
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [destinationUrl, showWarning, passwordRequired, countdown]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setPasswordError('Please enter the password.');
      return;
    }
    setIsVerifying(true);
    setPasswordError('');
    try {
      const res = await fetch(`${apiUrl}/verify-password/${encodeURIComponent(shortCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        window.location.replace(data.originalUrl);
      } else if (res.status === 410) {
        setError(data.error || 'Link has expired or reached its click limit.');
        setPasswordRequired(false);
      } else {
        setPasswordError(data.error || 'Incorrect password. Please try again.');
      }
    } catch {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (error) {
    return (
      <div style={{ marginTop: '80px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
        <Head>
          <title>Link Not Found | brnk URL Shortener</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="redirect-card" role="alert" style={{ width: '100%' }}>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div style={{ marginTop: '80px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
        <Head>
          <title>Password Required | brnk URL Shortener</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="redirect-card" style={{ width: '100%' }}>
          <p className="redirect-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg className="redirect-pw-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            This link is password protected
          </p>
          <form onSubmit={handlePasswordSubmit}>
            <label htmlFor="link-password" className="sr-only">Link password</label>
            <input
              id="link-password"
              type="password"
              className="input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              autoComplete="current-password"
            />
            {passwordError && (
              <p className="error-message" role="alert" style={{ marginTop: '10px' }}>{passwordError}</p>
            )}
            <button type="submit" className="submit-btn" disabled={isVerifying} style={{ marginTop: '10px', width: '100%' }}>
              {isVerifying ? 'Verifying…' : 'Unlock →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showWarning && !userConfirmed) {
    return (
      <div style={{ marginTop: '80px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
        <Head>
          <title>Warning | brnk URL Shortener</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="redirect-card" role="alert" style={{ width: '100%' }}>
          <p className="warning-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ff6600', fontWeight: 'bold' }}>
            <svg className="redirect-pw-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Warning
          </p>
          <p className="warning-message" style={{ margin: '15px 0' }}>
            {warningReason === 'low_trust_domain'
              ? 'This link points to a domain with a low trust score. It may be unsafe.'
              : 'This is a newly created link. Exercise caution before proceeding.'}
          </p>
          <div className="redirect-url-box" style={{ background: '#1a1a1a', padding: '10px', wordBreak: 'break-all', marginBottom: '15px' }}>
            <span className="redirect-url">{destinationUrl}</span>
          </div>
          {expiryCountdown && (
            <p className="redirect-expiry-info" style={{ marginBottom: '15px' }}>Link expires in: {expiryCountdown}</p>
          )}
          <div className="warning-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setUserConfirmed(true)}
              className="warning-btn-danger submit-btn"
              style={{ background: '#ff4444', color: '#fff', borderColor: '#fff' }}
            >
              Continue anyway
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="warning-btn-safe submit-btn"
            >
              Go back to safety
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '80px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Redirecting… | brnk URL Shortener</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="You are being redirected to your destination via brnk URL Shortener." />
      </Head>
      <div className="redirect-card" style={{ width: '100%' }}>
        <p className="redirect-label">Redirecting you to</p>
        <div className="redirect-url-box" style={{ background: '#1a1a1a', padding: '10px', wordBreak: 'break-all', margin: '15px 0' }}>
          <span className="redirect-url">{destinationUrl || '...'}</span>
        </div>
        {expiryCountdown && (
          <p className="redirect-expiry-info">Link expires in: {expiryCountdown}</p>
        )}
        <div className="redirect-timer" aria-live="polite" aria-atomic="true" style={{ fontSize: '24px', fontWeight: 'bold', margin: '15px 0' }}>{countdown}</div>
        <p className="redirect-hint">You will be redirected automatically</p>
      </div>
    </div>
  );
}
