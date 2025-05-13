import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Main() {
  const [url, setUrl] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    setUrl(event.target.value);
  };

  const handleCustomCodeChange = (event) => {
    
    const sanitizedValue = event.target.value.replace(/[^a-zA-Z0-9-]/g, '');
    setCustomCode(sanitizedValue);
  };

  const handleToggleCustomCode = () => {
    setUseCustomCode(!useCustomCode);
    setCustomCode(''); // Reset custom code when toggling
    setError(''); // Reset any errors
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
      // Call the backend API with the formatted URL and optional custom code
      const response = await fetch('https://oof.fwshk.ninja/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          originalUrl: formattedUrl,
          ...(useCustomCode && { customAlias: customCode })
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const fullShortenedUrl = `${BASE_URL}/${data.shortCode}`;
        setShortenedUrl(fullShortenedUrl);
        setError('');
        toast.success('URL shortened successfully!');
      } else {
        setError(data.error || 'Failed to shorten URL.');
        toast.error(data.error || 'Failed to shorten URL.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
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

        <button type="submit" className="submit-btn">Shorten</button>
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
        </div>
      )}
    </div>
    <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop />
  </div>
  );
}

export default Main;