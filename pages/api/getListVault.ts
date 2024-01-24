// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { BigNumber, ethers } from "ethers";
import { supabaseClient } from "@/shared/helpers/supabaseClient";
import { formatEther } from "ethers/lib/utils.js";
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from "ethereum-multicall";
import { NEUTRO_VAULT_ABI } from "@/shared/abi";
import { CallContext } from "ethereum-multicall/dist/esm/models";
import { CoinGeckoClient } from "coingecko-api-v3";

const coingecko = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true,
});

interface Vaults {
  totalVaultValue: string;
  vaults: Vault[];
}

interface Vault {
  pid: number;
  lockup: number;
  tokenLogo: string;
  tokenGecko: string;
  tokenPrice: number;
  valueOfVault: string; // liquidity in farm (change name later)
  totalStaked: string;
  details: VaultDetails | null;
}

interface VaultDetails {
  rps: string;
  apr: string;
}

let CACHED_NEUTRO_PRICE: any = null;
let LAST_FETCHED_NEUTRO_PRICE = 0;
let CHAIN_NAME: string;
let RPC: string;
let CHAIN_ID: any;
let MULTICALL_ADDR: string;
let VAULT_CONTRACT: string;

export async function getAllVaults(): Promise<Vault[] | null> {
  const { data: network, error } = await supabaseClient
    .from("networks")
    .select("id,name,rpc,chain_id,multicall_addr")
    .eq("name", process.env.NETWORK);

  if (!network) {
    return null;
  }

  CHAIN_NAME = network[0].name;
  RPC = network[0].rpc;
  CHAIN_ID = network[0].chain_id;
  MULTICALL_ADDR = network[0].multicall_addr;
  if (!process.env.NEXT_PUBLIC_VAULT_CONTRACT) {
    return null;
  }
  VAULT_CONTRACT = process.env.NEXT_PUBLIC_VAULT_CONTRACT;

  if (error) {
    console.log(error);
    return null;
  } else {
    let result: Vault[] = [];
    for (let i = 0; i < 4; i++) {
      let vault: Vault = {
        pid: i,
        lockup: _whichLock(i),
        tokenLogo:
          "https://iixqzxsufrbufhtizuuk.supabase.co/storage/v1/object/public/asset/neutro_logo.svg",
        tokenGecko: "neutroswap",
        tokenPrice: 0,
        valueOfVault: "",
        totalStaked: "",
        details: null,
      };
      result.push(vault);
    }
    return result;
  }
}

export async function composeData(
  vaults: Vault[] | null
): Promise<Vaults | null> {
  const provider = new ethers.providers.JsonRpcProvider(RPC, {
    chainId: CHAIN_ID,
    name: CHAIN_NAME,
    // url: network.rpc
  });

  if (!vaults) {
    return null;
  }

  let rpcCalls = [];
  let totalLpCalls = [];

  // get all pids
  const rps: CallContext[] = vaults.map((vault) => ({
    reference: "rps",
    methodName: "poolRewardsPerSec",
    methodParameters: [vault.pid],
  }));
  rpcCalls.push(...rps);

  // get all pids
  const totalLps: CallContext[] = vaults.map((vault) => ({
    reference: "totalLp",
    methodName: "poolTotalLp",
    methodParameters: [vault.pid],
    // methodParameters: [1]
  }));
  totalLpCalls.push(...totalLps);

  const multicall = new Multicall({
    multicallCustomContractAddress: MULTICALL_ADDR,
    ethersProvider: provider,
    tryAggregate: true,
  });

  let contractCallContext: ContractCallContext[] = [];
  let call1 = "rpcCalls";
  contractCallContext.push({
    reference: call1,
    contractAddress: VAULT_CONTRACT,
    abi: NEUTRO_VAULT_ABI as any,
    calls: rpcCalls,
  });

  let call2 = "totalLpCalls";
  contractCallContext.push({
    reference: call2,
    contractAddress: VAULT_CONTRACT,
    abi: NEUTRO_VAULT_ABI as any,
    calls: totalLpCalls,
  });

  const contractCalls: ContractCallResults = await multicall.call(
    contractCallContext
  );

  let totalVaultValue = 0;
  for (const vault of vaults) {
    const rpsResult = contractCalls.results[call1].callsReturnContext.filter(
      (res) => res.methodParameters[0] === vault.pid
    );
    const stakedResult = contractCalls.results[call2].callsReturnContext.filter(
      (res) => res.methodParameters[0] === vault.pid
    );

    if (rpsResult) {
      const rps = rpsResult[0].returnValues[3];
      const totalStaked = stakedResult[0].returnValues[0];

      vault.tokenPrice = parseFloat(CACHED_NEUTRO_PRICE);
      vault.totalStaked = formatEther(BigNumber.from(totalStaked.hex));
      vault.valueOfVault = (vault.tokenPrice * parseFloat(vault.totalStaked))
        .toFixed(2)
        .toString();
      vault.details = {
        apr: calculateApr(
          formatEther(BigNumber.from(rps[0].hex)),
          vault.valueOfVault
        ),
        rps: formatEther(BigNumber.from(rps[0].hex)),
      };
      totalVaultValue += parseFloat(vault.valueOfVault);
    }
  }

  let result: Vaults = {
    totalVaultValue: totalVaultValue.toFixed(2).toString(),
    vaults,
  };

  return result;
}

export function calculateApr(rps: string, valueOfVault: string): string {
  const SEC_IN_YEAR = parseFloat("31536000");
  const neutroPrice = parseFloat(CACHED_NEUTRO_PRICE);

  const rewardPerSec = parseFloat(rps);
  const value = parseFloat(valueOfVault);
  let apr = ((rewardPerSec * SEC_IN_YEAR * neutroPrice) / value) * 100;
  if (apr.toString() == "Infinity") {
    apr = 0;
  }
  return apr.toFixed(2).toString();
}

export async function getPrice(id: string): Promise<any> {
  const tokenPrice = await coingecko.simplePrice({
    ids: id,
    vs_currencies: "usd",
  });
  return tokenPrice;
}

export async function cachingNeutroPrice() {
  const currentTime = Date.now();

  try {
    if (!CACHED_NEUTRO_PRICE || currentTime - LAST_FETCHED_NEUTRO_PRICE >= 5 * 60 * 1000) {
      const newPrice = await getPrice("neutroswap");
      CACHED_NEUTRO_PRICE = newPrice["neutroswap"].usd;
      LAST_FETCHED_NEUTRO_PRICE = currentTime;
    }
    console.log("Fetched $NEUTRO effective price", CACHED_NEUTRO_PRICE);
  } catch (error) {
    console.error("Error fetching Neutro price:", error);
  }
}

function _whichLock(id: number): number {
  switch (id) {
    case 0:
      return 0;
    case 1:
      return 7;
    case 2:
      return 30;
    case 3:
      return 90;
    default:
      return 0;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req;

  switch (method) {
    case "GET":
      try {
        await cachingNeutroPrice();
        let result = await getAllVaults();
        let data = await composeData(result);
        let response = {
          data,
        };
        res.status(200).json(response);
        break;
      } catch (e) {
        res.status(400).json({ error: e });
        break;
      }
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
