export interface Transaction {
  id: string
  chain: string
  type: 'bump'
  amount: number
  status: 'success' | 'pending' | 'failed'
  txId?: string
  timestamp: number
  from: string
  to: string
}
