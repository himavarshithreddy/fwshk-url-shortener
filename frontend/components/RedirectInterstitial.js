import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';

const VALID_SHORT_CODE_RE = /^[a-zA-Z0-9_-]+$/;

export default function RedirectInterstitial({ shortCode }) {
  const [error, setError] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [redirectTarget, setRedirectTarget] = useState('');
  const [useBackendRedirect, setUseBackendRedirect] = useState(true);
  const [expiresAt, setExpiresAt] = useState(null);
  const [expiryCountdown, setExpiryCountdown] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [showWarning, setShowWarning] = useState(false);
  const [warningReason, setWarningReason] = useState(null);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = (process.env.NEXT_PUBLIC_CLIENT_API_URL || '/api').replace(/\/+$/, '');

  const backendRedirectUrl = useCallback(() => (
    `${apiUrl}/${encodeURIComponent(shortCode)}`
  ), [apiUrl, shortCode]);

  useEffect(() => {
    if (!shortCode) return;
    setError('');
    setDestinationUrl('');
    setRedirectTarget('');
    setUseBackendRedirect(true);
    setExpiresAt(null);
    setExpiryCountdown(null);
    setCountdown(3);
    setShowWarning(false);
    setWarningReason(null);
    setUserConfirmed(false);
    setPasswordRequired(false);
    setPassword('');
    setPasswordError('');
    if (!VALID_SHORT_CODE_RE.test(shortCode)) {
      setError('Invalid short code.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    fetch(`${apiUrl}/link-info/${encodeURIComponent(shortCode)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = res.status === 410
            ? (data.error || 'This link has expired or reached its click limit.')
            : (data.error || 'Link not found.');
          throw new Error(message);
        }
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setExpiresAt(data.expiresAt || null);
        if (data.passwordProtected) {
          setPasswordRequired(true);
          setDestinationUrl('');
          return;
        }
        setDestinationUrl(data.originalUrl);
        setRedirectTarget(backendRedirectUrl());
        setUseBackendRedirect(true);
        setShowWarning(!!data.showWarning);
        setWarningReason(data.warningReason || null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Link not found.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [apiUrl, backendRedirectUrl, shortCode]);

  useEffect(() => {
    if (!expiresAt) {
      setExpiryCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        setExpiryCountdown('Expired');
        setError('This link has expired.');
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

  const shouldCountdown = !!redirectTarget && !passwordRequired && (!showWarning || userConfirmed) && !error;

  useEffect(() => {
    if (!shouldCountdown) return;
    if (countdown <= 0) {
      window.location.replace(useBackendRedirect ? backendRedirectUrl() : redirectTarget);
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [backendRedirectUrl, countdown, redirectTarget, shouldCountdown, useBackendRedirect]);

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
        setDestinationUrl(data.originalUrl);
        setRedirectTarget(data.originalUrl);
        setUseBackendRedirect(false);
        setShowWarning(!!data.showWarning);
        setWarningReason(data.warningReason || null);
        setUserConfirmed(false);
        setPasswordRequired(false);
        setCountdown(3);
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

  const shell = (children) => (
    <div className="redirect-page-shell">
      {children}
    </div>
  );

  if (isLoading) {
    return shell(
      <>
        <Head>
          <title>Checking Link | brnk URL Shortener</title>
          <meta key="robots" name="robots" content="noindex, nofollow" />
        </Head>
        <div className="redirect-card" role="status">
          <p className="redirect-label">Checking your link</p>
          <div className="redirect-timer" aria-hidden="true">...</div>
          <p className="redirect-hint">Hold tight</p>
        </div>
      </>
    );
  }

  if (error) {
    return shell(
      <>
        <Head>
          <title>Link Unavailable | brnk URL Shortener</title>
          <meta key="robots" name="robots" content="noindex, nofollow" />
        </Head>
        <div className="redirect-card" role="alert">
          <p className="redirect-label">Link unavailable</p>
          <p className="error-message">{error}</p>
        </div>
      </>
    );
  }

  if (passwordRequired) {
    return shell(
      <>
        <Head>
          <title>Password Required | brnk URL Shortener</title>
          <meta key="robots" name="robots" content="noindex, nofollow" />
        </Head>
        <div className="redirect-card">
          <p className="redirect-label">
            <svg className="redirect-pw-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            This link is password protected
          </p>
          {expiryCountdown && (
            <p className="redirect-expiry-info">Link expires in: {expiryCountdown}</p>
          )}
          <form onSubmit={handlePasswordSubmit}>
            <label htmlFor="link-password" className="sr-only">Link password</label>
            <input
              id="link-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              autoComplete="current-password"
            />
            {passwordError && (
              <p className="error-message" role="alert">{passwordError}</p>
            )}
            <button type="submit" className="submit-btn" disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Unlock'}
            </button>
          </form>
        </div>
      </>
    );
  }

  if (showWarning && !userConfirmed) {
    return shell(
      <>
        <Head>
          <title>Warning | brnk URL Shortener</title>
          <meta key="robots" name="robots" content="noindex, nofollow" />
        </Head>
        <div className="redirect-card" role="alert">
          <p className="warning-label">
            <svg className="redirect-pw-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Warning
          </p>
          <p className="warning-message">
            {warningReason === 'low_trust_domain'
              ? 'This link points to a domain with a low trust score. It may be unsafe.'
              : 'Exercise caution before proceeding.'}
          </p>
          <div className="redirect-url-box">
            <span className="redirect-url">{destinationUrl}</span>
          </div>
          {expiryCountdown && (
            <p className="redirect-expiry-info">Link expires in: {expiryCountdown}</p>
          )}
          <div className="warning-actions">
            <button onClick={() => { setCountdown(3); setUserConfirmed(true); }} className="warning-btn-danger">
              Continue anyway
            </button>
            <button onClick={() => { window.location.href = '/'; }} className="warning-btn-safe">
              Go back to safety
            </button>
          </div>
        </div>
      </>
    );
  }

  return shell(
    <>
      <Head>
        <title>Redirecting... | brnk URL Shortener</title>
        <meta key="robots" name="robots" content="noindex, nofollow" />
        <meta name="description" content="You are being redirected to your destination via brnk URL Shortener." />
      </Head>
      <div className="redirect-card">
        <p className="redirect-label">Redirecting you to</p>
        <div className="redirect-url-box">
          <span className="redirect-url">{destinationUrl || '...'}</span>
        </div>
        {expiryCountdown && (
          <p className="redirect-expiry-info">Link expires in: {expiryCountdown}</p>
        )}
        <div className="redirect-timer" aria-live="polite" aria-atomic="true">{countdown}</div>
        <p className="redirect-hint">You will be redirected automatically</p>
      </div>
    </>
  );
}
