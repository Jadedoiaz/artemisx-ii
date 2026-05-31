import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export interface NFTItem {
  id: string;
  name: string;
  image: string;
  collection?: string;
  attributes?: Record<string, string>;
  listed?: boolean;
}

export function useNFTs(walletAddress?: string) {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heliusApiKey = useSettingsStore((s) => s.heliusApiKey);

  useEffect(() => {
    if (!walletAddress || !heliusApiKey) {
      setNfts([]);
      return;
    }
    setLoading(true);
    fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAssetsByOwner',
        params: { ownerAddress: walletAddress, page: 1, limit: 1000 },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const items: NFTItem[] = (data.result?.items || []).map((item: any) => ({
          id: item.id,
          name: item.content?.metadata?.name || 'Unnamed',
          image: item.content?.links?.image || '',
          collection: item.grouping?.[0]?.collection_metadata?.name || undefined,
          attributes: item.content?.metadata?.attributes || undefined,
          listed: item.ownership?.frozen || false,
        }));
        setNfts(items);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [walletAddress, heliusApiKey]);

  const collections = Array.from(new Set(nfts.map((n) => n.collection).filter(Boolean)));

  return { nfts, collections, loading, error };
}
