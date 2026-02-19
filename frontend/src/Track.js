import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
function TrackingPage() {
  const [urlCode, setUrlCode] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    setUrlCode(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!urlCode) {
      setError('Please enter a valid shortened URL code.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');
      const response = await fetch(`${apiUrl}/track/${urlCode}`);
      const data = await response.json();

      if (response.ok) {
        setTrackingData(data);
        setError('');
      } else {
        setTrackingData(null);
        setError(data.error || 'Failed to track the URL.');
      }
    } catch (err) {
      setTrackingData(null);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <button onClick={() => navigate('/')} className="track-links-btn">
        ← Shorten a URL
      </button>
      <div className="form-container">
        <h1 className="title">Track Your Fwshk URL</h1>
        <p className="subtitle">Enter your shortened URL code to view details</p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            className="input"
            value={urlCode}
            onChange={handleInputChange}
            placeholder="Enter shortened code"
          />

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Track'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {trackingData && (
          <div className="result">
            <p className="shortened-text">Tracking Information</p>
            <div className="tracking-info">
              <p><strong>Original URL:</strong> {trackingData.originalUrl}</p>
              <p><strong>Shortened URL:</strong> <a href={`${BASE_URL}/${trackingData.shortCode}`} target="_blank" rel="noopener noreferrer">{`${BASE_URL}/${trackingData.shortCode}`}</a></p>
              <p><strong>Clicks:</strong> {trackingData.clicks}</p>
              {trackingData.createdAt && (
                <p><strong>Created:</strong> {new Date(trackingData.createdAt).toLocaleString()}</p>
              )}
              {trackingData.expiresAt && (
                <p><strong>Expires:</strong> {new Date(trackingData.expiresAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackingPage;
