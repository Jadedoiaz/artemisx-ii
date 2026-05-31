import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  chain: string;
  type: 'bump';
  amount: number;
  status: 'success' | 'pending' | 'failed';
  txId?: string;
  timestamp: number;
  from: string;
  to: string;
}

export interface BumpStore {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  clearTransactions: () => void;
}

export const useBumpStore = create<BumpStore>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions].slice(0, 50),
        })),
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: 'artemisx-bumps',
    }
  )
);
