import { createConfig, http } from 'wagmi'
import { mainnet, bsc } from 'viem/chains'
import { injected, walletConnect } from 'wagmi/connectors'

export const evmChains = [mainnet, bsc] as const

const wcProjectId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_WC_PROJECT_ID

const connectors = [
  injected({ target: 'metaMask' }),
  ...(wcProjectId && wcProjectId.length >= 32 ? [
    walletConnect({
      projectId: wcProjectId,
      metadata: {
        name: 'Artemis X-II',
        description: 'Multi-Chain Bump Bot Suite',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://artemisx-ii.vercel.app',
        icons: [],
      },
    })
  ] : []),
]

export const evmConfig = createConfig({
  chains: evmChains,
  connectors,
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

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function getMetaMaskDeepLink(): string {
  if (typeof window === 'undefined') return ''
  return `https://metamask.app.link/dapp/${window.location.host}`
}

export function getPhantomDeepLink(): string {
  if (typeof window === 'undefined') return ''
  return `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`
}
