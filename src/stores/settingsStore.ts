import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  accentColor: string;
  maxBumpAmount: number;
  cooldownMs: number;
  discordWebhook: string;
  heliusKey: string;
  solanaRpc: string;
  setAccentColor: (c: string) => void;
  setMaxBump: (n: number) => void;
  setCooldown: (n: number) => void;
  setWebhook: (url: string) => void;
  setHeliusKey: (key: string) => void;
  setSolanaRpc: (url: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      accentColor: '#7c3aed',
      maxBumpAmount: 1000,
      cooldownMs: 5000,
      discordWebhook: '',
      heliusKey: '',
      solanaRpc: 'https://api.mainnet-beta.solana.com',
      setAccentColor: (c) => set({ accentColor: c }),
      setMaxBump: (n) => set({ maxBumpAmount: n }),
      setCooldown: (n) => set({ cooldownMs: n }),
      setWebhook: (url) => set({ discordWebhook: url }),
      setHeliusKey: (key) => set({ heliusKey: key }),
      setSolanaRpc: (url) => set({ solanaRpc: url }),
    }),
    {
      name: 'artemisx-ii-settings',
    }
  )
);
