import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Dynamic Background */}
      <div className="bg-decor blob-1" />
      <div className="bg-decor blob-2" />

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', padding: '0 20px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
