import { WagmiProvider } from 'wagmi'
import { evmConfig } from '../../lib/evm'
import SolanaWalletProvider from './SolanaWalletProvider'

export default function UnifiedWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={evmConfig} reconnectOnMount={true}>
      <SolanaWalletProvider>
        {children}
      </SolanaWalletProvider>
    </WagmiProvider>
  )
}
