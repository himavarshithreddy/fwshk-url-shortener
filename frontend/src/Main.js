import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import logo from './logo.svg';

const LOADING_PHRASES = [
  '✂️ CHOPPING',
  '🔪 SLICING',
  '🗜️ SQUEEZING',
  '💥 CRUNCHING',
  '⚡ FWSHK-ING',
  '🧬 SHRINKING',
  '🔥 MELTING',
  '🏋️ TRIMMING',
];

const GLITCH_CHARS = '█▓▒░╔╗╚╝║═┼│─@#$%&*!?<>{}[]~^';
const SCRAMBLE_LEN = 20;

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
  const [loadingPhrase, setLoadingPhrase] = useState('');
  const [scrambleChars, setScrambleChars] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      setLoadingPhrase('');
      setScrambleChars([]);
      return;
    }
    let idx = 0;
    setLoadingPhrase(LOADING_PHRASES[0]);
    const phraseInterval = setInterval(() => {
      idx = (idx + 1) % LOADING_PHRASES.length;
      setLoadingPhrase(LOADING_PHRASES[idx]);
    }, 350);
    const scrambleInterval = setInterval(() => {
      setScrambleChars(
        Array.from({ length: SCRAMBLE_LEN }, () =>
          GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        )
      );
    }, 70);
    return () => {
      clearInterval(phraseInterval);
      clearInterval(scrambleInterval);
    };
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

            <button type="submit" className={`submit-btn${isLoading ? ' submit-btn--loading' : ''}`} disabled={isLoading}>
              {isLoading ? loadingPhrase : 'Shorten'}
            </button>
          </form>

          {isLoading && (
            <div className="fwshk-loading">
              <div className="fwshk-scramble-strip">
                {scrambleChars.map((char, i) => (
                  <span key={i} className="fwshk-char" style={{ animationDelay: `${i * 0.04}s` }}>
                    {char}
                  </span>
                ))}
              </div>
              <div className="fwshk-blocks-row">
                {[...Array(7)].map((_, i) => (
                  <span key={i} className="fwshk-block" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            </div>
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
