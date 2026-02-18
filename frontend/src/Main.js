import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from './logo.svg';

function Main() {
  const [url, setUrl] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [ttl, setTtl] = useState('');
  const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      toast.error('Please enter a URL.');
      return;
    }

    if (useCustomCode && !customCode) {
      setError('Please enter a custom shortcode.');
      toast.error('Custom shortcode is required when custom option is selected.');
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
      toast.error('Invalid URL! Please enter a valid URL.');
      return;
    }
  
    try {
      setIsLoading(true);
      // Call the backend API with the formatted URL and optional custom code
      const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');
      const response = await fetch(`${apiUrl}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          originalUrl: formattedUrl,
          ...(useCustomCode && { customShortCode: customCode }),
          ...(ttl && { ttl: parseInt(ttl, 10) })
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const fullShortenedUrl = `${BASE_URL}/${data.shortCode}`;
        setShortenedUrl(fullShortenedUrl);
        setExpiresAt(data.expiresAt || '');
        setError('');
        toast.success('URL shortened successfully!');
      } else {
        setError(data.error || 'Failed to shorten URL.');
        toast.error(data.error || 'Failed to shorten URL.');
      }
    } catch (err) {
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
  const navigateToTrackLinks = () => {
    navigate('/track'); // Navigate to the /track route
  };
  return (
    <div className="app-container">
  <button onClick={navigateToTrackLinks} className="track-links-btn">
        Track your Link
      </button>
    <div className="form-container">
      <img src={logo} alt="Fwshk logo" className="app-logo" />
      <h1 className="title">Fwshk - URLs on Diet</h1>
      <p className="subtitle">Enter a URL to shorten it</p>
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

        <div className="ttl-options">
          <label className="ttl-label" htmlFor="ttl-select">Link Expiration:</label>
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

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {shortenedUrl && (
        <div className="result">
          <p className="shortened-text">Shortened URL:</p>
          <div className="shortened-url-container">
            <a href={shortenedUrl} target="_blank" rel="noopener noreferrer" className="shortened-url">
              {shortenedUrl}
            </a>
            <button onClick={copyToClipboard} className="copy-btn">Copy</button>
          </div>
          {expiresAt && (
            <p className="expiry-info">Expires: {new Date(expiresAt).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
    <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop />
  </div>
  );
}

export default Main;