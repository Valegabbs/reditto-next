'use client';

import React from 'react';
import FloatingMenu from './FloatingMenu';

export default function ClientWrapper({ 
  children, 
  showFloatingMenu = true 
}: { 
  children: React.ReactNode;
  showFloatingMenu?: boolean;
}) {
  React.useEffect(() => {
    // Carregar tema salvo do localStorage
    try {
      const savedTheme = localStorage.getItem('reditto-theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch (error) {
      // Ignorar erro se localStorage não estiver disponível
    }
  }, []);

  const handleLogout = () => {
    window.location.href = '/';
  };

  return (
    <>
      {showFloatingMenu && <FloatingMenu onLogout={handleLogout} />}
      {children}
    </>
  );
}
