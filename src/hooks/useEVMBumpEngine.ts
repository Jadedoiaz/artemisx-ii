import { useState, useCallback, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { useSettingsStore } from '../stores/settingsStore';
import { useBumpStore } from '../stores/bumpStore';
import { sendNotification } from '../lib/notifications';

export interface EVMBumpEngine {
  bump: (amountEth: number) => Promise<void>;
  sendBump: (amountEth: number) => Promise<void>;
  isBumping: boolean;
  autoBump: boolean;
  startAuto: (amountEth: number, intervalSec: number) => void;
  startAutoBump: (amountEth: number, intervalSec: number) => void;
  stopAuto: () => void;
  stopAutoBump: () => void;
}

export function useEVMBumpEngine(chain: 'bsc' | 'ethereum' = 'bsc'): EVMBumpEngine {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { maxBumpAmount, cooldownMs, discordWebhookUrl } = useSettingsStore();
  const addTx = useBumpStore((s) => s.addTransaction);
  const setBumping = useBumpStore((s) => s.setBumping);

  const [autoBump, setAutoBump] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bump = useCallback(async (amountEth: number) => {
    if (!address || !walletClient) return;
    const safeAmount = Math.min(amountEth, maxBumpAmount / 1e9);
    const wei = parseEther(String(safeAmount));
    setBumping(true);

    try {
      const tx = await walletClient.sendTransaction({
        to: address,
        value: wei,
      });

      addTx({
        id: tx,
        chain,
        type: 'bump',
        amount: safeAmount,
        status: 'success',
        txId: tx,
        timestamp: Date.now(),
        from: address,
        to: address,
      });

      sendNotification({ title: 'Bump Successful', body: `Sent ${safeAmount} ${chain === 'bsc' ? 'BNB' : 'ETH'} on ${chain}` });

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
        amount: safeAmount,
        status: 'failed',
        timestamp: Date.now(),
        from: address,
        to: address,
      });
      sendNotification({ title: 'Bump Failed', body: err.message || 'Transaction failed' });
    } finally {
      setBumping(false);
    }
  }, [address, walletClient, chain, maxBumpAmount, addTx, discordWebhookUrl, setBumping]);

  const startAuto = useCallback((amountEth: number, intervalSec: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAutoBump(true);
    sendNotification({ title: 'Auto-Bump Started', body: `Sending every ${intervalSec}s` });
    intervalRef.current = setInterval(() => {
      bump(amountEth);
    }, Math.max(intervalSec * 1000, cooldownMs));
  }, [bump, cooldownMs]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAutoBump(false);
    sendNotification({ title: 'Auto-Bump Stopped', body: 'Manual stop triggered' });
  }, []);

  return {
    bump,
    sendBump: bump,
    isBumping: false,
    autoBump,
    startAuto,
    startAutoBump: startAuto,
    stopAuto,
    stopAutoBump: stopAuto,
  };
}
