import { useBumpStore } from '../stores/bumpStore';
import { useEffect, useState } from 'react';

const chainData = [
  { name: 'Solana', value: 45, color: '#7c3aed' },
  { name: 'BSC', value: 30, color: '#eab308' },
  { name: 'Ethereum', value: 25, color: '#3b82f6' },
];

const weeklyData = [
  { day: 'Mon', bumps: 12 },
  { day: 'Tue', bumps: 19 },
  { day: 'Wed', bumps: 8 },
  { day: 'Thu', bumps: 24 },
  { day: 'Fri', bumps: 15 },
  { day: 'Sat', bumps: 32 },
  { day: 'Sun', bumps: 18 },
];

// Dynamically import recharts components
let RechartsModule: any = null;

export default function Analytics() {
  const { bumpCount, successCount, transactions } = useBumpStore();
  const [chartsLoaded, setChartsLoaded] = useState(false);

  // Lazy load recharts on mount
  useEffect(() => {
    let cancelled = false;
    import('recharts').then((mod) => {
      if (!cancelled) {
        RechartsModule = mod;
        setChartsLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Calculate chain distribution from actual transactions
  const solanaTxs = transactions.filter(t => t.chain === 'solana').length;
  const bscTxs = transactions.filter(t => t.chain === 'bsc').length;
  const ethTxs = transactions.filter(t => t.chain === 'ethereum').length;
  const total = Math.max(solanaTxs + bscTxs + ethTxs, 1);

  const realChainData = [
    { name: 'Solana', value: Math.round((solanaTxs / total) * 100) || 33, color: '#7c3aed' },
    { name: 'BSC', value: Math.round((bscTxs / total) * 100) || 33, color: '#eab308' },
    { name: 'Ethereum', value: Math.round((ethTxs / total) * 100) || 34, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted mt-1">Performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-muted mb-1">Total Bumps</p>
          <p className="text-3xl font-bold">{bumpCount}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-muted mb-1">Successful</p>
          <p className="text-3xl font-bold text-success">{successCount}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-muted mb-1">Success Rate</p>
          <p className="text-3xl font-bold">
            {bumpCount > 0 ? ((successCount / bumpCount) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {!chartsLoaded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6 h-[320px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted">Loading charts...</p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6 h-[320px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted">Loading charts...</p>
            </div>
          </div>
        </div>
      )}

      {chartsLoaded && RechartsModule && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Weekly Activity</h3>
            <RechartsModule.ResponsiveContainer width="100%" height={250}>
              <RechartsModule.BarChart data={weeklyData}>
                <RechartsModule.CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <RechartsModule.XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <RechartsModule.YAxis stroke="#64748b" fontSize={12} />
                <RechartsModule.Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <RechartsModule.Bar dataKey="bumps" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </RechartsModule.BarChart>
            </RechartsModule.ResponsiveContainer>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Chain Distribution</h3>
            <RechartsModule.ResponsiveContainer width="100%" height={250}>
              <RechartsModule.PieChart>
                <RechartsModule.Pie
                  data={realChainData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {realChainData.map((entry: any, index: number) => (
                    <RechartsModule.Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsModule.Pie>
                <RechartsModule.Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
              </RechartsModule.PieChart>
            </RechartsModule.ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {realChainData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                  <span className="text-muted">{c.name}</span>
                  <span className="text-white font-mono">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
