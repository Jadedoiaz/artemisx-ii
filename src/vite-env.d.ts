/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HELIUS_API_KEY: string;
  readonly VITE_DISCORD_WEBHOOK_URL: string;
  readonly VITE_SOLANA_RPC_URL: string;
  readonly VITE_COINGECKO_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
