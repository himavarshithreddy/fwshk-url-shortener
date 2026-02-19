import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './App.css';
import logo from './logo.svg';

function RedirectPage() {
  const { shortCode } = useParams();
  const [error, setError] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const apiUrl = (process.env.REACT_APP_API_URL || window.location.origin).replace(/\/+$/, '');

  const doRedirect = useCallback(() => {
    window.location.replace(`${apiUrl}/${encodeURIComponent(shortCode)}`);
  }, [apiUrl, shortCode]);

  useEffect(() => {
    if (!shortCode || !/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
      setError('Invalid short code.');
      return;
    }

    fetch(`${apiUrl}/track/${encodeURIComponent(shortCode)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Link not found');
        return res.json();
      })
      .then((data) => {
        setDestinationUrl(data.originalUrl);
      })
      .catch(() => {
        setError('Link not found');
      });
  }, [shortCode, apiUrl]);

  useEffect(() => {
    if (destinationUrl) {
      doRedirect();
    }
  }, [destinationUrl, doRedirect]);

  if (error) {
    return (
      <div className="app-container">
        <div className="redirect-card">
          <div className="app-header">
            <img src={logo} alt="Fwshk logo" className="app-logo" />
            <h1 className="title">Fwshk</h1>
          </div>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="redirect-card">
        <div className="app-header">
          <img src={logo} alt="Fwshk logo" className="app-logo" />
          <h1 className="title">Fwshk</h1>
        </div>
        <p className="redirect-label">Redirecting you to</p>
        <div className="redirect-url-box">
          <span className="redirect-url">{destinationUrl || '...'}</span>
        </div>
        <p className="redirect-hint">You will be redirected automatically</p>
      </div>
    </div>
  );
}

export default RedirectPage;
