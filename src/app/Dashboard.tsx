import { useWalletData } from '../hooks/useWalletData';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { useBumpStore } from '../stores/bumpStore';
import { Zap, TrendingUp, Activity, Clock, Wallet, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

function StatCard({ icon: Icon, label, value, color, loading }: { icon: any; label: string; value: string | number; color: string; loading?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('p-2 rounded-lg', color)}>
          <Icon size={20} />
        </div>
        <span className="text-sm text-muted">{label}</span>
      </div>
      <p className={cn('text-2xl font-bold', loading && 'animate-pulse text-muted')}>
        {loading ? '...' : value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { bumpCount, successCount, isBumping } = useBumpStore();
  const { connected, solBalance, tokens, loading: walletLoading, refetch } = useWalletData();

  const allMints = ['So11111111111111111111111111111111111111112', ...tokens.map(t => t.mint)];
  const { prices, loading: pricesLoading } = useTokenPrices(allMints);

  const solPrice = prices['So11111111111111111111111111111111111111112']?.current_price || 0;
  const tokenValue = tokens.reduce((acc, t) => {
    const price = prices[t.mint]?.current_price;
    return acc + (price ? t.balance * price : 0);
  }, 0);
  const totalValue = solBalance * solPrice + tokenValue;
  const solChange = prices['So11111111111111111111111111111111111111112']?.price_change_percentage_24h || 0;

  const isLoading = walletLoading || pricesLoading;
  const successRate = bumpCount > 0 ? ((successCount / bumpCount) * 100).toFixed(1) + '%' : '0%';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted mt-1">Overview of your bump activity</p>
        </div>
        {connected && (
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-surface-highlight border border-border rounded-lg text-sm hover:border-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} />
            Refresh
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          value={connected && totalValue > 0 ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
          color="bg-warning/10 text-warning"
          loading={isLoading && connected}
        />
      </div>

      {/* Portfolio mini-card */}
      {connected && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Portfolio Snapshot</h3>
            <span className={`text-sm flex items-center gap-1 ${solChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {solChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(solChange).toFixed(2)}% (24h)
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-highlight border border-border rounded-lg p-4">
              <p className="text-xs text-muted">SOL Balance</p>
              <p className="text-lg font-bold">{solBalance.toFixed(4)} SOL</p>
              <p className="text-xs text-muted">${(solBalance * solPrice).toFixed(2)}</p>
            </div>
            <div className="bg-surface-highlight border border-border rounded-lg p-4">
              <p className="text-xs text-muted">Tokens</p>
              <p className="text-lg font-bold">{tokens.length}</p>
              <p className="text-xs text-muted">SPL assets</p>
            </div>
            <div className="bg-surface-highlight border border-border rounded-lg p-4">
              <p className="text-xs text-muted">SOL Price</p>
              <p className="text-lg font-bold">${solPrice > 0 ? solPrice.toFixed(2) : '—'}</p>
              <p className="text-xs text-muted">USD</p>
            </div>
            <div className="bg-surface-highlight border border-border rounded-lg p-4">
              <p className="text-xs text-muted">Total Value</p>
              <p className="text-lg font-bold">${totalValue > 0 ? totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</p>
              <p className="text-xs text-muted">USD</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Quick Bump</h3>
          <div className="flex gap-2">
            {['Solana', 'BSC', 'ETH'].map((chain) => (
              <button
                key={chain}
                className="flex-1 py-3 bg-surface-highlight hover:bg-accent/20 border border-border hover:border-accent rounded-lg text-sm font-medium transition-all"
              >
                {chain}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-2 text-sm text-muted">
            <p>No recent transactions. Start bumping to see activity here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
