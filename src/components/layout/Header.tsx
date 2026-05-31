import React from 'react'
import { Menu, Bell, Wallet } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import WalletConnectButton from '../wallet/WalletConnectButton'
import { useSettingsStore } from '../../stores/settingsStore'

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const accentColor = useSettingsStore((s) => s.accentColor)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${accentColor}-500 text-white`}>
            <Wallet size={16} />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">Artemis X-II</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <ThemeToggle />
        <div className="hidden sm:block">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  )
}
