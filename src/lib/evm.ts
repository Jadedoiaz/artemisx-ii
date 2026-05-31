import { createConfig, http } from 'wagmi'
import { mainnet, bsc } from 'viem/chains'
import { injected } from 'wagmi/connectors'

export const evmChains = [mainnet, bsc] as const

// FIX: Removed invalid WalletConnect connector with fake projectId
// 'artemisx-ii-wallet' is NOT a valid WalletConnect projectId
// This was causing a 2-minute API timeout on every page load.
//
// To add WalletConnect later:
// 1. Go to https://cloud.walletconnect.com
// 2. Create a project and copy the Project ID
// 3. Add it as VITE_WC_PROJECT_ID env variable
// 4. Uncomment the walletConnect block below

const wcProjectId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_WC_PROJECT_ID

const connectors = [
  injected({ target: 'metaMask' }),
]

// Only add WalletConnect if a valid project ID is configured
if (wcProjectId && wcProjectId.length >= 32) {
  // Dynamic import to avoid bundling WalletConnect unless needed
  const { walletConnect } = require('wagmi/connectors')
  connectors.push(walletConnect({
    projectId: wcProjectId,
    metadata: {
      name: 'Artemis X-II',
      description: 'Multi-Chain Bump Bot Suite',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://artemisx-ii.vercel.app',
      icons: [],
    },
  }))
}

export const evmConfig = createConfig({
  chains: evmChains,
  connectors,
  transports: {
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
  },
  // FIX: Disable auto-reconnect to prevent lag on page navigation
  // Users can manually reconnect — this avoids the WagmiProvider
  // blocking the UI thread while attempting reconnect on every mount
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

/**
 * Check if the current device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Get MetaMask mobile deep link for the current page
 */
export function getMetaMaskDeepLink(): string {
  if (typeof window === 'undefined') return ''
  const currentUrl = encodeURIComponent(window.location.href)
  return `https://metamask.app.link/dapp/${window.location.host}`
}

/**
 * Get Phantom mobile deep link
 */
export function getPhantomDeepLink(): string {
  if (typeof window === 'undefined') return ''
  return `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`
}
