import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export interface ParsedTransaction {
  id: string;
  chain: string;
  type: 'bump' | 'transfer' | 'swap' | 'nft' | 'stake' | 'unknown';
  amount: number;
  token: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: number;
  from: string;
  to: string;
  txId?: string;
}

export function useTransactionHistory(walletAddress?: string) {
  const [txs, setTxs] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const heliusApiKey = useSettingsStore((s) => s.heliusApiKey);

  useEffect(() => {
    if (!walletAddress || !heliusApiKey) {
      setTxs([]);
      return;
    }
    setLoading(true);
    fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [walletAddress, { limit: 50 }],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const sigs = data.result || [];
        const parsed: ParsedTransaction[] = sigs.map((sig: any) => ({
          id: sig.signature,
          chain: 'solana',
          type: classifyType(sig),
          amount: 0,
          token: 'SOL',
          status: sig.err ? 'failed' : 'success',
          timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
          from: walletAddress,
          to: walletAddress,
          txId: sig.signature,
        }));
        setTxs(parsed);
      })
      .catch(() => setTxs([]))
      .finally(() => setLoading(false));
  }, [walletAddress, heliusApiKey]);

  return { txs, loading };
}

function classifyType(sig: any): ParsedTransaction['type'] {
  const desc = (sig.description || '').toLowerCase();
  if (desc.includes('transfer')) return 'transfer';
  if (desc.includes('swap')) return 'swap';
  if (desc.includes('nft') || desc.includes('mint')) return 'nft';
  if (desc.includes('stake')) return 'stake';
  return 'unknown';
}
