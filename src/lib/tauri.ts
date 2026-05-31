// Detect if running inside Tauri desktop wrapper
export const isTauri = () => {
  return typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
};

// Open external links in system browser (not inside Tauri window)
export const openExternal = async (url: string) => {
  if (isTauri()) {
    // Tauri shell open - use window.__TAURI__ if available
    const tauriWindow = window as any;
    if (tauriWindow.__TAURI__?.shell?.open) {
      await tauriWindow.__TAURI__.shell.open(url);
      return;
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};
