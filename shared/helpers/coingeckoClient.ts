import { CoinGeckoClient } from 'coingecko-api-v3'

export const coinGeckoClient = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true
})