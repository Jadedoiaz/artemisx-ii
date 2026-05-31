import { motion, Variants } from 'framer-motion';
import { useWalletData } from '../hooks/useWalletData';
import { useEVMWalletData } from '../hooks/useEVMWalletData';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { useEVMPrices } from '../hooks/useEVMPrices';
import { useBumpStore } from '../stores/bumpStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { Zap, TrendingUp, TrendingDown, Activity, Wallet, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
};

function StatCard({ icon: Icon, label, value, color, loading }: { icon: any; label: string; value: string | number; color: string; loading?: boolean }) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="bg-surface border border-border rounded-xl p-4 md:p-6 cursor-default"
    >
      <div className="flex items-center gap-3 mb-2 md:mb-3">
        <div className={cn('p-2 rounded-lg', color)}>
          <Icon size={18} />
        </div>
        <span className="text-xs md:text-sm text-muted">{label}</span>
      </div>
      <p className={cn('text-xl md:text-2xl font-bold', loading && 'animate-pulse text-muted')}>
        {loading ? '...' : value}
      </p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { bumpCount, successCount, isBumping } = useBumpStore();

  // Solana
  const { connected: solanaConnected, solBalance, tokens, loading: solanaLoading, refetch: refetchSolana } = useWalletData();
  const { publicKey } = useWallet();

  // EVM
  const { isConnected: evmConnected, balances: evmBalances } = useEVMWalletData();
  const { address: evmAccount } = useAccount();

  // Prices
  const allMints = ['So11111111111111111111111111111111111111112', ...tokens.map(t => t.mint)];
  const { prices: solPrices, loading: solPricesLoading, refetch: refetchSolPrices } = useTokenPrices(allMints);
  const { prices: evmPrices, loading: evmPricesLoading, refetch: refetchEVMPrices } = useEVMPrices(['ethereum', 'bsc']);

  const solPrice = solPrices['So11111111111111111111111111111111111111112']?.current_price || 0;
  const solChange = solPrices['So11111111111111111111111111111111111111112']?.price_change_percentage_24h || 0;

  // Real EVM prices
  const ethPrice = evmPrices['ethereum']?.current_price || 0;
  const ethChange = evmPrices['ethereum']?.price_change_percentage_24h || 0;
  const bnbPrice = evmPrices['bsc']?.current_price || 0;
  const bnbChange = evmPrices['bsc']?.price_change_percentage_24h || 0;

  // Calculate totals per chain
  const solanaValue = solBalance * solPrice + tokens.reduce((acc, t) => {
    const price = solPrices[t.mint]?.current_price;
    return acc + (price ? t.balance * price : 0);
  }, 0);

  const ethBalance = evmBalances.find(b => b.chain === 'ethereum')?.balance || 0;
  const bscBalance = evmBalances.find(b => b.chain === 'bsc')?.balance || 0;

  const totalValue = solanaValue + (ethBalance * ethPrice) + (bscBalance * bnbPrice);
  const totalWallets = (solanaConnected ? 1 : 0) + (evmConnected ? 1 : 0);

  const isLoading = solanaLoading || solPricesLoading || evmPricesLoading;
  const successRate = bumpCount > 0 ? ((successCount / bumpCount) * 100).toFixed(1) + '%' : '0%';

  const handleRefresh = () => {
    refetchSolana();
    refetchSolPrices();
    refetchEVMPrices();
  };

  return (
    <motion.div 
      className="space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <p className="text-muted mt-1 text-sm">Multi-chain overview</p>
        </div>
        {(solanaConnected || evmConnected) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-surface-highlight border border-border rounded-lg text-sm hover:border-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
        )}
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={Zap}
          label="Total Bumps"
          value={bumpCount}
          color="bg-accent/10 text-accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Success Rate"
          value={successRate}
          color="bg-success/10 text-success"
        />
        <StatCard
          icon={Activity}
          label="Status"
          value={isBumping ? 'Active' : 'Idle'}
          color={isBumping ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}
        />
        <StatCard
          icon={Wallet}
          label="Portfolio Value"
          value={totalValue > 0 ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
          color="bg-warning/10 text-warning"
          loading={isLoading && (solanaConnected || evmConnected)}
        />
      </div>

      {/* Multi-chain wallet cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <motion.div 
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="bg-surface border border-border rounded-xl p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm font-medium">Solana</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${solanaConnected ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
              {solanaConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <p className="text-lg font-bold">{solanaConnected ? `${solBalance.toFixed(4)} SOL` : '—'}</p>
          <p className="text-xs text-muted">{solanaConnected && solPrice > 0 ? `$${(solBalance * solPrice).toFixed(2)}` : ''}</p>
          {solanaConnected && solChange !== 0 && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${solChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {solChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(solChange).toFixed(2)}% (24h)
            </p>
          )}
        </motion.div>

        <motion.div 
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="bg-surface border border-border rounded-xl p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium">BSC</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${evmConnected && bscBalance > 0 ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
              {evmConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <p className="text-lg font-bold">{evmConnected ? `${bscBalance.toFixed(6)} BNB` : '—'}</p>
          <p className="text-xs text-muted">{evmConnected && bnbPrice > 0 ? `$${(bscBalance * bnbPrice).toFixed(2)}` : ''}</p>
          {evmConnected && bnbChange !== 0 && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${bnbChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {bnbChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(bnbChange).toFixed(2)}% (24h)
            </p>
          )}
        </motion.div>

        <motion.div 
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="bg-surface border border-border rounded-xl p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">Ethereum</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${evmConnected && ethBalance > 0 ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
              {evmConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <p className="text-lg font-bold">{evmConnected ? `${ethBalance.toFixed(6)} ETH` : '—'}</p>
          <p className="text-xs text-muted">{evmConnected && ethPrice > 0 ? `$${(ethBalance * ethPrice).toFixed(2)}` : ''}</p>
          {evmConnected && ethChange !== 0 && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${ethChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {ethChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(ethChange).toFixed(2)}% (24h)
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* Portfolio snapshot */}
      {solanaConnected && (
        <motion.div variants={itemVariants} className="bg-surface border border-border rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm md:text-base">Portfolio Snapshot</h3>
            <span className={`text-sm flex items-center gap-1 ${solChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {solChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(solChange).toFixed(2)}% (24h)
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-surface-highlight border border-border rounded-lg p-3 md:p-4">
              <p className="text-xs text-muted">SOL Balance</p>
              <p className="text-base md:text-lg font-bold">{solBalance.toFixed(4)} SOL</p>
              <p className="text-xs text-muted">${(solBalance * solPrice).toFixed(2)}</p>
            </div>
            <div className="bg-surface-highlight border border-border rounded-lg p-3 md:p-4">
              <p className="text-xs text-muted">Tokens</p>
              <p className="text-base md:text-lg font-bold">{tokens.length}</p>
              <p className="text-xs text-muted">SPL assets</p>
            </div>
            <div className="bg-surface-highlight border border-border rounded-lg p-3 md:p-4">
              <p className="text-xs text-muted">SOL Price</p>
              <p className="text-base md:text-lg font-bold">${solPrice > 0 ? solPrice.toFixed(2) : '—'}</p>
              <p className="text-xs text-muted">USD</p>
            </div>
            <div className="bg-surface-highlight border border-border rounded-lg p-3 md:p-4">
              <p className="text-xs text-muted">Total Value</p>
              <p className="text-base md:text-lg font-bold">${totalValue > 0 ? totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</p>
              <p className="text-xs text-muted">USD</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div variants={itemVariants} className="bg-surface border border-border rounded-xl p-4 md:p-6">
          <h3 className="font-semibold mb-4 text-sm md:text-base">Quick Bump</h3>
          <div className="flex gap-2">
            {['Solana', 'BSC', 'ETH'].map((chain) => (
              <motion.button
                key={chain}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 bg-surface-highlight hover:bg-accent/20 border border-border hover:border-accent rounded-lg text-sm font-medium transition-all"
              >
                {chain}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface border border-border rounded-xl p-4 md:p-6">
          <h3 className="font-semibold mb-4 text-sm md:text-base">Recent Activity</h3>
          <div className="space-y-2 text-sm text-muted">
            <p>No recent transactions. Start bumping to see activity here.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
