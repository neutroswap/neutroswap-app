import { createPublicClient, http, Chain } from "viem";
import { DEFAULT_CHAIN_ID, customEosTestnet } from "./chain.types";
import { eos } from "viem/chains";
import { NEXT_PUBLIC_CHAIN_ID } from "../helpers/constants";

export const publicClient = createPublicClient({
  chain: DEFAULT_CHAIN_ID,
  transport: http(),
});
