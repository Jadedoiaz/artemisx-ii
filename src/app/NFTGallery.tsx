import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, List, ImageOff } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNFTs } from '../hooks/useNFTs';
import { useSettingsStore } from '../stores/settingsStore';

export const NFTGallery: React.FC = () => {
  const { publicKey } = useWallet();
  const { nfts, collections, loading, error } = useNFTs(publicKey?.toBase58());
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string>('all');
  const heliusApiKey = useSettingsStore((s) => s.heliusApiKey);

  const filtered = filter === 'all' ? nfts : nfts.filter((n) => n.collection === filter);

  if (!heliusApiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-theme-muted">
        <ImageOff size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium text-theme-primary">Helius API Key Required</p>
        <p className="mt-1 text-sm">Add your Helius API key in Settings to load NFTs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-theme-secondary" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-400">
        <p className="text-lg font-medium">Failed to load NFTs</p>
        <p className="mt-1 text-sm text-theme-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              filter === 'all' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-theme bg-theme-secondary text-theme-secondary'
            }`}
          >
            All ({nfts.length})
          </button>
          {collections.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c!)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                filter === c ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-theme bg-theme-secondary text-theme-secondary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border border-theme bg-theme-secondary p-1">
          <button onClick={() => setView('grid')} className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-theme-card text-theme-primary' : 'text-theme-muted'}`}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setView('list')} className={`rounded-md p-1.5 ${view === 'list' ? 'bg-theme-card text-theme-primary' : 'text-theme-muted'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-theme-muted">
          <ImageOff size={40} className="mb-3 opacity-40" />
          <p>No NFTs found in this wallet.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((nft, i) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group cursor-pointer overflow-hidden rounded-xl border border-theme bg-theme-card transition-transform hover:scale-[1.02]"
            >
              <div className="aspect-square bg-theme-secondary">
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center text-theme-muted">
                    <ImageOff size={32} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-theme-primary">{nft.name}</p>
                {nft.collection && <p className="truncate text-xs text-theme-muted">{nft.collection}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((nft) => (
            <div key={nft.id} className="flex items-center gap-3 rounded-xl border border-theme bg-theme-card p-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-theme-secondary">
                {nft.image ? <img src={nft.image} alt={nft.name} className="h-full w-full object-cover" /> : <ImageOff size={20} className="m-3 text-theme-muted" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-theme-primary">{nft.name}</p>
                {nft.collection && <p className="truncate text-xs text-theme-muted">{nft.collection}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
