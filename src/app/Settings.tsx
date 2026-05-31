import { useSettingsStore } from '../stores/settingsStore';
import { useNotifications } from '../hooks/useNotifications';
import { Key, Shield, Palette, Webhook, Bell, BellOff, BellRing } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
  const {
    accentColor,
    maxBumpAmount,
    cooldownMs,
    discordWebhook,
    heliusKey,
    solanaRpc,
    setAccentColor,
    setMaxBump,
    setCooldown,
    setWebhook,
    setHeliusKey,
    setSolanaRpc,
  } = useSettingsStore();

  const { supported, permission, enabled, enable, disable } = useNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted mt-1">Configure your Artemis X-II instance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key size={18} className="text-accent" />
            <h3 className="font-semibold">API Keys</h3>
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Helius API Key</label>
            <input
              type="password"
              value={heliusKey}
              onChange={(e) => setHeliusKey(e.target.value)}
              placeholder="Enter your Helius API key"
              className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Discord Webhook URL</label>
            <input
              type="url"
              value={discordWebhook}
              onChange={(e) => setWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Solana RPC URL</label>
            <input
              type="url"
              value={solanaRpc}
              onChange={(e) => setSolanaRpc(e.target.value)}
              placeholder="https://api.devnet.solana.com"
              className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
            />
          </div>
        </div>

        {/* Safety Controls */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} className="text-accent" />
            <h3 className="font-semibold">Safety Controls</h3>
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Max Bump Amount (lamports)</label>
            <input
              type="number"
              value={maxBumpAmount}
              onChange={(e) => setMaxBump(Number(e.target.value))}
              className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Cooldown (milliseconds)</label>
            <input
              type="number"
              value={cooldownMs}
              onChange={(e) => setCooldown(Number(e.target.value))}
              className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
            />
          </div>
        </div>

        {/* Theme */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={18} className="text-accent" />
            <h3 className="font-semibold">Theme</h3>
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'].map((c) => (
                <button
                  key={c}
                  onClick={() => setAccentColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    accentColor === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={18} className="text-accent" />
            <h3 className="font-semibold">Push Notifications</h3>
          </div>

          {!supported && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-warning">
                <BellOff size={16} />
                <span className="text-sm font-medium">Not Supported</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Your browser does not support push notifications.
              </p>
            </div>
          )}

          {supported && permission === 'denied' && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-danger">
                <BellOff size={16} />
                <span className="text-sm font-medium">Permission Denied</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Notifications were blocked. Enable them in your browser settings to use this feature.
              </p>
            </div>
          )}

          {supported && permission !== 'denied' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Notifications</p>
                  <p className="text-xs text-muted">
                    Get alerts when bumps complete, fail, or auto-bump stops
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (enabled) {
                      disable();
                    } else {
                      enable();
                    }
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                    enabled
                      ? 'bg-success/10 text-success border border-success/30 hover:bg-success/20'
                      : 'bg-surface-highlight border border-border text-muted hover:text-white hover:border-accent'
                  )}
                >
                  {enabled ? <BellRing size={16} /> : <Bell size={16} />}
                  {enabled ? 'Enabled' : 'Enable'}
                </button>
              </div>

              {enabled && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <p className="text-xs text-success flex items-center gap-2">
                    <BellRing size={14} />
                    Notifications active. You will receive alerts for all bump events.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Webhook Test */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Webhook size={18} className="text-accent" />
            <h3 className="font-semibold">Discord Integration</h3>
          </div>

          <p className="text-sm text-muted">
            Configure your Discord webhook above to receive bump notifications in real-time.
          </p>

          <button
            onClick={() => {
              if (discordWebhook) {
                fetch(discordWebhook, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    content: 'Artemis X-II webhook test successful!',
                  }),
                }).catch((err) => console.error('Webhook test failed:', err));
              }
            }}
            disabled={!discordWebhook}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Test Webhook
          </button>
        </div>
      </div>
    </div>
  );
}
