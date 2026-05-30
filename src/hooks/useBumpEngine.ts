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

        // Discord webhook
        if (discordWebhook) {
          fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'ArtemisX-II Bot',
              embeds: [
                {
                  title: 'Bump Successful',
                  description: `Sent ${amountSol} SOL self-transfer`,
                  color: 0x7c3aed,
                  fields: [
                    {
                      name: 'Transaction',
                      value: `https://solscan.io/tx/${signature}`,
                    },
                  ],
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          }).catch(() => {});
        }
      } catch (err: any) {
        updateTxStatus(txId, 'failed');
        toast.error(err.message || 'Bump failed');
      }
    },
    [publicKey, signTransaction, connection, maxBumpAmount, addTx, updateTxStatus, incrementBump, incrementSuccess, discordWebhook]
  );

  const startAutoBump = useCallback(
    (amountSol: number, intervalSec: number) => {
      if (isBumping) return;
      if (!publicKey) {
        toast.error('Connect wallet first');
        return;
      }

      setBumping(true);
      toast.success(`Auto-bump started: ${amountSol} SOL every ${intervalSec}s`);

      sendBump(amountSol); // First bump immediately

      intervalRef.current = setInterval(() => {
        sendBump(amountSol);
      }, Math.max(intervalSec * 1000, cooldownMs));
    },
    [isBumping, publicKey, setBumping, sendBump, cooldownMs]
  );

  const stopAutoBump = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBumping(false);
    toast.success('Auto-bump stopped');
  }, [setBumping]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { sendBump, startAutoBump, stopAutoBump, isBumping };
}
