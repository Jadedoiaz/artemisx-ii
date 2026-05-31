import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Wallet } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { WalletConnectButton } from '../wallet/WalletConnectButton';
import { useSettingsStore } from '../../stores/settingsStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const accentColor = useSettingsStore((s) => s.accentColor);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-theme bg-theme-card px-4 lg:px-8"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-theme bg-theme-secondary text-theme-secondary transition-colors hover:text-theme-primary lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${accentColor}-500 text-white`}>
            <Wallet size={16} />
          </div>
          <span className="text-lg font-bold text-theme-primary">Artemis X-II</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-theme bg-theme-secondary text-theme-secondary transition-colors hover:text-theme-primary">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <ThemeToggle />
        <div className="hidden sm:block">
          <WalletConnectButton />
        </div>
      </div>
    </motion.header>
  );
};
