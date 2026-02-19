'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

export default function Home() {
  const [url, setUrl] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [ttl, setTtl] = useState('');
  const [redirectType, setRedirectType] = useState('308');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCustomCodeChange = (event) => {
    setCustomCode(event.target.value.replace(/[^a-zA-Z0-9-]/g, ''));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!url) {
      setError('Please enter a URL.');
      toast.error('Please enter a URL.');
      return;
    }

    if (useCustomCode && !customCode) {
      setError('Please enter a custom shortcode.');
      toast.error('Custom shortcode is required when custom option is selected.');
      return;
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError('Please enter a valid URL.');
      toast.error('Invalid URL! Please enter a valid URL.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: formattedUrl,
          ...(useCustomCode && { customShortCode: customCode }),
          ...(ttl && { ttl: parseInt(ttl, 10) }),
          redirectType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const base = window.location.origin;
        setShortenedUrl(`${base}/${data.shortCode}`);
        setShortCode(data.shortCode);
        setExpiresAt(data.expiresAt || '');
        setError('');
        toast.success('URL shortened successfully!');
      } else {
        setError(data.error || 'Failed to shorten URL.');
        toast.error(data.error || 'Failed to shorten URL.');
      }
    } catch {
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl).then(() => {
      toast.success('URL copied to clipboard!');
    });
  };

  const copyShortCode = () => {
    navigator.clipboard
      .writeText(shortCode)
      .then(() => toast.success('Short code copied to clipboard!'))
      .catch(() => toast.error('Failed to copy short code.'));
  };

  return (
    <div className="app-container">
      <button onClick={() => router.push('/track')} className="track-links-btn">
        Track your Link
      </button>
      <div className="main-layout">
        <div className="left-panel">
          <div className="app-header">
            <Image src="/logo.svg" alt="Fwshk logo" width={44} height={44} className="app-logo" />
            <h1 className="title">Fwshk</h1>
          </div>
          <p className="subtitle">URLs on diet.</p>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL (e.g., google.com)"
            />

            <div className="shortcode-options">
              <div className="option-buttons">
                <button
                  type="button"
                  className={`option-btn ${!useCustomCode ? 'active' : ''}`}
                  onClick={() => setUseCustomCode(false)}
                >
                  Random Code
                </button>
                <button
                  type="button"
                  className={`option-btn ${useCustomCode ? 'active' : ''}`}
                  onClick={() => setUseCustomCode(true)}
                >
                  Custom Code
                </button>
              </div>

              {useCustomCode && (
                <div className="custom-code-container">
                  <div className="custom-url-preview">
                    <span className="base-url">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/
                    </span>
                    <input
                      type="text"
                      className="custom-code-input"
                      value={customCode}
                      onChange={handleCustomCodeChange}
                      placeholder="your-custom-code"
                      maxLength={20}
                    />
                  </div>
                  <p className="custom-code-hint">
                    Use letters, numbers, and hyphens only (max 20 characters)
                  </p>
                </div>
              )}
            </div>

            <div className="selects-row">
              <div className="ttl-options">
                <label className="ttl-label" htmlFor="ttl-select">
                  Expiration:
                </label>
                <select
                  id="ttl-select"
                  className="ttl-select"
                  value={ttl}
                  onChange={(e) => setTtl(e.target.value)}
                >
                  <option value="">Never</option>
                  <option value="3600">1 Hour</option>
                  <option value="86400">1 Day</option>
                  <option value="604800">7 Days</option>
                  <option value="2592000">30 Days</option>
                </select>
              </div>

              <div className="ttl-options">
                <label className="ttl-label" htmlFor="redirect-type-select">
                  Redirect:
                </label>
                <select
                  id="redirect-type-select"
                  className="ttl-select"
                  value={redirectType}
                  onChange={(e) => setRedirectType(e.target.value)}
                >
                  <option value="308">Permanent (308)</option>
                  <option value="302">Track Clicks (302)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Shortening...' : 'Shorten'}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="right-panel">
          {shortenedUrl ? (
            <div className="result">
              <p className="shortened-text">Shortened URL:</p>
              <div className="shortened-url-container">
                <a
                  href={shortenedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shortened-url"
                >
                  {shortenedUrl}
                </a>
                <button onClick={copyToClipboard} className="copy-btn">
                  Copy
                </button>
                <button onClick={copyShortCode} className="copy-btn">
                  Copy Code
                </button>
              </div>
              {expiresAt && (
                <p className="expiry-info">
                  Expires:{' '}
                  {(() => {
                    try {
                      return new Date(expiresAt).toLocaleString();
                    } catch {
                      return expiresAt;
                    }
                  })()}
                </p>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">✂️</span>
              <p className="empty-state-text">Your shortened URL will appear here</p>
              <p className="empty-state-hint">Paste a long URL on the left and hit Shorten.</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}
