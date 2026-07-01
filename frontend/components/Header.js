import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isTrackPage = isMounted && router.pathname === '/track';

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        <img src="/logo192.png" alt="brnk logo" />
        <div className="site-logo-text">brnk<span>.in</span></div>
      </Link>

      {/* Desktop Navigation */}
      <ul className="desktop-nav">
        <li><Link href="/" className={`nav-link ${router.pathname === '/' ? 'active' : ''}`}>Home</Link></li>
        <li><Link href="/blog" className={`nav-link ${router.pathname.startsWith('/blog') ? 'active' : ''}`}>Blog</Link></li>
        <li><Link href="/about" className={`nav-link ${router.pathname === '/about' ? 'active' : ''}`}>About</Link></li>
        <li><Link href="/contact" className={`nav-link ${router.pathname === '/contact' ? 'active' : ''}`}>Contact</Link></li>
        <li>
          <Link href={isTrackPage ? "/" : "/track"} className="header-action-btn">
            {isTrackPage ? "← Shorten" : "Track Link"}
          </Link>
        </li>
      </ul>

      {/* Mobile Hamburger Button */}
      <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle menu">
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/" className="nav-link" onClick={closeMenu}>Home</Link>
        <Link href="/blog" className="nav-link" onClick={closeMenu}>Blog</Link>
        <Link href="/about" className="nav-link" onClick={closeMenu}>About</Link>
        <Link href="/contact" className="nav-link" onClick={closeMenu}>Contact</Link>
        <Link href={isTrackPage ? "/" : "/track"} className="header-action-btn" onClick={closeMenu}>
          {isTrackPage ? "← Shorten" : "Track Link"}
        </Link>
      </div>
    </header>
  );
};

export default Header;
