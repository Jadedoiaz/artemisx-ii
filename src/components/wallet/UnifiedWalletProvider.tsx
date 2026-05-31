import { useMemo } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { evmConfig } from '../../lib/evm';
import SolanaWalletProvider from './SolanaWalletProvider';

/**
 * Unified Wallet Provider
 *
 * Wraps both EVM (wagmi) and Solana wallet providers.
 *
 * FIX: Removed reconnectOnMount from WagmiProvider.
 * reconnectOnMount: true caused a 2-minute hang because:
 * 1. wagmi attempts to reconnect to previously connected wallets on every mount
 * 2. With invalid WalletConnect projectId, the reconnect attempt times out
 * 3. The UI thread is blocked during this timeout
 *
 * FIX: Added QueryClientProvider — wagmi v2 requires @tanstack/react-query
 * to be provided as a separate wrapper. Without it, hooks silently fail.
 */

export default function UnifiedWalletProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component so it's not shared across renders
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent query retries from blocking the UI
        retry: 1,
        retryDelay: 1000,
        // Don't refetch on window focus (prevents mobile freeze when switching apps)
        refetchOnWindowFocus: false,
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={evmConfig}>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
