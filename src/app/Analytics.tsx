import { useBumpStore } from '../stores/bumpStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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

export default function Analytics() {
  const { bumpCount, successCount, transactions } = useBumpStore();

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#12121a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
              />
              <Bar dataKey="bumps" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Chain Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={realChainData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {realChainData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#12121a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
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
    </div>
  );
}
