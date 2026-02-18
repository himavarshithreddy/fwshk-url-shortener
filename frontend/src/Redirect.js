import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function RedirectPage() {
  const { shortCode } = useParams();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shortCode || !/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
      setError('Invalid short code.');
      return;
    }

    const apiUrl = (process.env.REACT_APP_API_URL || window.location.origin).replace(/\/+$/, '');
    window.location.replace(`${apiUrl}/${encodeURIComponent(shortCode)}`);
  }, [shortCode]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Redirecting...</div>;
}

export default RedirectPage;
