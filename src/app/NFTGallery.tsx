import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNFTs } from '../hooks/useNFTs';
import { useSettingsStore } from '../stores/settingsStore';
import { Grid, List, Image, RefreshCw, ExternalLink, Layers, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

export default function NFTGallery() {
  const { connected } = useWallet();
  const { nfts, collections, filteredNFTs, loading, selectedCollection, setSelectedCollection, refetch } = useNFTs();
  const { heliusKey } = useSettingsStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);

  const selectedAsset = nfts.find(n => n.mint === selectedNFT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">NFT Gallery</h1>
          <p className="text-muted mt-1">
            {connected ? `${nfts.length} NFT${nfts.length !== 1 ? 's' : ''} across ${collections.length} collection${collections.length !== 1 ? 's' : ''}` : 'Connect wallet to view NFTs'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {connected && (
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-surface-highlight border border-border rounded-lg text-sm hover:border-accent transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
              Refresh
            </button>
          )}
          <div className="flex bg-surface-highlight border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid' ? 'bg-accent/20 text-accent' : 'text-muted hover:text-white'
              )}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list' ? 'bg-accent/20 text-accent' : 'text-muted hover:text-white'
              )}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Collection Filters */}
      {connected && collections.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCollection('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              selectedCollection === 'all'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-muted hover:text-white'
            )}
          >
            <Layers size={14} className="inline mr-1" />
            All ({nfts.length})
          </button>
          {collections.map((col) => (
            <button
              key={col.name}
              onClick={() => setSelectedCollection(col.name)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5',
                selectedCollection === col.name
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:text-white'
              )}
            >
              {col.image && (
                <img src={col.image} alt="" className="w-4 h-4 rounded-full object-cover" />
              )}
              {col.name} ({col.count})
            </button>
          ))}
        </div>
      )}

      {/* No API Key Warning */}
      {connected && !heliusKey && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-6 text-center">
          <Tag size={32} className="mx-auto mb-3 text-warning opacity-60" />
          <p className="text-warning font-medium">Helius API Key Required</p>
          <p className="text-sm text-muted mt-1">
            Add your Helius API key in Settings to load NFTs.
          </p>
        </div>
      )}

      {/* NFT Grid */}
      {connected && heliusKey && (
        <>
          {loading && filteredNFTs.length === 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-surface-highlight" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-surface-highlight rounded w-3/4" />
                    <div className="h-3 bg-surface-highlight rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredNFTs.length === 0 && (
            <div className="text-center py-16 text-muted">
              <Image size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No NFTs Found</p>
              <p className="text-sm mt-1">This wallet doesn't hold any NFTs on Solana mainnet.</p>
            </div>
          )}

          {filteredNFTs.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredNFTs.map((nft) => (
                <div
                  key={nft.mint}
                  onClick={() => setSelectedNFT(nft.mint)}
                  className="bg-surface border border-border rounded-xl overflow-hidden cursor-pointer hover:border-accent transition-colors group"
                >
                  <div className="aspect-square bg-surface-highlight relative overflow-hidden">
                    {nft.image ? (
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={32} className="text-muted opacity-30" />
                      </div>
                    )}
                    {nft.listed && (
                      <div className="absolute top-2 right-2 bg-accent/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Listed
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{nft.name}</p>
                    <p className="text-xs text-muted truncate mt-0.5">{nft.collection}</p>
                    {nft.floorPrice && (
                      <p className="text-xs text-accent mt-1">{nft.floorPrice} SOL floor</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredNFTs.length > 0 && viewMode === 'list' && (
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted border-b border-border bg-surface-highlight">
                    <th className="px-6 py-3 font-medium">NFT</th>
                    <th className="px-6 py-3 font-medium">Collection</th>
                    <th className="px-6 py-3 font-medium">Attributes</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNFTs.map((nft) => (
                    <tr key={nft.mint} className="border-b border-border/50 last:border-0 hover:bg-surface-highlight/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-highlight overflow-hidden flex-shrink-0">
                            {nft.image ? (
                              <img src={nft.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <Image size={20} className="text-muted m-2.5 opacity-30" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{nft.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{nft.collection}</td>
                      <td className="px-6 py-4 text-sm text-muted">{nft.attributes.length} traits</td>
                      <td className="px-6 py-4">
                        {nft.listed ? (
                          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Listed</span>
                        ) : (
                          <span className="text-xs bg-muted/10 text-muted px-2 py-0.5 rounded-full">Held</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`https://magiceden.io/item-details/${nft.mint}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-accent-hover"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!connected && (
        <div className="text-center py-16 text-muted">
          <Image size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Connect Your Wallet</p>
          <p className="text-sm mt-1">Connect a Solana wallet to view your NFT collection.</p>
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNFT(null)}
        >
          <div
            className="bg-surface border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-square bg-surface-highlight rounded-tl-xl md:rounded-l-xl md:rounded-tr-none overflow-hidden">
                {selectedAsset.image ? (
                  <img src={selectedAsset.image} alt={selectedAsset.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={48} className="text-muted opacity-30" />
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-accent font-medium uppercase tracking-wider">{selectedAsset.collection}</p>
                  <h2 className="text-xl font-bold mt-1">{selectedAsset.name}</h2>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`https://magiceden.io/item-details/${selectedAsset.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-accent text-white rounded-lg text-sm font-medium text-center hover:bg-accent-hover transition-colors"
                  >
                    Magic Eden
                  </a>
                  <a
                    href={`https://tensor.trade/item/${selectedAsset.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-surface-highlight border border-border text-white rounded-lg text-sm font-medium text-center hover:border-accent transition-colors"
                  >
                    Tensor
                  </a>
                </div>

                {selectedAsset.attributes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Attributes</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedAsset.attributes.map((attr, i) => (
                        <div key={i} className="bg-surface-highlight border border-border rounded-lg p-2">
                          <p className="text-[10px] text-muted uppercase">{attr.trait_type}</p>
                          <p className="text-sm font-medium truncate">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted font-mono break-all">{selectedAsset.mint}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
