import { useEffect, useState, useCallback } from 'react';
import { fetchEVMPrices, TokenPrice } from '../lib/api';

export function useEVMPrices(chains: string[]) {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState(false);

  const fetchPrices = useCallback(async () => {
    if (chains.length === 0) return;
    setLoading(true);
    try {
      const data = await fetchEVMPrices(chains);
      const priceMap: Record<string, TokenPrice> = {};
      data.forEach(p => {
        const chainKey = p.id === 'ethereum' ? 'ethereum' : p.id === 'binancecoin' ? 'bsc' : p.id;
        priceMap[chainKey] = p;
      });
      setPrices(priceMap);
    } catch (err) {
      console.error('EVM price fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [chains.join(',')]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading, refetch: fetchPrices };
}
