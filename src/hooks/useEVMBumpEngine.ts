import { useCallback, useRef, useEffect } from 'react';
import { useAccount, useWalletClient, useChainId } from 'wagmi';
import { parseEther, createWalletClient, custom } from 'viem';
import { mainnet, bsc } from 'viem/chains';
import { useBumpStore } from '../stores/bumpStore';
import { useSettingsStore } from '../stores/settingsStore';
import toast from 'react-hot-toast';

export function useEVMBumpEngine() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
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

  const getExplorerUrl = (txHash: string, chain: string) => {
    if (chain === 'bsc') return `https://bscscan.com/tx/${txHash}`;
    return `https://etherscan.io/tx/${txHash}`;
  };

  const sendBump = useCallback(
    async (amountEth: number, chain: 'ethereum' | 'bsc') => {
      if (!address || !isConnected || !walletClient) {
        toast.error('Wallet not connected');
        return;
      }

      const targetChainId = chain === 'bsc' ? bsc.id : mainnet.id;
      if (chainId !== targetChainId) {
        toast.error(`Switch to ${chain.toUpperCase()} network first`);
        return;
      }

      // Convert to wei (1 ETH/BNB = 10^18 wei)
      const amountWei = parseEther(amountEth.toString());
      const maxWei = BigInt(maxBumpAmount) * BigInt(10 ** 9); // maxBumpAmount in gwei
      if (amountWei > maxWei) {
        toast.error(`Amount exceeds max limit`);
        return;
      }

      const txId = crypto.randomUUID();
      addTx({
        id: txId,
        chain,
        type: 'bump',
        amount: amountEth,
        status: 'pending',
        timestamp: Date.now(),
        from: address,
        to: address,
      });
      incrementBump();

      try {
        const txHash = await walletClient.sendTransaction({
          to: address,
          value: amountWei,
          chain: chain === 'bsc' ? bsc : mainnet,
        });

        updateTxStatus(txId, 'success', txHash);
        incrementSuccess();
        toast.success(`Bump sent: ${txHash.slice(0, 10)}...`);

        // Discord webhook
        if (discordWebhook) {
          fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'ArtemisX-II Bot',
              embeds: [{
                title: `${chain.toUpperCase()} Bump Successful`,
                description: `Sent ${amountEth} ${chain === 'bsc' ? 'BNB' : 'ETH'} self-transfer`,
                color: chain === 'bsc' ? 0xeab308 : 0x3b82f6,
                fields: [{ name: 'Transaction', value: getExplorerUrl(txHash, chain) }],
                timestamp: new Date().toISOString(),
              }],
            }),
          }).catch(() => {});
        }
      } catch (err: any) {
        updateTxStatus(txId, 'failed');
        toast.error(err.message || 'Bump failed');
      }
    },
    [address, isConnected, walletClient, chainId, maxBumpAmount, addTx, updateTxStatus, incrementBump, incrementSuccess, discordWebhook]
  );

  const startAutoBump = useCallback(
    (amountEth: number, intervalSec: number, chain: 'ethereum' | 'bsc') => {
      if (isBumping) return;
      if (!address || !isConnected) {
        toast.error('Connect wallet first');
        return;
      }

      setBumping(true);
      toast.success(`Auto-bump started: ${amountEth} ${chain === 'bsc' ? 'BNB' : 'ETH'} every ${intervalSec}s`);

      sendBump(amountEth, chain);

      intervalRef.current = setInterval(() => {
        sendBump(amountEth, chain);
      }, Math.max(intervalSec * 1000, cooldownMs));
    },
    [isBumping, address, isConnected, setBumping, sendBump, cooldownMs]
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
