// Detect if running inside Tauri desktop wrapper
export const isTauri = () => {
  return !!(window as any).__TAURI_INTERNALS__;
};

// Open external links in system browser (not inside Tauri window)
export const openExternal = async (url: string) => {
  if (isTauri()) {
    // Tauri shell open - only available in desktop builds
    try {
      const tauriShell = await import('@tauri-apps/plugin-shell');
      await tauriShell.open(url);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
