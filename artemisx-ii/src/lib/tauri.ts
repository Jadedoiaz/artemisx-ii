// Detect if running inside Tauri desktop wrapper
export const isTauri = () => {
  return !!(window as any).__TAURI_INTERNALS__;
};

// Open external links in system browser (not inside Tauri window)
export const openExternal = async (url: string) => {
  if (isTauri()) {
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
