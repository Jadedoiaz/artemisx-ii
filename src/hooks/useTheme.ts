import { useState, useEffect, useCallback } from 'react';
import { Theme, getStoredTheme, toggleTheme as doToggle, applyTheme } from '../lib/theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const initial = getStoredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = doToggle(prev);
      return next;
    });
  }, []);

  const set = useCallback((t: Theme) => {
    setTheme(t);
    applyTheme(t);
  }, []);

  return { theme, toggle, set };
}
