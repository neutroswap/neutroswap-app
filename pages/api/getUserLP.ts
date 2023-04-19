// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getNetworkById, getTokenDetails } from './tokens'
import { BigNumber, ethers } from 'ethers'
import { ERC20_ABI } from '@/shared/abi'
import { supabaseClient } from '@/shared/helpers/supabaseClient'
import {
  Multicall,
  ContractCallResults,
  ContractCallContext
} from 'ethereum-multicall'
import { NEUTRO_LP_TOKEN_ABI } from '@/shared/abi'

type Data = {
  data: any
}

export async function getAllLPs() {
  const { data: network, } = await supabaseClient
    .from('networks')
    .select('id,name')
    .eq('name', process.env.NETWORK)

  if (!network) { return }
  console.log(network[0].id)

  const { data: liquidityTokens, error } = await supabaseClient
    .from('liquidity_tokens')
    .select('network_id,address,decimal,name,symbol,logo')
    .eq('network_id', network[0].id)

  console.log("Error ", error);
  return liquidityTokens
}

export async function getUserLP(userAddress: any) {
  try {
    let lps: any = await getAllLPs()
    console.log('lps ', lps)
    if (lps.length == 0) throw Error('lps length is 0')
    let network: any = await getNetworkById(lps[0].network_id)

    const provider = new ethers.providers.JsonRpcProvider(network.rpc, {
      chainId: network.chain_id,
      name: network.name,
      // url: network.rpc
    })
    console.log("privderrs ", provider)
    const multicall = new Multicall({
      multicallCustomContractAddress: network.multicall_addr,
      ethersProvider: provider,
      tryAggregate: true
    })
    console.log("multiicallll ", multicall)
    let contractCallContext: ContractCallContext[] = []
    let promises = []
    let userLPs = []

    for (let i = 0; i < lps.length; i++) {
      let lp = lps[i]
      contractCallContext.push({
        reference: 'LP' + i,
        contractAddress: lp.address,
        abi: NEUTRO_LP_TOKEN_ABI as any,
        calls: [
          {
            reference: 'balance',
            methodName: 'balanceOf',
            methodParameters: [userAddress]
          },
          {
            reference: 'totalSupply',
            methodName: 'totalSupply',
            methodParameters: []
          },
          {
            reference: 'reserves',
            methodName: 'getReserves',
            methodParameters: []
          },
          { reference: 'token0', methodName: 'token0', methodParameters: [] },
          { reference: 'token1', methodName: 'token1', methodParameters: [] },

          { reference: 'devFee', methodName: 'devFee', methodParameters: [] },
          { reference: 'swapFee', methodName: 'swapFee', methodParameters: [] }
        ]
      })
      const lpTokenContract = new ethers.Contract(
        lp.address,
        ERC20_ABI,
        provider
      )
      // promises.push(lpTokenContract.balanceOf(userAddress))
    }
    console.log('context ', contractCallContext)
    const results: ContractCallResults = await multicall.call(
      contractCallContext
    )
    console.log('resultssss ', results.results)
    // let calls = results.results.LP0.callsReturnContext;
    // for(let i=0;i<calls.length;i++){
    //   console.log("wawawa ", calls[i].reference, calls[i].returnValues)
    // }
    let data = []
    for (let i = 0; i < lps.length; i++) {
      //get all references.
      let index: string = 'LP' + i
      let callValues = results.results[index].callsReturnContext
      console.log('call values ', callValues)
      let [balance, totalSupply, reserves, token0, token1, devFee, swapFee] = callValues
      let data1 = await supabaseClient
        .from('tokens')
        .select('decimal')
        .eq('address', token0.returnValues[0])
      let data2 = await supabaseClient
        .from('tokens')
        .select('decimal')
        .eq('address', token1.returnValues[0])
      if (!data1.data) return;
      if (!data2.data) return;
      const token0Decimal = Number(data1.data[0].decimal)
      const token1Decimal = Number(data2.data[0].decimal)

      console.log("balanceeeeeeee ", balance.returnValues[0])
      let balanceBN = BigNumber.from(balance.returnValues[0].hex);
      let totalSupplyBN = BigNumber.from(totalSupply.returnValues[0].hex);
      const poolShare = balanceBN.mul(BigNumber.from(10).pow(18)).div(totalSupplyBN).toString()

      if (balanceBN.eq(ethers.BigNumber.from(0))) {
        console.log('Balance is zero, skip...')
      } else {
        console.log("reserves ", BigNumber.from(reserves.returnValues[0].hex))
        userLPs.push({
          ...lps[i],
          userBalance: balanceBN,
          totalSupply: totalSupply.returnValues[0],
          poolShare: poolShare,
          reserves: {
            r0: {
              decimal: token0Decimal,
              raw: reserves.returnValues[0],
              // fix: now we use stagnan pow 18 for testnet, later we need to change the 18 to using token0Decimal var
              formatted: BigNumber.from(reserves.returnValues[0].hex).div(BigNumber.from(10).pow(18)).toNumber().toFixed(2),
            },
            r1: {
              decimal: token1Decimal,
              raw: reserves.returnValues[1],
              // fix: now we use stagnan pow 18 for testnet, later we need to change the 18 to using token0Decimal var
              formatted: BigNumber.from(reserves.returnValues[1].hex).div(BigNumber.from(10).pow(18)).toNumber().toFixed(2),
            },
          }
        })
        //supabase hit
        promises.push(
          supabaseClient
            .from('tokens')
            .select('address,decimal,name,symbol,logo')
            .eq('address', token0.returnValues[0])
        )
        promises.push(
          supabaseClient
            .from('tokens')
            .select('address,decimal,name,symbol,logo')
            .eq('address', token1.returnValues[0])
        )
        console.log(`Balance is ${balanceBN.toString()}`)
      }

      console.log('balance ', balanceBN)
      console.log('Total supply ', totalSupply)
      console.log('Reserves ', reserves)
    }
    console.log("users lp ", userLPs)
    let tokens = await Promise.all(promises)
    if (!tokens) return;
    // console.log('tokenss ', tokens[0].data[0], tokens.length)
    for (let i = 0; i < tokens.length; i += 2) { //assign ke userLP terkait. Karena tiap LP ada 2, makanya dibagi 2 buat dapet index nya 
      console.log("dsadsa ")
      const token0 = tokens[i];
      const token1 = tokens[i + 1];
      if (!token0.data || !token1.data) return;
      userLPs[i / 2].token0 = token0.data[0];
      userLPs[i / 2].token1 = token1.data[0];
    }
    console.log('Data ', userLPs)
    return userLPs
  } catch (err) {
    console.error(err)
    return err
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method, body } = req

  switch (method) {
    case 'GET':
      const { userAddress } = req.query
      console.log('iser ', userAddress)
      let nonZeroLP: any = await getUserLP(userAddress)
      let response = {
        data: nonZeroLP
      }
      // if (error) {
      //   res.status(500).json({ error: error.message })
      // } else {
      res.status(200).json(response)
      // }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
