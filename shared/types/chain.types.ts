import { eos, eosTestnet } from "@wagmi/core/chains";

export const customEosTestnet = {
  ...eosTestnet,
  contracts: {
    multicall3: {
      address: "0x294bb4c48F762DC0AFfe9DA653E9C6E1A4011452" as `0x${string}`,
      blockCreated: 561333,
    },
  },
};

export const customEos = {
  ...eos,
  contracts: {
    multicall3: {
      address: "0xD6d6D1CA4a2caF75B9E2F8e3DAc55e6fdAA07f35" as `0x${string}`,
      blockCreated: 445,
    },
  },
};

const PRODUCTION_ENV_CHAINS = [customEos];
const STAGING_ENV_CHAINS = [customEosTestnet, customEos];
const LOCAL_ENV_CHAINS = [customEosTestnet, eos];

export const supportedChains =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? PRODUCTION_ENV_CHAINS
    : process.env.NEXT_PUBLIC_ENVIRONMENT === "staging"
    ? STAGING_ENV_CHAINS
    : LOCAL_ENV_CHAINS;

export const supportedChainID = ["17777", "15557"] as const;
// export const supportedChainID = supportedChains.map((item) => item.id);
// export type SupportedChainID = (typeof supportedChainID)[number];
export const DEFAULT_CHAIN_ID = (process.env.NEXT_PUBLIC_CHAIN_ID ??
  "17777") as SupportedChainID;
export type SupportedChainID = "15557" | "17777";

// export const DEFAULT_CHAIN_ID = supportedChains[0];
