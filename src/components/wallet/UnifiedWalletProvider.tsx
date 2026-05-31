import React from 'react'
import { WagmiProvider } from 'wagmi'
import { evmConfig } from '../../lib/evm'
import { SolanaWalletProvider } from './SolanaWalletProvider'

interface Props {
  children: React.ReactNode
}

export const UnifiedWalletProvider: React.FC<Props> = ({ children }) => {
  return (
    <WagmiProvider config={evmConfig}>
      <SolanaWalletProvider>
        {children}
      </SolanaWalletProvider>
    </WagmiProvider>
  )
}
