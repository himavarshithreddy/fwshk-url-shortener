import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import './App.css';
import { Link } from 'react-router-dom';
import logo from './logo.svg';

const TICKER = 'FWSHK — PUTTING YOUR URL ON A DIET — HOLD TIGHT — TRIMMING THE FAT — ALMOST SKINNY — ';
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function FwshkLoader() {
  const scrambleRef = useRef(null);

  useEffect(() => {
    const el = scrambleRef.current;
    if (!el) return;
    const id = setInterval(() => {
      el.textContent = Array.from({ length: 6 }, () =>
        CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join('');
    }, 55);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fwshk-loader" role="status" aria-label="Shortening your URL">
      <div className="loader-ticker">
        <div className="loader-ticker-inner">
          <span className="loader-ticker-text">{TICKER}</span>
          <span className="loader-ticker-text" aria-hidden="true">{TICKER}</span>
        </div>
      </div>
      <div className="loader-machine-box">
        <div className="loader-url-in">
          <span className="loader-url-text">
            https://your-very-long-url.com/with/a/really/long/path?query=stuff&ref=somewhere
          </span>
        </div>
        <div className="loader-arrow-zone">→→→</div>
        <div className="loader-code-display">
          <span className="loader-slash">/</span>
          <span ref={scrambleRef} className="loader-scramble">??????</span>
        </div>
      </div>
      <div className="loader-bits-container" aria-hidden="true">
        <span className="lbit lbit-1">https://</span>
        <span className="lbit lbit-2">.com</span>
        <span className="lbit lbit-3">/path</span>
        <span className="lbit lbit-4">?q=</span>
        <span className="lbit lbit-5">www.</span>
        <span className="lbit lbit-6">#!</span>
      </div>
    </div>
  );
}

function Main() {
  const [url, setUrl] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [ttl, setTtl] = useState('');
  const [redirectType, setRedirectType] = useState('308');
  const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');
  const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;

  // Warm up the backend serverless function on page load so the first
  // URL-shortening request doesn't pay the cold-start penalty.
  useEffect(() => {
    fetch(`${apiUrl}/health`).catch(() => {});
  }, [apiUrl]);
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event) => {
    setUrl(event.target.value);
  };

  const handleCustomCodeChange = (event) => {
    
    const sanitizedValue = event.target.value.replace(/[^a-zA-Z0-9-]/g, '');
    setCustomCode(sanitizedValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!url) {
      setError('Please enter a URL.');
      return;
    }

    if (useCustomCode && !customCode) {
      setError('Please enter a custom shortcode.');
      return;
    }

    // Format URL if needed
    let formattedUrl = url.trim();
    
    // Check if the URL starts with http:// or https://
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // Validate URL format
    const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };
  
    if (!isValidUrl(formattedUrl)) {
      setError('Please enter a valid URL.');
      return;
    }
  
    try {
      setIsLoading(true);
      // Call the backend API with the formatted URL and optional custom code
      const response = await fetch(`${apiUrl}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          originalUrl: formattedUrl,
          ...(useCustomCode && { customShortCode: customCode }),
          ...(ttl && { ttl: parseInt(ttl, 10) }),
          redirectType,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const fullShortenedUrl = `${BASE_URL}/${data.shortCode}`;
        setShortenedUrl(fullShortenedUrl);
        setShortCode(data.shortCode);
        setExpiresAt(data.expiresAt || '');
        setError('');
      } else {
        setError(data.error || 'Failed to shorten URL.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
  };
  const copyShortCode = () => {
    navigator.clipboard.writeText(shortCode);
  };
  return (
    <div className="app-container">
      <Helmet>
        <title>Fwshk — Free URL Shortener | Custom Short Links &amp; Click Tracking</title>
        <meta name="description" content="Fwshk is a fast, free URL shortener. Create custom short links, set expiration dates, choose redirect types, and track clicks — all with zero sign-up required." />
        <meta name="keywords" content="URL shortener, link shortener, short URL, custom short link, shorten URL, free URL shortener, click tracking, link analytics, short link generator, URL redirect, tiny URL, branded links, link management, URL tracking" />
        <link rel="canonical" href="https://fwshk.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fwshk.vercel.app/" />
        <meta property="og:title" content="Fwshk — Free URL Shortener | Custom Short Links & Click Tracking" />
        <meta property="og:description" content="Shorten any URL in seconds. Create custom short links, set expiration dates, and track clicks — fast, free, and no sign-up required." />
        <meta property="og:site_name" content="Fwshk" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://fwshk.vercel.app/logo512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://fwshk.vercel.app/" />
        <meta name="twitter:title" content="Fwshk — Free URL Shortener | Custom Short Links & Click Tracking" />
        <meta name="twitter:description" content="Shorten any URL in seconds. Create custom short links, set expiration dates, and track clicks — fast, free, and no sign-up required." />
        <meta name="twitter:image" content="https://fwshk.vercel.app/logo512.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://fwshk.vercel.app/"
              }
            ]
          }
        `}</script>
      </Helmet>
      <nav aria-label="Site navigation">
        <Link to="/track" className="track-links-btn">
          Track your Link
        </Link>
      </nav>
      <main className="main-layout">
        {/* Left panel — branding + form */}
        <section className="left-panel" aria-label="URL shortener form">
          <header className="app-header">
            <img src={logo} alt="Fwshk logo" className="app-logo" />
            <h1 className="title">Fwshk</h1>
          </header>
          <p className="subtitle">URLs on diet.</p>
          <form onSubmit={handleSubmit} className="form" aria-label="Shorten a URL">
            <label htmlFor="url-input" className="sr-only">Enter URL to shorten</label>
            <input
              id="url-input"
              type="text"
              className="input"
              value={url}
              onChange={handleInputChange}
              placeholder="Enter URL (e.g., google.com)"
            />

            <fieldset className="shortcode-options">
              <legend className="sr-only">Short code options</legend>
              <div className="option-buttons">
                <button
                  type="button"
                  className={`option-btn ${!useCustomCode ? 'active' : ''}`}
                  onClick={() => setUseCustomCode(false)}
                  aria-pressed={!useCustomCode}
                >
                  Random Code
                </button>
                <button
                  type="button"
                  className={`option-btn ${useCustomCode ? 'active' : ''}`}
                  onClick={() => setUseCustomCode(true)}
                  aria-pressed={useCustomCode}
                >
                  Custom Code
                </button>
              </div>

              {useCustomCode && (
                <div className="custom-code-container">
                  <div className="custom-url-preview">
                    <span className="base-url">{BASE_URL}/</span>
                    <label htmlFor="custom-code-input" className="sr-only">Custom short code</label>
                    <input
                      id="custom-code-input"
                      type="text"
                      className="custom-code-input"
                      value={customCode}
                      onChange={handleCustomCodeChange}
                      placeholder="your-custom-code"
                      maxLength={20}
                    />
                  </div>
                  <p className="custom-code-hint">Use letters, numbers, and hyphens only (max 20 characters)</p>
                </div>
              )}
            </fieldset>

            <div className="selects-row">
              <div className="ttl-options">
                <label className="ttl-label" htmlFor="ttl-select">Expiration:</label>
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
                <label className="ttl-label" htmlFor="redirect-type-select">Redirect:</label>
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
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>

        {/* Right panel — result / loader */}
        <section className="right-panel" aria-label="Shortened URL result">
          {isLoading ? (
            <FwshkLoader />
          ) : shortenedUrl ? (
            <div className="result" aria-live="polite">
              <h2 className="shortened-text">Shortened URL:</h2>
              <div className="shortened-url-container">
                <a href={shortenedUrl} target="_blank" rel="noopener noreferrer" className="shortened-url">
                  {shortenedUrl}
                </a>
                <button onClick={copyToClipboard} className="copy-btn" aria-label="Copy shortened URL to clipboard">Copy</button>
                <button onClick={copyShortCode} className="copy-btn" aria-label="Copy short code to clipboard">Copy Code</button>
              </div>
              {expiresAt && (
                <p className="expiry-info">Expires: {new Date(expiresAt).toLocaleString()}</p>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">✂️</span>
              <p className="empty-state-text">Your shortened URL will appear here</p>
              <p className="empty-state-hint">Paste a long URL on the left and hit Shorten.</p>
            </div>
          )}
        </section>
      </main>

      <section className="seo-content" aria-label="About Fwshk URL Shortener">
        <h2 className="seo-content-heading">Why Choose Fwshk?</h2>
        <div className="seo-features">
          <div className="seo-feature">
            <h3>⚡ Instant Shortening</h3>
            <p>Paste any long URL and get a short, shareable link in seconds. No sign-up or account required.</p>
          </div>
          <div className="seo-feature">
            <h3>🎯 Custom Short Codes</h3>
            <p>Create branded short links with your own custom codes using letters, numbers, and hyphens.</p>
          </div>
          <div className="seo-feature">
            <h3>📊 Click Tracking</h3>
            <p>Monitor link performance with built-in click analytics. See exactly how many times your link was visited.</p>
          </div>
          <div className="seo-feature">
            <h3>⏳ Link Expiration</h3>
            <p>Set your links to expire after 1 hour, 1 day, 7 days, or 30 days — or keep them forever.</p>
          </div>
        </div>

        <h2 className="seo-content-heading">How It Works</h2>
        <ol className="seo-steps">
          <li><strong>Paste your URL</strong> — Enter any long URL into the input field above.</li>
          <li><strong>Customize</strong> — Choose a random or custom short code, set expiration, and pick a redirect type.</li>
          <li><strong>Share</strong> — Copy your shortened link and share it anywhere.</li>
          <li><strong>Track</strong> — Visit the <Link to="/track">tracking page</Link> to view click analytics for your links.</li>
        </ol>
      </section>

      <footer className="site-footer">
        <div className="footer-content">
          <p className="footer-brand">Fwshk — Free URL Shortener</p>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link to="/">Shorten a URL</Link>
            <Link to="/track">Track Your Link</Link>
          </nav>
          <p className="footer-description">A fast, free URL shortener with custom short codes, link expiration, and click tracking. No sign-up required.</p>
        </div>
      </footer>
    </div>
  );
}

export default Main;
