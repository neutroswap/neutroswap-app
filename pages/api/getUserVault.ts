// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { BigNumber, ethers } from 'ethers'
import { supabaseClient } from '@/shared/helpers/supabaseClient'
import { formatEther } from "ethers/lib/utils.js";
import {
  Multicall,
  ContractCallResults,
  ContractCallContext
} from 'ethereum-multicall'
import { NEUTRO_VAULT_ABI } from '@/shared/abi'
import { CallContext } from 'ethereum-multicall/dist/esm/models'
import { CoinGeckoClient } from 'coingecko-api-v3'

const coingecko = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true
})

interface Vaults {
  holdings: string,
  totalHoldingsInUsd: string,
  totalPendingTokens: string,
  totalPendingTokensInUsd: string,
  vaults: Vault[]
}

interface Vault {
  pid: number,
  totalStaked: string,
  totalStakedInUsd: string,
  pendingTokens: string,
  pendingTokensInUsd: string
}

let NEUTRO_PRICE: any;
let CHAIN_NAME: string;
let RPC: string;
let CHAIN_ID: any;
let MULTICALL_ADDR: string;
let VAULT_CONTRACT: string;

export async function getAllVaults(): Promise<Vault[] | null> {
  const { data: network, error } = await supabaseClient
    .from('networks')
    .select('id,name,rpc,chain_id,multicall_addr')
    .eq('name', process.env.NETWORK)

  if (!network) { return null }

  CHAIN_NAME = network[0].name
  RPC = network[0].rpc
  CHAIN_ID = network[0].chain_id
  MULTICALL_ADDR = network[0].multicall_addr
  if (!process.env.NEXT_PUBLIC_VAULT_CONTRACT) { return null }
  VAULT_CONTRACT = process.env.NEXT_PUBLIC_VAULT_CONTRACT

  if (error) {
    console.log(error)
    return null
  } else {
    let result: Vault[] = [];
    for (let i = 0; i < 4; i++) {
      let vault: Vault = {
        pid: i,
        totalStaked: "",
        totalStakedInUsd: "",
        pendingTokens: "",
        pendingTokensInUsd: ""
      }
      result.push(vault)
    }
    return result
  }
}

export async function composeData(address: any, vaults: Vault[] | null): Promise<Vaults | null> {
  let tokenPrice = await getPrice("neutroswap")
  NEUTRO_PRICE = tokenPrice["neutroswap"].usd

  const provider = new ethers.providers.JsonRpcProvider(RPC, {
    chainId: CHAIN_ID,
    name: CHAIN_NAME,
    // url: network.rpc
  })

  if (!vaults) { return null }

  let calls = []
  // get all pids
  const userInfo: CallContext[] = vaults.map(vault => ({
    reference: 'info',
    methodName: 'userInfo',
    methodParameters: [vault.pid, address]
    // methodParameters: [1]
  }));
  calls.push(...userInfo)

  // get all pids
  const pendingTokens: CallContext[] = vaults.map(vault => ({
    reference: 'pending',
    methodName: 'pendingTokens',
    methodParameters: [vault.pid, address]
  }));
  calls.push(...pendingTokens)

  const multicall = new Multicall({
    multicallCustomContractAddress: MULTICALL_ADDR,
    ethersProvider: provider,
    tryAggregate: true
  })

  let contractCallContext: ContractCallContext[] = []
  let indexName = 'data'
  contractCallContext.push({
    reference: indexName,
    contractAddress: VAULT_CONTRACT,
    abi: NEUTRO_VAULT_ABI as any,
    calls
  })

  const contractCalls: ContractCallResults = await multicall.call(
    contractCallContext
  )

  let totalHoldings = 0;
  let totalHoldingsInUsd = 0;
  let totalPendingTokens = 0;
  let totalPendingTokensInUsd = 0;
  for (const vault of vaults) {
    const result = contractCalls.results[indexName].callsReturnContext.filter(res => res.methodParameters[0] === vault.pid);

    if (result) {
      const totalStaked = result[0].returnValues[0];
      const pendingTokens = result[1].returnValues[3];

      vault.totalStaked = formatEther(BigNumber.from(totalStaked.hex))
      vault.totalStakedInUsd = (parseFloat(vault.totalStaked) * parseFloat(NEUTRO_PRICE)).toFixed(2).toString()
      vault.pendingTokens = formatEther(BigNumber.from(pendingTokens[0].hex))
      vault.pendingTokensInUsd = (parseFloat(vault.pendingTokens) * parseFloat(NEUTRO_PRICE)).toFixed(2).toString()
    }
    const holdings = parseFloat(vault?.totalStaked ?? '0');
    totalHoldings += holdings;
    const pendingTokens = parseFloat(vault?.pendingTokens ?? '0');
    totalPendingTokens += pendingTokens
    const pendingTokensInUsd = parseFloat(vault?.pendingTokensInUsd ?? '0');
    totalPendingTokensInUsd += pendingTokensInUsd
    const holdingsInUsd = parseFloat(vault?.totalStakedInUsd ?? '0');
    totalHoldingsInUsd += holdingsInUsd
  }

  let result: Vaults = {
    holdings: totalHoldings.toString(),
    totalHoldingsInUsd: totalHoldingsInUsd.toFixed(2).toString(),
    totalPendingTokens: totalPendingTokens.toString(),
    totalPendingTokensInUsd: totalPendingTokensInUsd.toFixed(2).toString(),
    vaults
  }

  return result
}

export async function getPrice(id: string): Promise<any> {
  const tokenPrice = await coingecko.simplePrice({
    ids: id,
    vs_currencies: 'usd'
  })
  return tokenPrice
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req
  const { userAddress } = req.query
  if (!userAddress) {
    res.status(400).json({ error: 'Missing required parameter' });
    return;
  }

  switch (method) {
    case 'GET':
      try {
        let result = await getAllVaults()
        let data = await composeData(userAddress, result)
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
