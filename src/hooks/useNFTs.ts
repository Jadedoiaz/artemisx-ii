import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchNFTsByOwner, fetchNFTCollections, NFTAsset, NFTCollection } from '../lib/api';
import { useSettingsStore } from '../stores/settingsStore';
import toast from 'react-hot-toast';

export function useNFTs() {
  const { publicKey, connected } = useWallet();
  const { heliusKey } = useSettingsStore();
  const [nfts, setNfts] = useState<NFTAsset[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');

  const fetchNFTs = useCallback(async () => {
    if (!publicKey || !connected || !heliusKey) return;

    setLoading(true);
    try {
      const assets = await fetchNFTsByOwner(publicKey.toBase58(), heliusKey);
      setNfts(assets);

      const cols = await fetchNFTCollections(publicKey.toBase58(), heliusKey);
      setCollections(cols);
    } catch (err: any) {
      console.error('NFT fetch failed:', err);
      toast.error('Failed to load NFTs. Check your Helius API key.');
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, heliusKey]);

  useEffect(() => {
    if (connected && publicKey && heliusKey) {
      fetchNFTs();
    }
  }, [connected, publicKey, heliusKey, fetchNFTs]);

  const filteredNFTs = selectedCollection === 'all'
    ? nfts
    : nfts.filter(nft => nft.collection === selectedCollection);

  return {
    nfts,
    collections,
    filteredNFTs,
    loading,
    selectedCollection,
    setSelectedCollection,
    refetch: fetchNFTs,
  };
}
