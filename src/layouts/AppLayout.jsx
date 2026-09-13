import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    const saved = localStorage.getItem('@sg2ri:sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        localStorage.setItem('@sg2ri:sidebar_open', String(next));
      }
      return next;
    });
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--sg-bg)' }}>
      {/* Top Header Dark Navy */}
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      {/* Conteúdo Principal com Sidebar lado a lado */}
      <div className="d-flex flex-grow-1 position-relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
        />

        <main className="flex-grow-1 p-3 p-md-4 p-xl-5 overflow-x-hidden app-main-content">
          <div className="container-fluid px-0" style={{ maxWidth: '1440px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
