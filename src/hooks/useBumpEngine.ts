import { useState, useCallback, useRef } from 'react'
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSettingsStore } from '../stores/settingsStore'
import { useBumpStore } from '../stores/bumpStore'
import { sendNotification } from '../lib/notifications'

export interface BumpEngine {
  bump: (amountLamports: number) => Promise<void>
  sendBump: (amountLamports: number) => Promise<void>
  isBumping: boolean
  autoBump: boolean
  startAuto: (amountLamports: number, intervalSec: number) => void
  startAutoBump: (amountLamports: number, intervalSec: number) => void
  stopAuto: () => void
  stopAutoBump: () => void
}

export function useBumpEngine(): BumpEngine {
  const { publicKey, signTransaction } = useWallet()
  const { solanaRpcUrl, maxBumpAmount, cooldownMs, discordWebhookUrl } = useSettingsStore()
  const addTx = useBumpStore((s) => s.addTransaction)
  const setBumping = useBumpStore((s) => s.setBumping)

  const [autoBump, setAutoBump] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const bump = useCallback(async (amountLamports: number) => {
    if (!publicKey || !signTransaction) return
    const safeAmount = Math.min(amountLamports, maxBumpAmount)
    setBumping(true)

    try {
      const connection = new Connection(solanaRpcUrl, 'confirmed')
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: safeAmount,
        })
      )
      tx.feePayer = publicKey
      const { blockhash } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash

      const signed = await signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(sig, 'confirmed')

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
      })

      sendNotification({ title: 'Bump Successful', body: `Sent ${(safeAmount / 1e9).toFixed(4)} SOL on Solana` })

      if (discordWebhookUrl) {
        fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `Bump successful: https://solscan.io/tx/${sig}` }),
        }).catch(() => {})
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
      })
      sendNotification({ title: 'Bump Failed', body: err.message || 'Transaction failed' })
    } finally {
      setBumping(false)
    }
  }, [publicKey, signTransaction, solanaRpcUrl, maxBumpAmount, addTx, discordWebhookUrl, setBumping])

  const startAuto = useCallback((amountLamports: number, intervalSec: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setAutoBump(true)
    sendNotification({ title: 'Auto-Bump Started', body: `Sending every ${intervalSec}s` })
    intervalRef.current = setInterval(() => {
      bump(amountLamports)
    }, Math.max(intervalSec * 1000, cooldownMs))
  }, [bump, cooldownMs])

  const stopAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setAutoBump(false)
    sendNotification({ title: 'Auto-Bump Stopped', body: 'Manual stop triggered' })
  }, [])

  return {
    bump,
    sendBump: bump,
    isBumping: false,
    autoBump,
    startAuto,
    startAutoBump: startAuto,
    stopAuto,
    stopAutoBump: stopAuto,
  }
}
