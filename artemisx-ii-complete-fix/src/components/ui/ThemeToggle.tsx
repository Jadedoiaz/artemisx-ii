import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 transition-colors hover:bg-slate-700 hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:bg-slate-100"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </motion.div>
    </motion.button>
  );
};
