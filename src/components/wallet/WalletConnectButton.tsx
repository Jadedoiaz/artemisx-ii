import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { formatAddress } from '../../lib/utils';
import { useBumpStore } from '../../stores/bumpStore';
import { mainnet, bsc } from 'viem/chains';

export default function WalletConnectButton() {
  const { publicKey, connected: solanaConnected, disconnect: disconnectSolana } = useWallet();
  const { setVisible: openSolanaModal } = useWalletModal();

  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { connect: connectEVM, connectors } = useConnect();
  const { disconnect: disconnectEVM } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const activeChain = useBumpStore((s: { activeChain: string }) => s.activeChain);

  // Determine which wallet system to show based on active chain
  const isEVM = activeChain === 'ethereum' || activeChain === 'bsc';
  const targetChainId = activeChain === 'bsc' ? bsc.id : mainnet.id;

  // EVM connected but wrong chain
  const wrongChain = evmConnected && chainId !== targetChainId && isEVM;

  // Solana connected state
  if (!isEVM && solanaConnected && publicKey) {
    return (
      <button
        onClick={() => disconnectSolana()}
        className="flex items-center gap-2 px-4 py-2 bg-surface-highlight border border-border hover:border-danger rounded-lg text-sm font-medium transition-all text-white hover:text-danger"
        title="Disconnect wallet"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline font-mono">{formatAddress(publicKey.toBase58())}</span>
      </button>
    );
  }

  // EVM connected state
  if (isEVM && evmConnected && evmAddress) {
    return (
      <div className="flex items-center gap-2">
        {wrongChain && switchChain && (
          <button
            onClick={() => switchChain({ chainId: targetChainId })}
            className="px-3 py-2 bg-warning/10 border border-warning/30 text-warning rounded-lg text-xs font-medium hover:bg-warning/20 transition-colors"
          >
            Switch to {activeChain === 'bsc' ? 'BSC' : 'ETH'}
          </button>
        )}
        <button
          onClick={() => disconnectEVM()}
          className="flex items-center gap-2 px-4 py-2 bg-surface-highlight border border-border hover:border-danger rounded-lg text-sm font-medium transition-all text-white hover:text-danger"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline font-mono">{formatAddress(evmAddress)}</span>
        </button>
      </div>
    );
  }

  // Solana disconnected state
  if (!isEVM) {
    return (
      <button
        onClick={() => openSolanaModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-accent-hover rounded-lg text-sm font-medium transition-all shadow-lg shadow-accent/20"
      >
        <Wallet size={16} />
        <span>Connect Wallet</span>
      </button>
    );
  }

  // EVM disconnected state
  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-accent-hover rounded-lg text-sm font-medium transition-all shadow-lg shadow-accent/20"
      >
        <Wallet size={16} />
        <span>Connect Wallet</span>
        <ChevronDown size={14} />
      </button>
      <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connectEVM({ connector, chainId: targetChainId })}
            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-surface-highlight first:rounded-t-lg last:rounded-b-lg transition-colors"
          >
            {connector.name}
          </button>
        ))}
      </div>
    </div>
  );
}
