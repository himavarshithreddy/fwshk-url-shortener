import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, width: '100%', padding: '0 20px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
