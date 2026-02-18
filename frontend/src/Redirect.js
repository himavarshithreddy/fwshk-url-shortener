import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function RedirectPage() {
  const { shortCode } = useParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const apiUrl = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

    if (!apiUrl) {
      setError('API URL is not configured.');
      return;
    }

    if (!shortCode || !/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
      setError('Invalid short code.');
      return;
    }

    window.location.href = `${apiUrl}/${encodeURIComponent(shortCode)}`;
  }, [shortCode]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Redirecting...</div>;
}

export default RedirectPage;
