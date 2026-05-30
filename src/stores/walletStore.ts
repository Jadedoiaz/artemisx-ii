import { create } from 'zustand';
import { WalletState } from '../types';

interface WalletStore {
  wallets: WalletState[];
  addWallet: (wallet: WalletState) => void;
  removeWallet: (address: string) => void;
  setConnected: (address: string, connected: boolean) => void;
  updateBalance: (address: string, balance: number) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallets: [],
  addWallet: (wallet) =>
    set((s) => {
      if (s.wallets.find((w) => w.address === wallet.address)) return s;
      return { wallets: [...s.wallets, wallet] };
    }),
  removeWallet: (address) =>
    set((s) => ({ wallets: s.wallets.filter((w) => w.address !== address) })),
  setConnected: (address, connected) =>
    set((s) => ({
      wallets: s.wallets.map((w) =>
        w.address === address ? { ...w, connected } : w
      ),
    })),
  updateBalance: (address, balance) =>
    set((s) => ({
      wallets: s.wallets.map((w) =>
        w.address === address ? { ...w, balance } : w
      ),
    })),
}));
