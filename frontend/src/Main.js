import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import logo from './logo.svg';

const SCRAMBLE_CHARS = '!@#$%<>?/|[]{}0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOADING_WORDS = ['COMPRESSING', 'SQUASHING', 'OBLITERATING', 'MINIFYING', 'CRUNCHING', 'DECIMATING'];
const SCRAMBLE_INTERVAL_MS = 55;
const TICKS_PER_WORD = 22;

function Main() {
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
  const [scrambleText, setScrambleText] = useState(LOADING_WORDS[0]);
  const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');
  const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;
  const navigate = useNavigate();

  // Warm up the backend serverless function on page load so the first
  // URL-shortening request doesn't pay the cold-start penalty.
  useEffect(() => {
    fetch(`${apiUrl}/health`).catch(() => {});
  }, [apiUrl]);

  // Scramble text animation during loading
  useEffect(() => {
    if (!isLoading) {
      setScrambleText(LOADING_WORDS[0]);
      return;
    }
    let wordIndex = 0;
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      const target = LOADING_WORDS[wordIndex % LOADING_WORDS.length];
      const revealed = Math.min(Math.floor((tick / TICKS_PER_WORD) * target.length), target.length);
      const text = target
        .split('')
        .map((char, i) =>
          i < revealed ? char : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        )
        .join('');
      setScrambleText(text);
      if (tick >= TICKS_PER_WORD + 6) {
        wordIndex++;
        tick = 0;
      }
    }, SCRAMBLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isLoading]);

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
  const navigateToTrackLinks = () => {
    navigate('/track'); // Navigate to the /track route
  };
  return (
    <div className="app-container">
      <button onClick={navigateToTrackLinks} className="track-links-btn">
        Track your Link
      </button>
      <div className="main-layout">
        {/* Left panel — branding + form */}
        <div className="left-panel">
          <div className="app-header">
            <img src={logo} alt="Fwshk logo" className="app-logo" />
            <h1 className="title">Fwshk</h1>
          </div>
          <p className="subtitle">URLs on diet.</p>
          {isLoading ? (
            <div className="shorten-inline-loader" role="status" aria-label="Shortening your URL">
              <div className="overlay-scissors" aria-hidden="true">✂️</div>
              <div className="overlay-main-text">
                <span className="glitch-layer glitch-layer-1" aria-hidden="true">{scrambleText}</span>
                <span className="glitch-layer glitch-layer-2" aria-hidden="true">{scrambleText}</span>
                {scrambleText}
              </div>
              <div className="overlay-bars">
                <div className="overlay-bar"></div>
                <div className="overlay-bar"></div>
                <div className="overlay-bar"></div>
              </div>
              <div className="overlay-status">● PROCESSING</div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              className="input"
              value={url}
              onChange={handleInputChange}
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
                    <span className="base-url">{BASE_URL}/</span>
                    <input
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
            </div>

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
          )}
          {error && <p className="error-message">{error}</p>}
        </div>

        {/* Right panel — result */}
        <div className="right-panel">
          {shortenedUrl ? (
            <div className="result">
              <p className="shortened-text">Shortened URL:</p>
              <div className="shortened-url-container">
                <a href={shortenedUrl} target="_blank" rel="noopener noreferrer" className="shortened-url">
                  {shortenedUrl}
                </a>
                <button onClick={copyToClipboard} className="copy-btn">Copy</button>
                <button onClick={copyShortCode} className="copy-btn">Copy Code</button>
              </div>
              {expiresAt && (
                <p className="expiry-info">Expires: {new Date(expiresAt).toLocaleString()}</p>
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
    </div>
  );
}

export default Main;
