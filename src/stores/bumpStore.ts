import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, BumpPreset } from '../types';

interface BumpStore {
  transactions: Transaction[];
  presets: BumpPreset[];
  isBumping: boolean;
  bumpCount: number;
  successCount: number;
  activeChain: string;
  addTx: (tx: Transaction) => void;
  updateTxStatus: (id: string, status: Transaction['status'], txId?: string) => void;
  setBumping: (v: boolean) => void;
  setActiveChain: (chain: string) => void;
  incrementBump: () => void;
  incrementSuccess: () => void;
  addPreset: (p: BumpPreset) => void;
}

export const useBumpStore = create<BumpStore>()(
  persist(
    (set) => ({
      transactions: [],
      presets: [
        { id: '1', name: 'Quick', chain: 'solana', amount: 0.001, interval: 5 },
        { id: '2', name: 'Standard', chain: 'solana', amount: 0.01, interval: 30 },
        { id: '3', name: 'Aggressive', chain: 'solana', amount: 0.05, interval: 10 },
      ],
      isBumping: false,
      bumpCount: 0,
      successCount: 0,
      activeChain: 'solana',
      addTx: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
      updateTxStatus: (id, status, txId) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, status, txId } : t
          ),
        })),
      setBumping: (v) => set({ isBumping: v }),
      setActiveChain: (chain) => set({ activeChain: chain }),
      incrementBump: () => set((s) => ({ bumpCount: s.bumpCount + 1 })),
      incrementSuccess: () => set((s) => ({ successCount: s.successCount + 1 })),
      addPreset: (p) => set((s) => ({ presets: [...s.presets, p] })),
    }),
    {
      name: 'artemisx-ii-bump',
      partialize: (state) => ({
        bumpCount: state.bumpCount,
        successCount: state.successCount,
        presets: state.presets,
        transactions: state.transactions.slice(0, 50), // Keep last 50
      }),
    }
  )
);
