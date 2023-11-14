import { createPublicClient, http, Chain } from "viem";
import { DEFAULT_CHAIN_ID, customEosTestnet } from "./chain.types";
import { eos } from "viem/chains";

export const publicClient = createPublicClient({
  chain: DEFAULT_CHAIN_ID,
  transport: http(),
});
