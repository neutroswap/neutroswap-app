
export const supportedChainID = ["17777", "15557"] as const;
export type SupportedChainID = typeof supportedChainID[number];
export const DEFAULT_CHAIN_ID = supportedChainID[0];
// export type SupportedChainID = "15557" | "17777" 
