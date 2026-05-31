import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * Converts a hex color to RGB values
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

/**
 * Darkens a hex color by a percentage
 */
function darkenHex(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const factor = 1 - percent / 100;
  const newR = Math.max(0, Math.floor(r * factor));
  const newG = Math.max(0, Math.floor(g * factor));
  const newB = Math.max(0, Math.floor(b * factor));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Applies the accent color to CSS custom properties
 * This makes the accent color dynamic based on user settings
 */
export function applyAccentColor(color: string): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const [r, g, b] = hexToRgb(color);
  const hoverColor = darkenHex(color, 15);

  root.style.setProperty('--accent-color', color);
  root.style.setProperty('--accent-hover', hoverColor);
  root.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
}

/**
 * Hook that syncs the accent color from settings to CSS variables
 */
export function useAccentColor(): void {
  const accentColor = useSettingsStore((s) => s.accentColor);

  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);
}
