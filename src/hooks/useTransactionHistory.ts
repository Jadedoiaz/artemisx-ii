import { useState, useEffect, useCallback } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

export interface ParsedTransaction {
  id: string
  signature: string
  chain: string
  type: 'bump' | 'transfer' | 'swap' | 'nft' | 'stake' | 'unknown'
  amount: number
  token: string
  status: 'success' | 'pending' | 'failed'
  timestamp: number
  from: string
  to: string
  txId?: string
  description: string
  fee: number
  source: 'bump' | 'helius'
}

export interface TransactionHistoryResult {
  transactions: ParsedTransaction[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTransactionHistory(walletAddress?: string): TransactionHistoryResult {
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const heliusApiKey = useSettingsStore((s) => s.heliusApiKey)

  const fetchTxs = useCallback(() => {
    if (!walletAddress || !heliusApiKey) {
      setTransactions([])
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [walletAddress, { limit: 50 }],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const sigs = data.result || []
        const parsed: ParsedTransaction[] = sigs.map((sig: any) => ({
          id: sig.signature,
          signature: sig.signature,
          chain: 'solana',
          type: classifyType(sig),
          amount: 0,
          token: 'SOL',
          status: sig.err ? 'failed' : 'success',
          timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
          from: walletAddress,
          to: walletAddress,
          txId: sig.signature,
          description: sig.description || 'Transaction',
          fee: sig.fee || 0,
          source: 'helius' as const,
        }))
        setTransactions(parsed)
        setError(null)
      })
      .catch((e) => {
        setError(e.message)
        setTransactions([])
      })
      .finally(() => setLoading(false))
  }, [walletAddress, heliusApiKey])

  useEffect(() => {
    fetchTxs()
  }, [fetchTxs])

  return { transactions, loading, error, refetch: fetchTxs }
}

function classifyType(sig: any): ParsedTransaction['type'] {
  const desc = (sig.description || '').toLowerCase()
  if (desc.includes('transfer')) return 'transfer'
  if (desc.includes('swap')) return 'swap'
  if (desc.includes('nft') || desc.includes('mint')) return 'nft'
  if (desc.includes('stake')) return 'stake'
  return 'unknown'
}
