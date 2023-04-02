import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'
import { ERC20_ABI } from '../../shared/abi'

import { CoinGeckoClient } from 'coingecko-api-v3'

const coingecko = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true
})

interface Token {
  network_id: string
  address: string
  decimal: number
  name: string
  symbol: string
  logo: string
}

interface TokenFE {
  tokenAddress: string
  networkName: string
}

interface LiquidityToken {
  id: string
  token0: string
  token1: string
  created_at: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getNetworkByName(networkName: string){
  let { data: network } = await supabase
    .from('networks')
    .select('*')
    .eq('name', networkName)
  console.log('network ', network)
  return network = network[0]
}

export async function getNetworkById(networkId: string){
  let { data: network } = await supabase
    .from('networks')
    .select('*')
    .eq('id', networkId)
  console.log('network ', network)
  return network = network[0]
}

export async function createNewToken (newToken: TokenFE) {
  let { tokenAddress, networkName } = newToken
  let existingToken = await getTokenDetails(tokenAddress)
  if (existingToken) {
    console.log("Token already exist! ", existingToken)
    return existingToken
  }
  let network = await getNetworkByName(networkName)
  let rpc = network.rpc
  console.log('rpcc ', rpc)

  // console.log("wawawa ", await coingecko.contract({
  //   id: "ethereum",
  //   contract_address: tokenAddress
  // }))
  // coins.fetchTokenFullData({ id: "ethereum", contract_addresses: tokenAddress }).then((res) => res.data.name))

  const provider = new ethers.providers.JsonRpcProvider(rpc)
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)

  const [symbol, decimals] = await Promise.all([
    // new CoinGecko().coins.fetchTokenFullData({ id: "ethereum", contract_addresses: tokenAddress }).then((res) => res.data.name),
    tokenContract.symbol().catch(() => null),
    tokenContract.decimals().catch(() => null)
  ])
  console.log('symbol decimals ', symbol, decimals)
  // const logo = await new CoinGecko().coins.fetchTokenFullData({ id: "ethereum", contract_addresses: tokenAddress }).then(
  //   (res) => res.data.image.large
  // );

  const token: Token = {
    network_id: network.id,
    address: tokenAddress,
    decimal: decimals.toNumber() ?? 18,
    name: symbol,
    symbol,
    logo: 'default'
  }

  let res = await supabase.from<Token>('tokens').insert([token])
  console.log('ererewr ', res)
  return token
}

export async function getTokenDetails (data: string) {
  let tokenDetails;
  let errorDetails=null;
  console.log("data dulu daaahh ", data)
  if (data.substring(0,2) == '0x') {//get by address
    const { data: tokenDetail, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('address', data)

    console.log("fdsailfjdaisj ", tokenDetail);
    tokenDetails = tokenDetail[0]
    return tokenDetails //return errorDetails if any
  } else { //get by tokenid
    
    const { data: tokenDetail, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', data)

    console.log("fdsailfjdaisj ", tokenDetail);
    tokenDetails = tokenDetail[0]
    return tokenDetails //return errorDetails if any
  }
  if (errorDetails!=null) throw Error("can not get token detail", errorDetails);
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req

  switch (method) {
    case 'GET':
      const { data: liquidityTokens, error } = await supabase
        .from<LiquidityToken>('liquidity_tokens')
        .select('*')
      console.log('yoooo data', liquidityTokens)
      if (error) {
        res.status(500).json({ error: error.message })
      } else {
        res.status(200).json({ liquidityTokens })
      }
      break

    case 'POST':
      const { token } = body
      let postError = { message: 'wassuuuop' },
        newLiquidityToken
      await createNewToken(token)
      // const { data: newLiquidityToken, error: postError } = await supabase
      //   .from<LiquidityToken>("liquidity_tokens")
      //   .insert({ token0, token1 });
      if (postError) {
        res.status(500).json({ error: postError.message })
      } else {
        res.status(201).json({ newLiquidityToken })
      }
      break

    case 'PUT':
      const { id, token0: updatedToken0, token1: updatedToken1 } = body
      const { data: updatedLiquidityToken, error: putError } = await supabase
        .from<LiquidityToken>('liquidity_tokens')
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
      const { error: deleteError } = await supabase
        .from('tokens')
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
