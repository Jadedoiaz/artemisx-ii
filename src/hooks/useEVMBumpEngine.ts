import { useState, useCallback, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { useSettingsStore } from '../stores/settingsStore';
import { useBumpStore } from '../stores/bumpStore';
import { sendNotification } from '../lib/notifications';

export function useEVMBumpEngine(chain: 'bsc' | 'ethereum') {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { maxBumpAmount, cooldownMs, discordWebhookUrl } = useSettingsStore();
  const addTx = useBumpStore((s) => s.addTransaction);

  const [isBumping, setIsBumping] = useState(false);
  const [autoBump, setAutoBump] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bump = useCallback(async (amountEth: number) => {
    if (!address || !walletClient) return;
    const wei = parseEther(String(Math.min(amountEth, maxBumpAmount / 1e9)));

    try {
      const tx = await walletClient.sendTransaction({
        to: address,
        value: wei,
      });

      addTx({
        id: tx,
        chain,
        type: 'bump',
        amount: amountEth,
        status: 'success',
        txId: tx,
        timestamp: Date.now(),
        from: address,
        to: address,
      });

      sendNotification('Bump Successful', `Sent ${amountEth} ${chain === 'bsc' ? 'BNB' : 'ETH'} on ${chain}`);

      if (discordWebhookUrl) {
        const explorer = chain === 'bsc' ? 'https://bscscan.com/tx/' : 'https://etherscan.io/tx/';
        fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `Bump successful: ${explorer}${tx}` }),
        }).catch(() => {});
      }
    } catch (err: any) {
      addTx({
        id: crypto.randomUUID(),
        chain,
        type: 'bump',
        amount: amountEth,
        status: 'failed',
        timestamp: Date.now(),
        from: address,
        to: address,
      });
      sendNotification('Bump Failed', err.message || 'Transaction failed');
    }
  }, [address, walletClient, chain, maxBumpAmount, addTx, discordWebhookUrl]);

  const startAuto = useCallback((amountEth: number, intervalSec: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAutoBump(true);
    sendNotification('Auto-Bump Started', `Sending every ${intervalSec}s`);
    intervalRef.current = setInterval(() => {
      bump(amountEth);
    }, Math.max(intervalSec * 1000, cooldownMs));
  }, [bump, cooldownMs]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAutoBump(false);
    sendNotification('Auto-Bump Stopped', 'Manual stop triggered');
  }, []);

  return { bump, isBumping, autoBump, startAuto, stopAuto };
}
