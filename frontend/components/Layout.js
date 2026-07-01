import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="layout-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#FFFDF7' }}>
      <Header />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
