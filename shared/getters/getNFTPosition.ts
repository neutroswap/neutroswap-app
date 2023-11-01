export const dynamic = "force dynamic";

import { MulticallResults, formatEther, getContract } from "viem";
import { DEFAULT_CHAIN_ID } from "../types/chain.types";
import { tokens } from "../statics/tokenList";
import { Token, Tokenss } from "../types/tokens.types";
import { Client, cacheExchange, fetchExchange } from "@urql/core";
import { urls } from "../config/urls";
// import { getNitroCompatibleLPList } from "../gql/queries/factory";
import { getSPNFTPositions } from "../gql/queries/nft";
// import { contracts } from "../config/contracts";
import { NEUTRO_HELPER_ABI } from "../abi";
import { readContracts } from "wagmi/actions";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { GetSpnftPositionsQuery } from "../gql/types/nft/graphql";
import { getNitroCompatibleLPList } from "../gql/queries/factory";

dayjs.extend(utc);

export type Response = {
  id: `0x${string}`;
  lpToken: `0x${string}`;
  tokenId: `0x${string}`;
  assets: {
    token0: Tokenss;
    token1: Tokenss;
  };
  lockDuration: string;
  endLockTime: string;
  amount: string; // in LP
  apr: {
    base: number;
    fees: number;
    nitro: number;
    multiplier: {
      lock: number;
      boost: number;
    };
  };
  settings: {
    yield_bearing: boolean;
    lock: boolean;
    boost: boolean;
    nitro: `0x${string}`;
  };
};

//NOTE: Lowercase contract address map
const addressToTokenLogoMap = new Map(
  tokens[DEFAULT_CHAIN_ID].map((item) => [
    item.address.toLowerCase(),
    item.logo,
  ])
);

const factoryClient = new Client({
  url: urls[DEFAULT_CHAIN_ID].FACTORY_GRAPH_URL,
  exchanges: [cacheExchange, fetchExchange],
});

const nftClient = new Client({
  url: "http://13.59.70.85:8000/subgraphs/name/neutroswap-nitro",
  exchanges: [cacheExchange, fetchExchange],
});

const NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT =
  process.env.NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT;

export default async function getNFTPosition(
  address: `0x${string}`
): Promise<Array<Response> | undefined> {
  // GET USER NFT POSITION
  const res = await nftClient
    .query(getSPNFTPositions, {
      address: address,
    })
    .toPromise();

  if (!res.data) throw new Error("Failed to fetch nitro list");
  if (!res.data.userInNFtPool) throw new Error("User has no nft");
  if (!res.data.userInNFtPool.nftPoolToken)
    throw new Error("User has no nft pool");

  const ownedNftPoolToken = res.data.userInNFtPool.nftPoolToken;
  const lpTokenToUserOwnedNftPool = new Map(
    res.data.userInNFtPool.nftPoolToken.map(({ nftPool }) => {
      return [nftPool.lpToken, nftPool.id];
    })
  );

  const aprByNftToken = await getAllAprForSpnft(ownedNftPoolToken);

  // GET PAIR INFORMATION
  const nitroRes = await factoryClient
    .query(getNitroCompatibleLPList, {
      pool_list: Array.from(lpTokenToUserOwnedNftPool.keys()),
      start_date: dayjs().utc().subtract(7, "days").startOf("day").unix(),
    })
    .toPromise();
  if (!nitroRes.data) throw new Error("Failed to fetch nitro compatible pool");

  const nitroMap = new Map(
    nitroRes.data.pairs.map((item) => {
      const token0Logo = addressToTokenLogoMap.get(item.token0.id) ?? "";
      const token1Logo = addressToTokenLogoMap.get(item.token1.id) ?? "";
      const sevenDaysFeeUsd = item.pairDayData.reduce((prev, curr) => {
        return prev + parseFloat(curr.dailyFeeUSD);
      }, 0);
      const feeApr = ((sevenDaysFeeUsd * 54) / +item.reserveUSD) * 100;
      return [
        item.id, // key is lowercase address
        {
          ...item,
          token0: {
            name: item.token0.name,
            symbol: item.token0.symbol,
            decimal: +item.token0.decimals,
            logo: token0Logo,
            address: item.token0.id as `0x${string}`,
          },
          token1: {
            name: item.token1.name,
            symbol: item.token1.symbol,
            decimal: +item.token1.decimals,
            logo: token1Logo,
            address: item.token1.id as `0x${string}`,
          },
          feeApr: feeApr,
        },
      ];
    })
  );

  let data: Response[] = [];
  res.data.userInNFtPool.nftPoolToken.forEach(
    ({ nftPool, amountLpToken, ...rest }) => {
      const nitroCompatibleLPData = nitroMap.get(nftPool.lpToken);
      const aprBreakdown = aprByNftToken.get(rest.id) ?? {
        base: 0,
        fees: 0,
        nitro: 0,
        multiplier: {
          lock: 0,
          boost: 0,
        },
      };
      if (!nitroCompatibleLPData) return;
      data.push({
        id: nftPool.id as `0x${string}`,
        lpToken: nftPool.lpToken as `0x${string}`,
        tokenId: rest.tokenId,
        assets: {
          token0: nitroCompatibleLPData.token0,
          token1: nitroCompatibleLPData.token1,
        },
        lockDuration: rest.lockDuration,
        amount: formatEther(amountLpToken),
        endLockTime: rest.endLockTime,
        apr: {
          ...aprBreakdown,
          fees: nitroCompatibleLPData.feeApr,
        },
        settings: {
          yield_bearing: false, //TODO: Yield bearing data
          lock: Boolean(+rest.lockDuration),
          boost: Boolean(+rest.boostPoints),
          nitro: rest.stakedInNitroPool,
        },
      });
    }
  );
  return data;
}

