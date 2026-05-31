import { createConfig, http } from 'wagmi'
import { bsc, mainnet } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

export const evmConfig = createConfig({
  chains: [bsc, mainnet],
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({
      projectId: 'artemisx-ii',
      metadata: {
        name: 'Artemis X-II',
        description: 'Multi-chain bump bot',
        url: 'https://artemisx-ii.vercel.app',
        icons: ['https://artemisx-ii.vercel.app/favicon.ico'],
      },
    }),
  ],
  transports: {
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
    [mainnet.id]: http('https://eth.llamarpc.com'),
  },
})
