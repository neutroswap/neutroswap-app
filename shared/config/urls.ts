import { ChainId } from "eth-chains";
import { SupportedChainID } from "../types/chain.types";

type Urls = {
  FACTORY_GRAPH_URL: string;
  LAUNCHPAD_GRAPH_URL: string;
  NFT_GRAPH_URL: string;
};

export const urls: Record<SupportedChainID, Urls> = {
  "17777": {
    FACTORY_GRAPH_URL:
      "https://mainnet.dbi.foundation/subgraphs/name/neutro-amm",
    LAUNCHPAD_GRAPH_URL:
      "https://mainnet.dbi.foundation/subgraphs/name/neutro-launchpad",
    NFT_GRAPH_URL: "https://mainnet.dbi.foundation/subgraphs/name/neutro-nftPool",
  },

  "15557": {
    FACTORY_GRAPH_URL:
      "https://testnet.dbi.foundation/subgraphs/name/neutro-amm",
    LAUNCHPAD_GRAPH_URL:
      "https://testnet.dbi.foundation/subgraphs/name/neutro-launchpad",
    NFT_GRAPH_URL: "https://testnet.dbi.foundation/subgraphs/name/neutro-nftPool",
  },
};
