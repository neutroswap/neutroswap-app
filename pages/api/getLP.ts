// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getNetworkById, getNetworkByName, getTokenDetails } from "./tokens";
import { BigNumber, ethers } from "ethers";
import { ERC20_ABI } from "@/shared/abi";
import { supabaseClient } from "@/shared/helpers/supabaseClient";
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from "ethereum-multicall";
import { NEUTRO_LP_TOKEN_ABI } from "@/shared/abi";

type Data = {
  data: any;
};

export async function getAllLPs() {
  const { data: liquidityTokens, error } = await supabaseClient
    .from("liquidity_tokens")
    .select("network_id,address,decimal,name,symbol,logo");
  console.log("Error ", error);
  return liquidityTokens;
}

export async function getLPInfo(
  networkName: string,
  lpAddress: string,
  userAddress: string
) {
  try {
    let network: any = await getNetworkByName(networkName);

    const { data: liquidityTokens, error } = await supabaseClient
      .from("liquidity_tokens")
      .select("network_id,address,decimal,name,symbol,logo")
      .eq("address", lpAddress);
    if (!liquidityTokens) return;
    let lp = liquidityTokens[0];
    let promises = [];

    const provider = new ethers.providers.JsonRpcProvider(network.rpc, {
      chainId: network.chain_id,
      name: network.name,
      // url: network.rpc
    });

    const multicall = new Multicall({
      multicallCustomContractAddress: network.multicall_addr,
      ethersProvider: provider,
      tryAggregate: true,
    });
    let contractCallContext: ContractCallContext[] = [];
    let indexName = "LP: " + lpAddress;
    contractCallContext.push({
      reference: indexName,
      contractAddress: lpAddress,
      abi: NEUTRO_LP_TOKEN_ABI as any,
      calls: [
        {
          reference: "balance",
          methodName: "balanceOf",
          methodParameters: [userAddress],
        },
        {
          reference: "totalSupply",
          methodName: "totalSupply",
          methodParameters: [],
        },
        {
          reference: "reserves",
          methodName: "getReserves",
          methodParameters: [],
        },
        { reference: "token0", methodName: "token0", methodParameters: [] },
        { reference: "token1", methodName: "token1", methodParameters: [] },

        { reference: "devFee", methodName: "devFee", methodParameters: [] },
        { reference: "swapFee", methodName: "swapFee", methodParameters: [] },
      ],
    });
    const results: ContractCallResults = await multicall.call(
      contractCallContext
    );
    let callValues = results.results[indexName].callsReturnContext;

    let [balance, totalSupply, reserves, token0, token1, devFee, swapFee] =
      callValues;
    let balanceBN = BigInt(balance.returnValues[0].hex);
    let totalSupplyBN = BigInt(totalSupply.returnValues[0].hex);
    const poolShare = (balanceBN * BigInt(10) ** BigInt(18)) / totalSupplyBN;

    promises.push(
      supabaseClient
        .from("tokens")
        .select("address,decimal,name,symbol,logo")
        .ilike("address", token0.returnValues[0])
    );
    promises.push(
      supabaseClient
        .from("tokens")
        .select("address,decimal,name,symbol,logo")
        .ilike("address", token1.returnValues[0])
    );
    let tokens: any = await Promise.all(promises);

    let response = {
      ...lp,
      userBalance: balanceBN,
      totalSupply: totalSupply.returnValues[0],
      poolShare: poolShare,
      token0: tokens[0].data[0],
      token1: tokens[1].data[1],
      reserves: {
        r0: reserves.returnValues[0],
        r1: reserves.returnValues[1],
      },
    };
    return response;
  } catch (err) {}
}

export async function getUserLP(userAddress: any) {
  try {
    let lps: any = await getAllLPs();
    if (lps.length == 0) throw Error("lps length is 0");
    let network: any = await getNetworkById(lps[0].network_id);

    const provider = new ethers.providers.JsonRpcProvider(network.rpc, {
      chainId: network.chain_id,
      name: network.name,
      // url: network.rpc
    });
    const multicall = new Multicall({
      multicallCustomContractAddress:
        "0x294bb4c48F762DC0AFfe9DA653E9C6E1A4011452",
      ethersProvider: provider,
      tryAggregate: true,
    });
    let contractCallContext: ContractCallContext[] = [];
    let promises = [];
    let userLPs = [];

    for (let i = 0; i < lps.length; i++) {
      let lp = lps[i];
      contractCallContext.push({
        reference: "LP" + i,
        contractAddress: lp.address,
        abi: NEUTRO_LP_TOKEN_ABI as any,
        calls: [
          {
            reference: "balance",
            methodName: "balanceOf",
            methodParameters: [userAddress],
          },
          {
            reference: "totalSupply",
            methodName: "totalSupply",
            methodParameters: [],
          },
          {
            reference: "reserves",
            methodName: "getReserves",
            methodParameters: [],
          },
          { reference: "token0", methodName: "token0", methodParameters: [] },
          { reference: "token1", methodName: "token1", methodParameters: [] },

          { reference: "devFee", methodName: "devFee", methodParameters: [] },
          { reference: "swapFee", methodName: "swapFee", methodParameters: [] },
        ],
      });
      const lpTokenContract = new ethers.Contract(
        lp.address,
        ERC20_ABI,
        provider
      );
      // promises.push(lpTokenContract.balanceOf(userAddress))
    }
    const results: ContractCallResults = await multicall.call(
      contractCallContext
    );

    let data = [];
    for (let i = 0; i < lps.length; i++) {
      //get all references.
      let index: string = "LP" + i;
      let callValues = results.results[index].callsReturnContext;
      let [balance, totalSupply, reserves, token0, token1, devFee, swapFee] =
        callValues;
      let balanceBN = BigInt(balance.returnValues[0].hex);
      let totalSupplyBN = BigInt(totalSupply.returnValues[0].hex);
      const poolShare = (balanceBN * BigInt(10) ** BigInt(18)) / totalSupplyBN;

      if (balanceBN == BigInt(0)) {
      } else {
        userLPs.push({
          ...lps[i],
          userBalance: balanceBN,
          totalSupply: totalSupply.returnValues[0],
          poolShare: poolShare,
          reserves: {
            r0: reserves.returnValues[0],
            r1: reserves.returnValues[1],
          },
        });
        //supabase hit
        promises.push(
          supabaseClient
            .from("tokens")
            .select("address,decimal,name,symbol,logo")
            .eq("address", token0.returnValues[0])
        );
        promises.push(
          supabaseClient
            .from("tokens")
            .select("address,decimal,name,symbol,logo")
            .eq("address", token1.returnValues[0])
        );
        // console.log(`Balance is ${balanceBN.toString()}`)
      }
    }
    let tokens = await Promise.all(promises);
    for (let i = 0; i < tokens.length; i += 2) {
      //assign ke userLP terkait. Karena tiap LP ada 2, makanya dibagi 2 buat dapet index nya
      const token0 = tokens[i];
      const token1 = tokens[i + 1];
      if (!token0.data || !token1.data) return;
      userLPs[i / 2].token0 = token0.data[0];
      userLPs[i / 2].token1 = token1.data[0];
    }
    return userLPs;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req;

  switch (method) {
    case "GET":
      const { networkName, lpAddress, userAddress } = req.query;
      if (!networkName || !lpAddress || !userAddress) {
        res.status(400).json({ error: "Missing required parameter" });
        return;
      }
      let result = await getLPInfo(
        networkName as string,
        lpAddress as string,
        userAddress as string
      );
      let response = {
        data: result,
      };
      res.status(200).json(response);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
