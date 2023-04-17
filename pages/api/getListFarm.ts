// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getNetworkById, getNetworkByName, getTokenDetails } from './tokens'
import { BigNumber, ethers } from 'ethers'
import { ERC20_ABI } from '@/shared/abi'
import { supabaseClient } from '@/shared/helpers/supabaseClient'
import { formatEther, parseEther } from "ethers/lib/utils.js";
import {
  Multicall,
  ContractCallResults,
  ContractCallContext
} from 'ethereum-multicall'
import { NEUTRO_FARM_ABI } from '@/shared/abi'
import { CallContext } from 'ethereum-multicall/dist/esm/models'
import { CoinGeckoClient, SimplePriceResponse } from 'coingecko-api-v3'
import { NEXT_PUBLIC_FARM_CONTRACT } from '@/shared/helpers/constants'

const coingecko = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true
})

interface YieldFarm {
  tvl: string,
  farms: Farm[]
}

interface Farm {
  pid: string,
  name: string,
  lpToken: string,
  token0: string,
  token1: string,
  token0Logo: string,
  token1Logo: string
  reward: string,
  details: FarmDetails | null
}

interface FarmDetails {
  totalLiquidity: string,
  rps: string,
  apr: string
}


export async function getAllFarms(): Promise<Farm[] | null> {
  const { data, error } = await supabaseClient
    .from('farms')
    .select('*,liquidity_tokens(address, token0(address,symbol,logo), token1(address,symbol,logo)),rewards:tokens(address)')

  if (error) {
    console.log(error)
    return null
  } else {
    let result: Farm[] = [];
    for (let i = 0; i < data.length; i++) {
      let farm: Farm = {
        pid: data[i].pid,
        name: `${data[i].liquidity_tokens.token0.symbol}` + "-" + `${data[i].liquidity_tokens.token1.symbol}`,
        lpToken: data[i].liquidity_tokens.address,
        token0: data[i].liquidity_tokens.token0.address,
        token1: data[i].liquidity_tokens.token1.address,
        token0Logo: data[i].liquidity_tokens.token0.logo,
        token1Logo: data[i].liquidity_tokens.token1.logo,
        reward: data[i].rewards.address,
        details: null
      }
      result.push(farm)
    }
    return result
  }
}

export async function multicall(farms: Farm[] | null): Promise<YieldFarm | null> {
  const provider = new ethers.providers.JsonRpcProvider("https://api-testnet2.trust.one", {
    chainId: 15557,
    name: "testnet_eos_evm",
    // url: network.rpc
  })

  if (!farms) { return null }

  let calls = []
  // get all pids
  const totalLps: CallContext[] = farms.map(farm => ({
    reference: 'totalLp',
    methodName: 'poolTotalLp',
    methodParameters: [farm.pid]
    // methodParameters: [1]
  }));
  calls.push(...totalLps)

  // get all pids
  const rps: CallContext[] = farms.map(farm => ({
    reference: 'rps',
    methodName: 'poolRewardsPerSec',
    methodParameters: [farm.pid]
  }));
  calls.push(...rps)

  const multicall = new Multicall({
    multicallCustomContractAddress: process.env.NEXT_PUBLIC_MULTICALL_CONTRACT,
    ethersProvider: provider,
    tryAggregate: true
  })

  if (!NEXT_PUBLIC_FARM_CONTRACT) { return null }

  let contractCallContext: ContractCallContext[] = []
  let indexName = 'data'
  contractCallContext.push({
    reference: indexName,
    contractAddress: NEXT_PUBLIC_FARM_CONTRACT,
    abi: NEUTRO_FARM_ABI as any,
    calls
  })

  const contractCalls: ContractCallResults = await multicall.call(
    contractCallContext
  )

  let tvl = 0;
  for (const farm of farms) {
    const result = contractCalls.results[indexName].callsReturnContext.filter(res => res.methodParameters[0] === farm.pid);

    if (result) {
      const liquidity = result[0].returnValues;
      const rps = result[1].returnValues[3];

      farm.details = {
        totalLiquidity: formatEther(BigNumber.from(liquidity[0].hex)),
        apr: BigNumber.from(1).toString(),
        // apr: await calculateApr(rps[0].hex, liquidity[0].hex),
        // rps: parseEther(BigNumber.from(rps[0].hex).toString()).toNumber().toFixed(2)
        rps: formatEther(BigNumber.from(rps[0].hex))
      };
    }
    const totalLiquidity = parseFloat(farm.details?.totalLiquidity ?? '0');
    tvl += totalLiquidity;
  }

  const result: YieldFarm = {
    tvl: tvl.toString(),
    farms
  }

  return result
}

export async function calculateApr(rps: BigNumber, totalLiqiudity: BigNumber): Promise<BigNumber> {
  const ONE_YEAR = BigNumber.from(31536000)
  const tokenPrice = BigNumber.from(1.37)
  // return (rps.mul(ONE_YEAR).mul(tokenPrice).div(totalLiqiudity)).mul(BigNumber.from("100"))
  return (BigNumber.from("0x8e1f8b15e").mul(ONE_YEAR).mul(tokenPrice).div(469080)).mul(BigNumber.from("100"))
}

export async function getPrice(id: string, tokenAddress: string): Promise<SimplePriceResponse> {
  const tokenPrice = await coingecko.simplePrice({
    // id: "ethereum",
    // ids: "0x6b175474e89094c44da98b954eedeac495271d0f",
    // ids: 'dai,okb,bitcoin',
    ids: 'id',
    // contract_addresses: "0x6b175474e89094c44da98b954eedeac495271d0f",
    vs_currencies: 'usd'
  })
  return tokenPrice
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req

  switch (method) {
    case 'GET':
      try {
        let result = await getAllFarms()
        let data = await multicall(result)
        let response = {
          data
        }
        res.status(200).json(response)
        break
      } catch (e) {
        res.status(400).json({ error: e });
        break
      }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
