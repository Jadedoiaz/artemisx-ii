import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { formatAddress } from '../../lib/utils';

export default function WalletConnectButton() {
  const { publicKey, connected } = useWallet();

  return (
    <div className="flex items-center gap-3">
      {connected && publicKey && (
        <span className="text-xs text-muted font-mono hidden sm:block">
          {formatAddress(publicKey.toBase58())}
        </span>
      )}
      <WalletMultiButton
        style={{
          background: '#7c3aed',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          height: '2.25rem',
          lineHeight: '2.25rem',
          padding: '0 1rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      />
    </div>
  );
}
