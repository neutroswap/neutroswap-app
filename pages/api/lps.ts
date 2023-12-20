import type { NextApiRequest, NextApiResponse } from 'next'
import { createNewToken , getNetworkByName} from './tokens'
import {LiquidityToken, TokenFE, LiquidityTokenFE} from "@/shared/types/tokens.types";
import { supabaseClient } from '@/shared/helpers/supabaseClient'

export async function getLPDetail (liquidityTokenAddress: string) {
  const { data: liquidityTokens, error } = await supabaseClient
    .from('liquidity_tokens')
    .select('*')
    .eq('address', liquidityTokenAddress)
    return liquidityTokens;
}

export async function getAllLPs () {
  const { data: liquidityTokens, error } = await supabaseClient
    .from('liquidity_tokens')
    .select('*')
  return liquidityTokens
}

async function createLPToken (
  lpToken: LiquidityTokenFE,
  token0: TokenFE,
  token1: TokenFE,
) {
  let token0Details = await createNewToken(token0)
  let token1Details = await createNewToken(token1)
  let networkName = token0.networkName;
  const { data: existingLiquidityTokens } = await supabaseClient
    .from('liquidity_tokens')
    .select('*')
    .eq('token0_id', token0Details.id)
    .eq('token1_id', token1Details.id)

  if (existingLiquidityTokens && existingLiquidityTokens.length > 0) {
    //if it doesn exist, return.
    return existingLiquidityTokens[0]
  }
  let lpName = "NeutroLP"; //vLPN-WETH-USDT
  let network:any = await getNetworkByName(networkName);
  const liquidityToken: LiquidityToken = {
    address: lpToken.createdLP,
    decimal: 18,
    name: lpName,
    symbol: "NLP",
    logo: "default",
    token0: token0Details.id,
    token1: token1Details.id,
    network_id: network.id
  }

  let res = await supabaseClient
    .from('liquidity_tokens')
    .insert([liquidityToken])
  return liquidityToken
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req

  switch (method) {
    case 'GET':
      const { data: liquidityTokens, error } = await supabaseClient
        .from('liquidity_tokens')
        .select('*')
      if (error) {
        res.status(500).json({ error: error.message })
      } else {
        res.status(200).json({ liquidityTokens })
      }
      break

    case 'POST':
      const { lpToken, token0, token1 } = body
      const { data: newLiquidityToken, error: postError } = await createLPToken(lpToken, token0, token1)
      if (postError) {
        res.status(500).json({ error: postError.message })
      } else {
        res.status(201).json({ newLiquidityToken })
      }
      break

    case 'PUT':
      const { id, token0: updatedToken0, token1: updatedToken1 } = body
      const { data: updatedLiquidityToken, error: putError } = await supabaseClient
        .from('liquidity_tokens')
        .update({ token0: updatedToken0, token1: updatedToken1 })
        .match({ id })
      if (putError) {
        res.status(500).json({ error: putError.message })
      } else {
        res.status(200).json({ updatedLiquidityToken })
      }
      break

    case 'DELETE':
      const { id: deleteId } = body
      const { error: deleteError } = await supabaseClient
        .from('liquidity_tokens')
        .delete()
        .match({ id: deleteId })
      if (deleteError) {
        res.status(500).json({ error: deleteError.message })
      } else {
        res.status(200).json({ success: true })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
