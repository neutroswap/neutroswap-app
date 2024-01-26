import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

const INIT_CODE_HASH =
  "0x6a80408f2fbd97a46b0c2e32cb9eff95f524b97949d4565904684a5568eed6bc";

interface PairAddressQuery {
  factoryAddress: string;
  tokenA: string;
  tokenB: string;
}

function computePairAddress(query: PairAddressQuery): string {
  const { factoryAddress, tokenA, tokenB } = query;
  const sortsBefore = (addressA: string, addressB: string) =>
    addressA.toLowerCase() < addressB.toLowerCase();
  const [token0, token1] = sortsBefore(tokenA, tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA];

  return ethers.utils.getCreate2Address(
    factoryAddress,
    ethers.utils.keccak256(
      ethers.utils.solidityPack(["address", "address"], [token0, token1])
    ),
    INIT_CODE_HASH
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { factoryAddress, tokenA, tokenB } = req.query;

  if (!factoryAddress || !tokenA || !tokenB) {
    res.status(400).json({ error: "Missing required parameter" });
    return;
  }

  const query: PairAddressQuery = {
    factoryAddress: factoryAddress as string,
    tokenA: tokenA as string,
    tokenB: tokenB as string,
  };

  try {
    const pairAddress = computePairAddress(query);
    res.status(200).json({ pairAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
