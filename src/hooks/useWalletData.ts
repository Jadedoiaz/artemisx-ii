import { useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWalletStore } from '../stores/walletStore';
import toast from 'react-hot-toast';

export interface TokenBalance {
  mint: string;
  name: string;
  symbol: string;
  balance: number;
  decimals: number;
  usdValue?: number;
}

export function useWalletData() {
  const { publicKey, connected } = useWallet();
  const addWallet = useWalletStore((s) => s.addWallet);
  const setConnected = useWalletStore((s) => s.setConnected);
  
  const [solBalance, setSolBalance] = useState(0);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  
  const heliusKey = import.meta.env.VITE_HELIUS_API_KEY || '';
  const connectionRef = useRef<Connection | null>(null);
  const isFetchingRef = useRef(false);

  // Create connection once per key change, not on every render
  useEffect(() => {
    const rpcUrl = heliusKey
      ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
      : 'https://api.mainnet-beta.solana.com';
    connectionRef.current = new Connection(rpcUrl, 'confirmed');
  }, [heliusKey]);

  const fetchBalances = useCallback(async () => {
    if (!publicKey || !connected || !connectionRef.current) return;
    if (isFetchingRef.current) return; // Prevent overlapping fetches
    
    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      const connection = connectionRef.current;
      
      // Fetch SOL balance
      const solLamports = await connection.getBalance(publicKey);
      const sol = solLamports / LAMPORTS_PER_SOL;
      setSolBalance(sol);

      // Fetch token accounts via Helius
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      const tokenBalances: TokenBalance[] = tokenAccounts.value
        .map((acc) => {
          const parsed = acc.account.data.parsed.info;
          const amount = Number(parsed.tokenAmount.uiAmount);
          if (amount <= 0) return null;

          return {
            mint: parsed.mint,
            name: parsed.mint.slice(0, 6) + '...' + parsed.mint.slice(-4),
            symbol: 'SPL',
            balance: amount,
            decimals: parsed.tokenAmount.decimals,
          };
        })
        .filter((t): t is TokenBalance => t !== null);

      setTokens(tokenBalances);

      // Update store
      addWallet({
        address: publicKey.toBase58(),
        chain: 'solana',
        connected: true,
        balance: sol,
      });
      setConnected(publicKey.toBase58(), true);

    } catch (err: any) {
      console.error('Wallet data fetch failed:', err);
      toast.error('Failed to fetch wallet balances');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [publicKey, connected, addWallet, setConnected]);

  // Fetch once on mount/connection, then every 30s
  useEffect(() => {
    if (!connected || !publicKey) return;
    
    fetchBalances();
    const interval = setInterval(fetchBalances, 30000);
    
    return () => clearInterval(interval);
  }, [connected, publicKey, fetchBalances]);

  return {
    publicKey,
    connected,
    solBalance,
    tokens,
    loading,
    refetch: fetchBalances,
  };
}
