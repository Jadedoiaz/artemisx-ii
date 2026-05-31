import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { useTheme } from '../../hooks/useTheme';

export const Shell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-theme-primary text-theme-primary ${theme}`}>
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
