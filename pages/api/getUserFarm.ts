// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getNetworkById, getNetworkByName, getTokenDetails } from './tokens'
import { BigNumber, ethers, utils } from 'ethers'
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

let NEUTRO_PRICE = process.env.NEUTRO_PRICE;

const coingecko = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true
})

interface FarmHoldings {
  holdings: string,
  totalPendingTokens: string,
  totalPendingTokenInUsd: string,
  farms: Farm[]
}

interface Farm {
  pid: string,
  name: string,
  lpToken: string,
  token0: string,
  token1: string,
  token0decimals: number,
  token1decimals: number,
  token0denominator: number,
  token1denominator: number,
  token0gecko: string,
  token1gecko: string,
  token0price: number,
  token1price: number,
  reserves0: string,
  reserves1: string,
  reward: string,
  valueReserves0: string,
  valueReserves1: string,
  valueOfLiquidity: string,
  circulatingSupply: string,
  lpPrice: string,
  details: FarmDetails | null
}

interface FarmDetails {
  totalStaked: string,
  totalStakedInUsd: string,
  pendingTokens: string,
  pendingTokensInUsd: string,
}

let CHAIN_NAME: string;
let RPC: string;
let CHAIN_ID: any;
let MULTICALL_ADDR: string;
let FARM_CONTRACT: string;

export async function getAllFarms(): Promise<Farm[] | null> {
  const { data: network, } = await supabaseClient
    .from('networks')
    .select('id,name,rpc,chain_id,multicall_addr')
    .eq('name', process.env.NETWORK)
  if (!network) { return null }

  const { data, error } = await supabaseClient
    .from('farms')
    .select('*,liquidity_tokens(address, token0(address,symbol,logo,coingecko_id,decimal), token1(address,symbol,logo,coingecko_id,decimal)),rewards:tokens(address)')
    .eq('network_id', network[0].id)
  if (!data) { return null }

  CHAIN_NAME = network[0].name
  RPC = network[0].rpc
  CHAIN_ID = network[0].chain_id
  MULTICALL_ADDR = network[0].multicall_addr
  FARM_CONTRACT = data[0].farm_contract

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
        token0decimals: data[i].liquidity_tokens.token0.decimal,
        token1decimals: data[i].liquidity_tokens.token1.decimal,
        token0denominator: Math.max(1, 18 - data[i].liquidity_tokens.token0.decimal),
        token1denominator: Math.max(1, 18 - data[i].liquidity_tokens.token1.decimal),
        reward: data[i].rewards.address,
        token0gecko: data[i].liquidity_tokens.token0.coingecko_id,
        token1gecko: data[i].liquidity_tokens.token1.coingecko_id,
        token0price: 0,
        token1price: 0,
        reserves0: "",
        valueReserves0: "",
        valueReserves1: "",
        reserves1: "",
        lpPrice: "",
        circulatingSupply: "",
        valueOfLiquidity: "",
        details: null
      }
      result.push(farm)
    }
    return result
  }
}

