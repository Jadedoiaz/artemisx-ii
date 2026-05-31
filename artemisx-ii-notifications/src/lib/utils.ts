import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleString();
}

export function shortenTx(tx: string): string {
  if (!tx || tx.length < 16) return tx;
  return `${tx.slice(0, 8)}...${tx.slice(-8)}`;
}
