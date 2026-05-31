import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount, useDisconnect as useDisconnectEVM } from 'wagmi';
import { Wallet, LogOut } from 'lucide-react';
import { useBumpStore } from '../../stores/bumpStore';

export default function WalletConnectButton() {
  const { publicKey, disconnect: disconnectSolana, select, connect, wallets, connected: solanaConnected } = useWallet();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { disconnect: disconnectEVM } = useDisconnectEVM();
  const activeChain = useBumpStore((s) => s.activeChain);
  const setActiveChain = useBumpStore((s) => s.setActiveChain);

  const isSolana = activeChain === 'solana';

  // FIX: Check both connected flag AND actual address/publicKey exists
  // Prevents stale publicKey from showing wallet as connected
  const isSolanaReallyConnected = solanaConnected && !!publicKey;
  const isEVMReallyConnected = evmConnected && !!evmAddress;

  const connected = isSolana ? isSolanaReallyConnected : isEVMReallyConnected;
  const address = isSolana ? publicKey?.toBase58() : evmAddress;

  const handleConnect = async () => {
    if (isSolana) {
      const phantom = wallets.find((w) => w.adapter.name === 'Phantom');
      if (phantom) {
        try {
          select(phantom.adapter.name);
          // connect() with no arguments - the adapter handles the connection
          await connect();
        } catch (err) {
          console.warn('Wallet connection failed:', err);
        }
      }
    }
    // EVM wallets are handled by wagmi's built-in modal
  };

  const handleDisconnect = () => {
    if (isSolana) disconnectSolana();
    else disconnectEVM();
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={activeChain}
        onChange={(e) => setActiveChain(e.target.value)}
        className="rounded-lg border border-border bg-surface-highlight px-2 py-1.5 text-xs text-white"
      >
        <option value="solana">Solana</option>
        <option value="bsc">BSC</option>
        <option value="ethereum">Ethereum</option>
      </select>
      {connected && address ? (
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-highlight px-3 py-2 text-sm text-white transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <span className="max-w-[100px] truncate">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <LogOut size={14} />
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Wallet size={16} />
          Connect Wallet
        </button>
      )}
    </div>
  );
}
