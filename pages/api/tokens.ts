import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { ERC20_ABI } from "../../shared/abi";
import { supabaseClient } from "@/shared/helpers/supabaseClient";
import { TokenFE, Token } from "@/shared/types/tokens.types";

export async function getNetworkByName(networkName: string) {
  let currNetwork;
  let { data: network } = await supabaseClient
    .from("networks")
    .select("*")
    .eq("name", networkName);
  if (network) currNetwork = network[0];
  return currNetwork;
}

export async function getNetworkById(networkId: string) {
  let currNetwork;
  let { data: network } = await supabaseClient
    .from("networks")
    .select("*")
    .eq("id", networkId);
  if (network) currNetwork = network[0];
  return currNetwork;
}

export async function createNewToken(newToken: TokenFE) {
  let { tokenAddress, networkName } = newToken;
  let existingToken = await getTokenDetails(tokenAddress);
  if (existingToken) {
    return existingToken;
  }
  let network: any = await getNetworkByName(networkName);
  let rpc = network.rpc;

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  const [symbol, decimals] = await Promise.all([
    tokenContract.symbol().catch(() => null),
    tokenContract.decimals().catch(() => null),
  ]);

  const token: Token = {
    address: tokenAddress as `0x${string}`,
    decimal: decimals.toNumber() ?? 18,
    name: symbol,
    symbol,
    logo: "default",
  };

  let res = await supabaseClient.from("tokens").insert([token]);
  return token;
}

export async function getTokenDetails(data: string) {
  let tokenDetails;
  let errorDetails = null;
  if (data.substring(0, 2) == "0x") {
    //get by address
    const { data: tokenDetail, error } = await supabaseClient
      .from("tokens")
      .select("*")
      .eq("address", data);
    if (tokenDetail) tokenDetails = tokenDetail[0];
    if (error) errorDetails = error;
  } else {
    //get by tokenid

    const { data: tokenDetail, error } = await supabaseClient
      .from("tokens")
      .select("*")
      .eq("id", data);
    if (tokenDetail) tokenDetails = tokenDetail[0];
    if (error) errorDetails = error;
  }
  if (errorDetails) return errorDetails;
  return tokenDetails; //return errorDetails if any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req;

  switch (method) {
    case "GET":
      const { data: liquidityTokens, error } = await supabaseClient
        .from("liquidity_tokens")
        .select("*");
      if (error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(200).json({ liquidityTokens });
      }
      break;

    case "POST":
      const { token } = body;
      let postError = { message: "wassuuuop" },
        newLiquidityToken;
      await createNewToken(token);

      if (postError) {
        res.status(500).json({ error: postError.message });
      } else {
        res.status(201).json({ newLiquidityToken });
      }
      break;

    case "DELETE":
      const { id: deleteId } = body;
      const { error: deleteError } = await supabaseClient
        .from("tokens")
        .delete()
        .match({ id: deleteId });
      if (deleteError) {
        res.status(500).json({ error: deleteError.message });
      } else {
        res.status(200).json({ success: true });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
