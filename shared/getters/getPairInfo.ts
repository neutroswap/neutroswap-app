import { NEUTRO_POOL_ABI } from "../abi";
import { publicClient } from "../types/client";
import { Token } from "../types/tokens.types";
import getTokenInfo from "../getters/getTokenInfo";

export default async function getPairInfo(
  pool: `0x${string}`
): Promise<[Token | undefined, Token | undefined]> {
  const poolContract = {
    address: pool,
    abi: NEUTRO_POOL_ABI,
  };

  const [token0, token1] = await publicClient.multicall({
    allowFailure: true,
    contracts: [
      { ...poolContract, functionName: "token0" },
      { ...poolContract, functionName: "token1" },
    ],
  });

  if (!token0.result || !token1.result) {
    return [undefined, undefined];
  }

  const token0Info = await getTokenInfo(token0.result);
  const token1Info = await getTokenInfo(token1.result);
  return [token0Info, token1Info];
}
