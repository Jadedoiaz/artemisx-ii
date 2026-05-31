import { createConfig, http } from 'wagmi'
import { mainnet, bsc } from 'viem/chains'
import { injected, walletConnect } from 'wagmi/connectors'

export const evmChains = [mainnet, bsc] as const

export const evmConfig = createConfig({
  chains: evmChains,
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({
      projectId: 'artemisx-ii-wallet',
      metadata: {
        name: 'Artemis X-II',
        description: 'Multi-Chain Bump Bot Suite',
        url: 'https://artemisx-ii.vercel.app',
        icons: ['https://artemisx-ii.vercel.app/logo.png'],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
  },
})

export const chainNames: Record<number, string> = {
  [mainnet.id]: 'ethereum',
  [bsc.id]: 'bsc',
}

export const chainSymbols: Record<number, string> = {
  [mainnet.id]: 'ETH',
  [bsc.id]: 'BNB',
}

export const chainColors: Record<number, string> = {
  [mainnet.id]: '#3b82f6',
  [bsc.id]: '#eab308',
}
