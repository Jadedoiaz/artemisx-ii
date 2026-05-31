import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  heliusApiKey: string
  discordWebhookUrl: string
  solanaRpcUrl: string
  accentColor: string
  maxBumpAmount: number
  cooldownMs: number
  notificationsEnabled: boolean
  theme: 'dark' | 'light'
  setHeliusApiKey: (key: string) => void
  setDiscordWebhookUrl: (url: string) => void
  setSolanaRpcUrl: (url: string) => void
  setAccentColor: (color: string) => void
  setMaxBumpAmount: (amount: number) => void
  setCooldownMs: (ms: number) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      heliusApiKey: '',
      discordWebhookUrl: '',
      solanaRpcUrl: 'https://api.mainnet-beta.solana.com',
      accentColor: 'purple',
      maxBumpAmount: 1000,
      cooldownMs: 5000,
      notificationsEnabled: false,
      theme: 'dark',
      setHeliusApiKey: (key) => set({ heliusApiKey: key }),
      setDiscordWebhookUrl: (url) => set({ discordWebhookUrl: url }),
      setSolanaRpcUrl: (url) => set({ solanaRpcUrl: url }),
      setAccentColor: (color) => set({ accentColor: color }),
      setMaxBumpAmount: (amount) => set({ maxBumpAmount: amount }),
      setCooldownMs: (ms) => set({ cooldownMs: ms }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'artemisx-settings-v2',
    }
  )
)