type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};

async function getAllAprForSpnft(
  ownedNftPoolToken: NonNullable<
    NonNullable<GetSpnftPositionsQuery["userInNFtPool"]>["nftPoolToken"]
  >
): Promise<Map<string, Response["apr"]>> {
  // base: number => is base fee from nftPoolApr()
  // bonus: number => is fee from bonus lock (multiplier) by calling getSpNftBoostMultiplier(address,tokenId)
  // fees: number => fee apr is received from dayData on esper-factory subgraph
  // nitro: number => get nitro apr by calling `nitroPoolApr()` in esper helper

  // GET APR INFORMATION PER NFT TOKEN
  const helperContract = getContract({
    address: NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT as `0x${string}`,
    abi: NEUTRO_HELPER_ABI,
  });

  // WARNING: all params are optional because we need the length of the array here.
  const composeMulticall = (nftPool?: `0x${string}`, tokenId?: bigint) =>
    [
      {
        ...helperContract,
        functionName: "nftPoolApr",
        args: [nftPool!],
      },
      {
        ...helperContract,
        functionName: "getSpNftLockMultiplier",
        args: [nftPool!, tokenId!],
      } as const,
      {
        ...helperContract,
        functionName: "getSpNftBoostMultiplier",
        args: [nftPool!, tokenId!],
      } as const,
      {
        ...helperContract,
        functionName: "nitroPoolAprByNftPoolWithSpecificTokenId",
        args: [nftPool!, tokenId!],
      } as const,
    ] as const;

  const constructedMulticall = ownedNftPoolToken.flatMap((item) => {
    return composeMulticall(
      item.nftPool.id as `0x${string}`,
      BigInt(item.tokenId)
    );
  });

  const result = await readContracts({
    allowFailure: false,
    contracts: constructedMulticall,
  });

  let chunkedResult: MulticallResults<
    Mutable<ReturnType<typeof composeMulticall>>,
    false
  >[] = [];
  for (let i = 0; i < result.length; i += composeMulticall().length) {
    chunkedResult.push(result.slice(i, i + composeMulticall().length) as any);
  }

  return new Map(
    chunkedResult.map((item, index) => {
      const [nftPoolApr, lockMultiplier, boostMultiplier, nitroPoolApr] = item;
      return [
        ownedNftPoolToken[index].id,
        {
          base: parseFloat(formatEther(nftPoolApr)),
          fees: 0,
          nitro:
            parseFloat(formatEther(nitroPoolApr[0])) +
            parseFloat(formatEther(nitroPoolApr[1])),
          multiplier: {
            lock: lockMultiplier
              ? (Number(lockMultiplier) * Number(BigInt(1))) / 10000
              : 0,
            boost: boostMultiplier
              ? (Number(boostMultiplier) * Number(BigInt(1))) / 10000
              : 0,
          },
        },
      ];
    })
  );
}
