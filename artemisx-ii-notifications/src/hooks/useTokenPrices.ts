import { useEffect, useState, useCallback } from 'react';
import { fetchTokenPrices, TokenPrice, getCoinGeckoId } from '../lib/api';

export function useTokenPrices(mints: string[]) {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    if (mints.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTokenPrices(mints);
      const priceMap: Record<string, TokenPrice> = {};
      data.forEach(p => {
        // Map back from coingecko id to mint
        const mintEntry = Object.entries({
          'So11111111111111111111111111111111111111112': 'solana',
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usd-coin',
          'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'tether',
          'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'bonk',
        }).find(([_, id]) => id === p.id);
        if (mintEntry) {
          priceMap[mintEntry[0]] = p;
        }
      });
      setPrices(priceMap);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mints]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading, error, refetch: fetchPrices };
}
