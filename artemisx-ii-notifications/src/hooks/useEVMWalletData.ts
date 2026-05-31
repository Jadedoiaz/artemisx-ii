import { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { mainnet, bsc } from 'viem/chains';
import { formatEther } from 'viem';

export interface EVMBalance {
  chain: string;
  symbol: string;
  balance: number;
  decimals: number;
}

export function useEVMWalletData() {
  const { address, isConnected, chainId } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    chainId: mainnet.id,
    query: { enabled: isConnected },
  });
  const { data: bscBalance } = useBalance({
    address,
    chainId: bsc.id,
    query: { enabled: isConnected },
  });

  const [balances, setBalances] = useState<EVMBalance[]>([]);

  useEffect(() => {
    const newBalances: EVMBalance[] = [];
    if (ethBalance) {
      newBalances.push({
        chain: 'ethereum',
        symbol: 'ETH',
        balance: parseFloat(formatEther(ethBalance.value)),
        decimals: 18,
      });
    }
    if (bscBalance) {
      newBalances.push({
        chain: 'bsc',
        symbol: 'BNB',
        balance: parseFloat(formatEther(bscBalance.value)),
        decimals: 18,
      });
    }
    setBalances(newBalances);
  }, [ethBalance, bscBalance]);

  return {
    address,
    isConnected,
    chainId,
    balances,
  };
}
