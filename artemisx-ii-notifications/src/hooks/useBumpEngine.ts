import { useCallback, useRef, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useBumpStore } from '../stores/bumpStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useNotifications } from './useNotifications';
import toast from 'react-hot-toast';

export function useBumpEngine() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const {
    isBumping,
    setBumping,
    addTx,
    updateTxStatus,
    incrementBump,
    incrementSuccess,
  } = useBumpStore();
  const { maxBumpAmount, cooldownMs, discordWebhook } = useSettingsStore();
  const { notify } = useNotifications();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendBump = useCallback(
    async (amountSol: number) => {
      if (!publicKey || !signTransaction || !connection) {
        toast.error('Wallet not connected');
        return;
      }

      const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
      if (amountLamports > maxBumpAmount) {
        toast.error(`Amount exceeds max limit (${maxBumpAmount} lamports)`);
        return;
      }

      const txId = crypto.randomUUID();
      addTx({
        id: txId,
        chain: 'solana',
        type: 'bump',
        amount: amountSol,
        status: 'pending',
        timestamp: Date.now(),
        from: publicKey.toBase58(),
        to: publicKey.toBase58(),
      });
      incrementBump();

      try {
        const { blockhash } = await connection.getLatestBlockhash();
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: publicKey,
            lamports: amountLamports,
          })
        );
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signed = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());

        await connection.confirmTransaction(signature, 'confirmed');

        updateTxStatus(txId, 'success', signature);
        incrementSuccess();
        toast.success(`Bump sent: ${signature.slice(0, 8)}...`);

        notify({
          title: 'Bump Successful',
          body: `Sent ${amountSol} SOL on Solana`,
          tag: 'bump-success',
        });

        if (discordWebhook) {
          fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'ArtemisX-II Bot',
              embeds: [{
                title: 'Bump Successful',
                description: `Sent ${amountSol} SOL self-transfer`,
                color: 0x7c3aed,
                fields: [{ name: 'Transaction', value: `https://solscan.io/tx/${signature}` }],
                timestamp: new Date().toISOString(),
              }],
            }),
          }).catch(() => {});
        }
      } catch (err: any) {
        updateTxStatus(txId, 'failed');
        toast.error(err.message || 'Bump failed');
        notify({
          title: 'Bump Failed',
          body: err.message || 'Transaction failed on Solana',
          tag: 'bump-failed',
        });
      }
    },
    [publicKey, signTransaction, connection, maxBumpAmount, addTx, updateTxStatus, incrementBump, incrementSuccess, discordWebhook, notify]
  );

  const startAutoBump = useCallback(
    (amountSol: number, intervalSec: number) => {
      if (isBumping) return;
      if (!publicKey) {
        toast.error('Connect wallet first');
        return;
      }

      setBumping(true);
      notify({
        title: 'Auto-Bump Started',
        body: `Sending ${amountSol} SOL every ${intervalSec}s`,
        tag: 'auto-bump-start',
      });
      toast.success(`Auto-bump started: ${amountSol} SOL every ${intervalSec}s`);

      sendBump(amountSol);

      intervalRef.current = setInterval(() => {
        sendBump(amountSol);
      }, Math.max(intervalSec * 1000, cooldownMs));
    },
    [isBumping, publicKey, setBumping, sendBump, cooldownMs, notify]
  );

  const stopAutoBump = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBumping(false);
    notify({
      title: 'Auto-Bump Stopped',
      body: 'Manual stop triggered',
      tag: 'auto-bump-stop',
    });
    toast.success('Auto-bump stopped');
  }, [setBumping, notify]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { sendBump, startAutoBump, stopAutoBump, isBumping };
}
