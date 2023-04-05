export interface Token {
  network_id: string
  address: string
  decimal: number
  name: string
  symbol: string
  logo: string
}

export interface TokenFE {
  networkName: string
  tokenAddress: string
}

export interface LiquidityTokenFE {
  tokenAddress: string
}

export interface LiquidityToken {
  network_id: string
  address: string
  decimal: number
  name: string
  symbol: string
  logo: string
  token0: any
  token1: any
}

export interface Network{
  id: string
  name: string
  rpc: string
  chain_id: number
  logo: string
}