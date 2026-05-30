export interface ChainConfig {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  color: string;
}

export interface WalletState {
  address: string | null;
  chain: string;
  connected: boolean;
  balance: number;
}

export interface BumpConfig {
  chain: string;
  amount: number;
  interval: number;
  maxCount: number;
  cooldown: number;
}

export interface Transaction {
  id: string;
  chain: string;
  type: 'bump';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  txId?: string;
  timestamp: number;
  from: string;
  to: string;
}

export interface TokenHolding {
  mint: string;
  name: string;
  symbol: string;
  balance: number;
  decimals: number;
  usdValue?: number;
}

export interface BumpPreset {
  id: string;
  name: string;
  chain: string;
  amount: number;
  interval: number;
}
