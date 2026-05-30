import { useWalletData } from '../hooks/useWalletData';
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
  const { connected, solBalance, tokens, loading, refetch } = useWalletData();

  const successRate = bumpCount > 0 ? ((successCount / bumpCount) * 100).toFixed(1) + '%' : '0%';
  const totalTokenValue = tokens.reduce((acc, t) => acc + (t.usdValue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted mt-1">Overview of your bump activity</p>
        </div>
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
          label="SOL Balance"
          value={connected ? `${solBalance.toFixed(4)} SOL` : 'Not connected'}
          color="bg-warning/10 text-warning"
          loading={loading && connected}
        />
      </div>

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

      {connected && tokens.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Token Holdings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tokens.slice(0, 8).map((token) => (
              <div key={token.mint} className="bg-surface-highlight border border-border rounded-lg p-4">
                <p className="text-xs text-muted font-mono truncate">{token.mint}</p>
                <p className="text-lg font-bold mt-1">{token.balance.toLocaleString()}</p>
                <p className="text-xs text-muted">{token.symbol}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
