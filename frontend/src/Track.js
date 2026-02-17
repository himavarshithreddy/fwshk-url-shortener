import React, { useState} from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TrackingPage() {
  const [urlCode, setUrlCode] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;

  const handleInputChange = (event) => {
    setUrlCode(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!urlCode) {
      setError('Please enter a valid shortened URL code.');
      toast.error('URL code is required.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/track/${urlCode}`);
      const data = await response.json();

      if (response.ok) {
        setTrackingData(data);
        setError('');
      } else {
        setTrackingData(null);
        setError(data.error || 'Failed to track the URL.');
        toast.error(data.error || 'Failed to track the URL.');
      }
    } catch (err) {
      setTrackingData(null);
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
        
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
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop />
    </div>
  );
}

export default TrackingPage;
