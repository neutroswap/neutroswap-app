import { ChainId } from "eth-chains";
import { SupportedChainID } from "../types/chain.types";

type Urls = {
  FACTORY_GRAPH_URL: string;
  LAUNCHPAD_GRAPH_URL: string;
  NFT_GRAPH_URL: string;
};

export const urls: Record<SupportedChainID, Urls> = {
  "17777": {
    FACTORY_GRAPH_URL: "https://mainnet.esper-gn.com/subgraphs/name/esper-amm",
    LAUNCHPAD_GRAPH_URL:
      "https://api.thegraph.com/subgraphs/name/erwinphanglius/galahad-indexer",
    NFT_GRAPH_URL: "http://13.59.70.85:8000/subgraphs/name/neutro-nftPool",
  },

  "15557": {
    FACTORY_GRAPH_URL: "http://13.59.70.85:8000/subgraphs/name/neutro-amm",
    LAUNCHPAD_GRAPH_URL:
      "http://13.59.70.85:8000/subgraphs/name/neutro-launchpad",
    NFT_GRAPH_URL: "http://13.59.70.85:8000/subgraphs/name/neutro-nftPool",
  },
};
