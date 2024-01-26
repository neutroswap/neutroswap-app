import { getAddress } from "viem";
import { ERC20_ABI } from "../abi";
import { publicClient } from "../types/client";
import { Token } from "../types/tokens.types";
import { tokens } from "../statics/tokenList";
import { DEFAULT_CHAIN_ID } from "../types/chain.types";

const tokenMap = new Map(
  tokens[DEFAULT_CHAIN_ID.id].map((item) => [getAddress(item.address), item])
);

export function getTokenImageUrl(token: `0x${string}`): string {
  const checksummedAddress = getAddress(token);
  if (!tokenMap.has(checksummedAddress)) return "";
  return tokenMap.get(checksummedAddress)!.logo;
}

export default async function getTokenInfo(
  token: `0x${string}`
): Promise<Token> {
  const contract = {
    address: token,
    abi: ERC20_ABI,
  };

  const checksummedAddress = getAddress(token);

  if (!tokenMap.has(checksummedAddress)) {
    const [name, symbol, decimal] = await publicClient.multicall({
      allowFailure: false,
      contracts: [
        { ...contract, functionName: "name" },
        { ...contract, functionName: "symbol" },
        { ...contract, functionName: "decimals" },
      ],
    });

    return {
      name: name,
      address: token,
      symbol: symbol,
      logo: `/tokens/unknown.svg`,
      decimal: Number(decimal),
    };
  }

  return tokenMap.get(checksummedAddress)!;
}
