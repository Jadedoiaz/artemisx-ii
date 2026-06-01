import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  accentColor: string;
  maxBumpAmount: number;
  cooldownMs: number;
  discordWebhook: string;
  heliusKey: string;
  solanaRpc: string;
  notificationsEnabled: boolean;
  setAccentColor: (c: string) => void;
  setMaxBump: (n: number) => void;
  setCooldown: (n: number) => void;
  setWebhook: (url: string) => void;
  setHeliusKey: (key: string) => void;
  setSolanaRpc: (url: string) => void;
  setNotificationsEnabled: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      accentColor: '#7c3aed',
      maxBumpAmount: 1000,
      cooldownMs: 5000,
      // FIX: Read Vercel env vars as defaults (baked in at build time)
      // Falls back to empty string / default RPC if env vars not set
      discordWebhook: import.meta.env.VITE_DISCORD_WEBHOOK_URL || '',
      heliusKey: import.meta.env.VITE_HELIUS_API_KEY || '',
      solanaRpc: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      notificationsEnabled: false,
      setAccentColor: (c) => set({ accentColor: c }),
      setMaxBump: (n) => set({ maxBumpAmount: n }),
      setCooldown: (n) => set({ cooldownMs: n }),
      setWebhook: (url) => set({ discordWebhook: url }),
      setHeliusKey: (key) => set({ heliusKey: key }),
      setSolanaRpc: (url) => set({ solanaRpc: url }),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
    }),
    {
      // FIX: Bumped persist key so browsers load new defaults instead of
      // old empty cached values from 'artemisx-ii-settings'
      name: 'artemisx-ii-settings-v2',
    }
  )
);
