import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount, useDisconnect as useDisconnectEVM } from 'wagmi';
import { Wallet, LogOut } from 'lucide-react';
import { useBumpStore } from '../../stores/bumpStore';

export default function WalletConnectButton() {
  const { publicKey, disconnect: disconnectSolana, connect, select, wallets } = useWallet();
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { disconnect: disconnectEVM } = useDisconnectEVM();
  const activeChain = useBumpStore((s) => s.activeChain);
  const setActiveChain = useBumpStore((s) => s.setActiveChain);

  const isSolana = activeChain === 'solana';
  const connected = isSolana ? !!publicKey : evmConnected;
  const address = isSolana ? publicKey?.toBase58() : evmAddress;

  const handleConnect = () => {
    if (isSolana) {
      const phantom = wallets.find((w) => w.adapter.name === 'Phantom');
      if (phantom) {
        select(phantom.adapter.name);
        connect();
      }
    }
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
        className="rounded-lg border border-theme bg-theme-secondary px-2 py-1.5 text-xs text-theme-primary"
      >
        <option value="solana">Solana</option>
        <option value="bsc">BSC</option>
        <option value="ethereum">Ethereum</option>
      </select>
      {connected ? (
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-2 rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-sm text-theme-primary transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <span className="max-w-[100px] truncate">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          <LogOut size={14} />
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 rounded-lg bg-purple-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
        >
          <Wallet size={16} />
          Connect
        </button>
      )}
    </div>
  );
}
