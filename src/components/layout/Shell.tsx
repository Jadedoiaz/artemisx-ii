import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import Sidebar from './Sidebar'
import MobileSidebar from './MobileSidebar'
import { useTheme } from '../../hooks/useTheme'

export const Shell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
