// CoinGecko API for live token prices
// Helius API for parsed transaction history

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const HELIUS_API = 'https://mainnet.helius-rpc.com';

// Cache prices for 60 seconds to respect rate limits
const priceCache = new Map<string, { price: number; change24h: number; timestamp: number }>();
const CACHE_TTL = 60000;

export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image?: string;
}

export interface ParsedTransaction {
  signature: string;
  timestamp: number;
  type: 'transfer' | 'swap' | 'nft' | 'stake' | 'bump' | 'unknown';
  description: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  fee: number;
  status: 'pending' | 'success' | 'failed';
}

// Map common Solana token mints to CoinGecko IDs
const MINT_TO_COINGECKO: Record<string, string> = {
  'So11111111111111111111111111111111111111112': 'solana',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usd-coin',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'tether',
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'bonk',
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARo': 'jupiter-exchange-solana',
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'jupiter-exchange-solana',
};

export function getCoinGeckoId(mint: string): string | null {
  return MINT_TO_COINGECKO[mint] || null;
}

export async function fetchTokenPrices(mints: string[]): Promise<TokenPrice[]> {
  const ids = mints.map(getCoinGeckoId).filter((id): id is string => id !== null);
  if (ids.length === 0) return [];

  // Check cache first
  const now = Date.now();
  const cached = ids.map(id => priceCache.get(id)).filter(Boolean);
  if (cached.length === ids.length && cached.every(c => c && now - c.timestamp < CACHE_TTL)) {
    return cached.map((c, i) => ({
      id: ids[i],
      symbol: '',
      name: '',
      current_price: c!.price,
      price_change_percentage_24h: c!.change24h,
    }));
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
    );
    if (!response.ok) throw new Error('CoinGecko rate limit');
    const data: TokenPrice[] = await response.json();

    // Update cache
    data.forEach(token => {
      priceCache.set(token.id, {
        price: token.current_price,
        change24h: token.price_change_percentage_24h || 0,
        timestamp: now,
      });
    });

    return data;
  } catch (err) {
    console.error('Price fetch failed:', err);
    // Return cached data even if stale
    return ids.map((id, i) => {
      const cached = priceCache.get(id);
      return cached ? {
        id,
        symbol: '',
        name: '',
        current_price: cached.price,
        price_change_percentage_24h: cached.change24h,
      } : null;
    }).filter((item): item is TokenPrice => item !== null);
  }
}

export async function fetchTransactionHistory(
  address: string,
  apiKey?: string
): Promise<ParsedTransaction[]> {
  const rpcUrl = apiKey
    ? `${HELIUS_API}/?api-key=${apiKey}`
    : 'https://api.mainnet-beta.solana.com';

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [address, { limit: 50 }],
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch signatures');
    const data = await response.json();
    const signatures = data.result || [];

    if (signatures.length === 0) return [];

    // Fetch parsed transactions
    const txResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [signatures[0].signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
      }),
    });

    // For now, return formatted signatures as transactions
    // Full parsed transaction parsing would require Helius enhanced API
    return signatures.map((sig: any) => ({
      signature: sig.signature,
      timestamp: (sig.blockTime || Date.now() / 1000) * 1000,
      type: 'unknown' as const,
      description: `Transaction ${sig.signature.slice(0, 8)}...`,
      from: address,
      to: address,
      amount: 0,
      token: 'SOL',
      fee: 0,
      status: (sig.err ? 'failed' : 'success') as 'success' | 'failed',
    }));
  } catch (err) {
    console.error('Transaction history fetch failed:', err);
    return [];
  }
}

// Enhanced Helius API for parsed transactions (requires Helius API key)
export async function fetchHeliusTransactions(
  address: string,
  apiKey: string
): Promise<ParsedTransaction[]> {
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=50`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) throw new Error('Helius API error');
    const data = await response.json();

    return (data || []).map((tx: any) => ({
      signature: tx.signature,
      timestamp: tx.timestamp * 1000,
      type: classifyTransaction(tx),
      description: tx.description || `Transaction ${tx.signature.slice(0, 8)}...`,
      from: tx.feePayer || address,
      to: tx.nativeTransfers?.[0]?.toUserAccount || address,
      amount: tx.nativeTransfers?.[0]?.amount || 0,
      token: 'SOL',
      fee: tx.fee || 0,
      status: (tx.slot ? 'success' : 'failed') as 'success' | 'failed',
    }));
  } catch (err) {
    console.error('Helius enhanced fetch failed:', err);
    return fetchTransactionHistory(address, apiKey);
  }
}

function classifyTransaction(tx: any): ParsedTransaction['type'] {
  if (tx.type?.toLowerCase().includes('nft')) return 'nft';
  if (tx.type?.toLowerCase().includes('swap')) return 'swap';
  if (tx.type?.toLowerCase().includes('stake')) return 'stake';
  if (tx.nativeTransfers?.length > 0) return 'transfer';
  return 'unknown';
}
