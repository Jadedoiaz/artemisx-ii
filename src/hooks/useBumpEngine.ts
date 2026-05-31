import { useState, useCallback, useRef } from 'react';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useBumpStore } from '../stores/bumpStore';
import { sendNotification } from '../lib/notifications';

export function useBumpEngine() {
  const { publicKey, signTransaction } = useWallet();
  const { solanaRpcUrl, maxBumpAmount, cooldownMs, discordWebhookUrl } = useSettingsStore();
  const addTx = useBumpStore((s) => s.addTransaction);

  const [isBumping, setIsBumping] = useState(false);
  const [autoBump, setAutoBump] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bump = useCallback(async (amountLamports: number) => {
    if (!publicKey || !signTransaction) return;
    const safeAmount = Math.min(amountLamports, maxBumpAmount);

    try {
      const connection = new Connection(solanaRpcUrl, 'confirmed');
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: safeAmount,
        })
      );
      tx.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      addTx({
        id: sig,
        chain: 'solana',
        type: 'bump',
        amount: safeAmount / 1e9,
        status: 'success',
        txId: sig,
        timestamp: Date.now(),
        from: publicKey.toBase58(),
        to: publicKey.toBase58(),
      });

      sendNotification('Bump Successful', `Sent ${(safeAmount / 1e9).toFixed(4)} SOL on Solana`);

      if (discordWebhookUrl) {
        fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `Bump successful: https://solscan.io/tx/${sig}` }),
        }).catch(() => {});
      }
    } catch (err: any) {
      addTx({
        id: crypto.randomUUID(),
        chain: 'solana',
        type: 'bump',
        amount: safeAmount / 1e9,
        status: 'failed',
        timestamp: Date.now(),
        from: publicKey.toBase58(),
        to: publicKey.toBase58(),
      });
      sendNotification('Bump Failed', err.message || 'Transaction failed');
    }
  }, [publicKey, signTransaction, solanaRpcUrl, maxBumpAmount, addTx, discordWebhookUrl]);

  const startAuto = useCallback((amountLamports: number, intervalSec: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAutoBump(true);
    sendNotification('Auto-Bump Started', `Sending every ${intervalSec}s`);
    intervalRef.current = setInterval(() => {
      bump(amountLamports);
    }, Math.max(intervalSec * 1000, cooldownMs));
  }, [bump, cooldownMs]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAutoBump(false);
    sendNotification('Auto-Bump Stopped', 'Manual stop triggered');
  }, []);

  return { bump, isBumping, autoBump, startAuto, stopAuto };
}
