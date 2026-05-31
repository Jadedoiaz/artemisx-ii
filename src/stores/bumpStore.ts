import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction } from '../types'

export interface BumpStore {
  transactions: Transaction[]
  bumpCount: number
  successCount: number
  isBumping: boolean
  activeChain: string
  addTransaction: (tx: Transaction) => void
  clearTransactions: () => void
  setBumping: (val: boolean) => void
  setActiveChain: (chain: string) => void
}

export const useBumpStore = create<BumpStore>()(
  persist(
    (set) => ({
      transactions: [],
      bumpCount: 0,
      successCount: 0,
      isBumping: false,
      activeChain: 'solana',
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions].slice(0, 50),
          bumpCount: state.bumpCount + 1,
          successCount: tx.status === 'success' ? state.successCount + 1 : state.successCount,
        })),
      clearTransactions: () => set({ transactions: [], bumpCount: 0, successCount: 0 }),
      setBumping: (val) => set({ isBumping: val }),
      setActiveChain: (chain) => set({ activeChain: chain }),
    }),
    {
      name: 'artemisx-bumps-v2',
    }
  )
)
