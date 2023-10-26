import { ChainId } from "eth-chains";
import { SupportedChainID } from "../types/chain.types";

type Urls = {
  NFT_GRAPH_URL: string;
};

export const urls: Record<SupportedChainID, Urls> = {
  "17777": {
    NFT_GRAPH_URL: "http://13.59.70.85:8000/subgraphs/name/neutroswap-nitro",
  },

  "15557": {
    NFT_GRAPH_URL: "http://13.59.70.85:8000/subgraphs/name/neutroswap-nitro",
  },
};