export async function composeData(farms: Farm[] | null, address: any): Promise<FarmHoldings | null> {
  const provider = new ethers.providers.JsonRpcProvider(RPC, {
    chainId: CHAIN_ID,
    name: CHAIN_NAME,
    // url: network.rpc
  })

  if (!farms) { return null }

  let calls = []
  // get all pids
  const userInfo: CallContext[] = farms.map(farm => ({
    reference: 'info',
    methodName: 'userInfo',
    methodParameters: [farm.pid, address]
    // methodParameters: [1]
  }));
  calls.push(...userInfo)

  // get all pids
  const pendingTokens: CallContext[] = farms.map(farm => ({
    reference: 'pending',
    methodName: 'pendingTokens',
    methodParameters: [farm.pid, address]
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
    contractAddress: FARM_CONTRACT,
    abi: NEUTRO_FARM_ABI as any,
    calls
  })

  const contractCalls: ContractCallResults = await multicall.call(
    contractCallContext
  )

  let totalHoldings = 0;
  let totalPendingTokens = 0;
  for (const farm of farms) {
    const result = contractCalls.results[indexName].callsReturnContext.filter(res => res.methodParameters[0] === farm.pid);

    if (result) {
      const totalStaked = result[0].returnValues[0];
      const pendingTokens = result[1].returnValues[3];

      farm.details = {
        totalStaked: formatEther(BigNumber.from(totalStaked.hex)),
        totalStakedInUsd: "",
        pendingTokens: formatEther(BigNumber.from(pendingTokens[0].hex)),
        pendingTokensInUsd: ""
      };
    }
    const holdings = parseFloat(farm.details?.totalStaked ?? '0');
    totalHoldings += holdings;
    const pendingTokens = parseFloat(farm.details?.pendingTokens ?? '0');
    totalPendingTokens += pendingTokens
  }

  const result: FarmHoldings = {
    holdings: totalHoldings.toString(),
    totalPendingTokens: totalPendingTokens.toString(),
    totalPendingTokenInUsd: "0",
    farms
  }

  return result
}

export async function addTokenPrice(farmHoldings: FarmHoldings): Promise<FarmHoldings> {
  let promises = [];

  for (const farm of farmHoldings.farms) {
    const token0Price = getPrice(farm.token0gecko);
    const token1Price = getPrice(farm.token1gecko);
    promises.push(token0Price, token1Price);
  }

  let tokenPrices = await Promise.all(promises);

  // Update the farms with the token prices and calculate the APR for each farm
  // let aprs: BigNumber[] = [];
  let farms: Farm[] = [];
  for (let i = 0; i < farmHoldings.farms.length; i++) {
    let farm = farmHoldings.farms[i];
    farm.token0price = tokenPrices[i * 2];
    farm.token1price = tokenPrices[i * 2 + 1];

    farms.push(farm);
  }

  // return { apr: aprs, updatedFarms: yieldFarm.farms };
  const result: FarmHoldings = {
    holdings: farmHoldings.holdings,
    totalPendingTokens: farmHoldings.totalPendingTokens,
    totalPendingTokenInUsd: farmHoldings.totalPendingTokenInUsd,
    farms
  }

  return result
}

export async function totalValueOfLiquidity(farmHoldings: FarmHoldings) {
  if (!NEUTRO_PRICE) { NEUTRO_PRICE = "0.01" }
  const neutroPrice = parseFloat(NEUTRO_PRICE)

  const provider = new ethers.providers.JsonRpcProvider(RPC, {
    chainId: CHAIN_ID,
    name: CHAIN_NAME,
    // url: network.rpc
  })
  // if (!farms) { return null }

  const multicall = new Multicall({
    multicallCustomContractAddress: MULTICALL_ADDR,
    ethersProvider: provider,
    tryAggregate: true
  })

  let indexName = 'reserves'
  // get all pids
  const contractCallContext: ContractCallContext[] = farmHoldings.farms.map(farm => ({
    reference: indexName + farm.lpToken,
    contractAddress: farm.lpToken,
    abi: [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Swap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint112", "name": "reserve0", "type": "uint112" }, { "indexed": false, "internalType": "uint112", "name": "reserve1", "type": "uint112" }], "name": "Sync", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MINIMUM_LIQUIDITY", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "PERMIT_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "devFee", "outputs": [{ "internalType": "uint40", "name": "", "type": "uint40" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_token0", "type": "address" }, { "internalType": "address", "name": "_token1", "type": "address" }], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "kLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "liquidity", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "price0CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "price1CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "skim", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "swapFee", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "sync", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }],
    calls: [{ reference: 'reservesCall', methodName: 'getReserves', methodParameters: [] }, { reference: 'totalSupplyCall', methodName: 'totalSupply', methodParameters: [] }]
  }));

  const contractCalls: ContractCallResults = await multicall.call(contractCallContext);

  let holdings = 0;
  let totalPendingTokenInUsd = 0;
  for (const farm of farmHoldings.farms) {
    const reserves0 = contractCalls.results[indexName + farm.lpToken].callsReturnContext[0].returnValues[0]
    const reserves1 = contractCalls.results[indexName + farm.lpToken].callsReturnContext[0].returnValues[1]
    const cirSupply = contractCalls.results[indexName + farm.lpToken].callsReturnContext[1].returnValues[0]
    farm.circulatingSupply = formatEther(BigNumber.from(cirSupply.hex).toString())

    farm.reserves0 = BigNumber.from(reserves0.hex).toString()
    farm.reserves1 = BigNumber.from(reserves1.hex).toString()

    const reserve0 = BigNumber.from(farm.reserves0)
    const reserve1 = BigNumber.from(farm.reserves1)
    const price0 = BigNumber.from(utils.parseUnits(farm.token0price.toString(), farm.token0decimals))
    const price1 = BigNumber.from(utils.parseUnits(farm.token1price.toString(), farm.token1decimals))
    // const denominator = utils.parseUnits("1", 18);
    const denominator0 = utils.parseUnits("1", farm.token0decimals)
    const denominator1 = utils.parseUnits("1", farm.token1decimals)

    if (farm.token0decimals == 18) {
      farm.valueReserves0 = formatEther(reserve0.mul(price0).div(denominator0)).toString()
    } else {
      farm.valueReserves0 = formatEther(reserve0.mul(price0).div(denominator0).mul(utils.parseUnits("1", farm.token0denominator))).toString()
    }

    if (farm.token1decimals == 18) {
      farm.valueReserves1 = formatEther(reserve1.mul(price1).div(denominator1)).toString()
    } else {
      farm.valueReserves1 = formatEther(reserve1.mul(price1).div(denominator1).mul(utils.parseUnits("1", farm.token1denominator))).toString()
    }
    // farm.valueOfLiquidity = Number(formatEther(totalValueReserve0.add(totalValueReserve1).div(denominator).toString())).toFixed(2).toString()
    farm.valueOfLiquidity = (parseFloat(farm.valueReserves0.toString()) + parseFloat(farm.valueReserves1.toString())).toFixed(2).toString()
    farm.lpPrice = (parseFloat(farm.valueOfLiquidity.toString()) / parseFloat(farm.circulatingSupply.toString())).toFixed(2).toString()

    if (!farm.details?.totalStaked) { throw Error }
    farm.details = {
      totalStaked: farm.details.totalStaked,
      totalStakedInUsd: (parseFloat(farm.details.totalStaked) * parseFloat(farm.lpPrice)).toString(),
      pendingTokens: farm.details.pendingTokens,
      pendingTokensInUsd: (parseFloat(farm.details.pendingTokens) * neutroPrice).toFixed(2).toString()
    }
    holdings += parseFloat(farm.details.totalStakedInUsd)
    totalPendingTokenInUsd += parseFloat(farm.details.pendingTokensInUsd)
  }

  const result: FarmHoldings = {
    holdings: holdings.toFixed(2).toString(),
    totalPendingTokens: farmHoldings.totalPendingTokens,
    // totalPendingTokenInUsd: (Number(parseFloat(farmHoldings.totalPendingTokens) * parseFloat("0.01")).toFixed(2)).toString(),
    totalPendingTokenInUsd: totalPendingTokenInUsd.toString(),
    farms: farmHoldings.farms
  }

  return result
}


export async function getPrice(id: string): Promise<number> {
  if (!NEUTRO_PRICE) { NEUTRO_PRICE = "0.01" }
  const neutroPrice = parseFloat(NEUTRO_PRICE)
  if (id === "neutro") {
    return neutroPrice
  }

  const tokenPrice = await coingecko.simplePrice({
    ids: id,
    vs_currencies: 'usd'
  })
  return tokenPrice[id].usd
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
        let result = await getAllFarms()
        let data = await composeData(result, userAddress)
        if (!data) {
          throw Error('error multicall')
        }
        let tp = await addTokenPrice(data)
        let a = await totalValueOfLiquidity(tp)
        let response = {
          data: a
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
