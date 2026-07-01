import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();
  const isTrackPage = router.pathname === '/track';

  return (
    <header style={{
      width: '100%',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '3px solid #FFFDF7',
      backgroundColor: '#242424',
      marginBottom: '20px'
    }}>
      <div className="app-header" style={{ margin: 0 }}>
        <img src="/logo192.png" alt="brnk logo" className="app-logo" style={{ width: '28px', height: '28px' }} />
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 className="title" style={{ fontSize: '1.5rem', cursor: 'pointer' }}>brnk.in</h1>
        </Link>
      </div>
      <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link href="/" style={{ color: '#FFFDF7', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>Home</Link>
        <Link href="/blog" style={{ color: '#FFFDF7', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>Blog</Link>
        <Link href="/about" style={{ color: '#FFFDF7', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>About</Link>
        <Link href="/contact" style={{ color: '#FFFDF7', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>Contact</Link>
        
        <Link href={isTrackPage ? "/" : "/track"} style={{
          backgroundColor: '#ff6600',
          color: '#000',
          padding: '8px 16px',
          border: '2px solid #FFFDF7',
          boxShadow: '3px 3px 0px #FFFDF7',
          textDecoration: 'none',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '0.9rem',
          display: 'inline-flex',
          alignItems: 'center',
          transition: 'transform 0.1s ease, box-shadow 0.1s ease'
        }}>
          {isTrackPage ? "← Shorten a URL" : "Track Link"}
        </Link>
      </nav>
    </header>
  );
};

export default Header;
