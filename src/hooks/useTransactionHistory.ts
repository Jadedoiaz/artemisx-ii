import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchHeliusTransactions, ParsedTransaction } from '../lib/api';
import { useSettingsStore } from '../stores/settingsStore';

export function useTransactionHistory() {
  const { publicKey, connected } = useWallet();
  const { heliusKey } = useSettingsStore();
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!publicKey || !connected) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHeliusTransactions(publicKey.toBase58(), heliusKey);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, heliusKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [connected, publicKey, fetchHistory]);

  return { transactions, loading, error, refetch: fetchHistory };
}
