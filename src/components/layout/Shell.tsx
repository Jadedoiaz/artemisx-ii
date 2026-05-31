import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';
import AnimatedBackground from './AnimatedBackground';
import { useAccentColor } from '../../hooks/useAccentColor';
import { useSettingsStore } from '../../stores/settingsStore';
import { applyAccentColor } from '../../hooks/useAccentColor';

export default function Shell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Activate accent color system
  useAccentColor();

  // Apply accent color immediately on mount (prevents flash of default purple)
  useEffect(() => {
    const stored = useSettingsStore.getState().accentColor;
    applyAccentColor(stored);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] relative">
      <AnimatedBackground />

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar - CSS-based, no AnimatePresence */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />

        <main className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {/* Simple fade transition - no mode="wait" deadlock */}
          <div
            key={location.pathname}
            className="animate-fade-in"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
