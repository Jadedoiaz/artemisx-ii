import { useBumpStore } from '../stores/bumpStore';
import { useWalletStore } from '../stores/walletStore';
import { Zap, TrendingUp, Activity, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('p-2 rounded-lg', color)}>
          <Icon size={20} />
        </div>
        <span className="text-sm text-muted">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { bumpCount, successCount, isBumping } = useBumpStore();
  const wallets = useWalletStore((s) => s.wallets);

  const successRate = bumpCount > 0 ? ((successCount / bumpCount) * 100).toFixed(1) + '%' : '0%';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted mt-1">Overview of your bump activity</p>
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
          icon={Clock}
          label="Wallets"
          value={wallets.length}
          color="bg-warning/10 text-warning"
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
    </div>
  );
}
