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
import { NEUTRO_FARM_ABI, NEUTRO_POOL_ABI } from '@/shared/abi'
import { CallContext } from 'ethereum-multicall/dist/esm/models'
import { CoinGeckoClient, SimplePriceResponse } from 'coingecko-api-v3'

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
  token0gecko: string,
  token1gecko: string,
  token0price: number,
  token1price: number,
  reserves0: string,
  reserves1: string,
  valueOfLiquidity: string,
  reward: string,
  details: FarmDetails | null
}

interface FarmDetails {
  totalLiquidity: string,
  rps: string,
  apr: string
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
    .select('*,liquidity_tokens(address, token0(address,symbol,logo,coingecko_id), token1(address,symbol,logo,coingecko_id)),rewards:tokens(address)')
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
        token0Logo: data[i].liquidity_tokens.token0.logo,
        token1Logo: data[i].liquidity_tokens.token1.logo,
        token0gecko: data[i].liquidity_tokens.token0.coingecko_id,
        token1gecko: data[i].liquidity_tokens.token1.coingecko_id,
        token0price: 0,
        token1price: 0,
        reserves0: "",
        reserves1: "",
        valueOfLiquidity: "",
        reward: data[i].rewards.address,
        details: null
      }
      result.push(farm)
    }
    return result
  }
}

export async function composeData(farms: Farm[] | null): Promise<YieldFarm | null> {
  const provider = new ethers.providers.JsonRpcProvider(RPC, {
    chainId: CHAIN_ID,
    name: CHAIN_NAME,
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

// export async function calculateApr(yieldFarm: YieldFarm, rps: BigNumber, totalLiqiudity: BigNumber): Promise<{ apr: BigNumber[], updatedFarms: Farm[] }> {
export async function addTokenPrice(yieldFarm: YieldFarm): Promise<YieldFarm> {
  let promises = [];

  for (const farm of yieldFarm.farms) {
    const token0Price = getPrice(farm.token0gecko);
    const token1Price = getPrice(farm.token1gecko);
    promises.push(token0Price, token1Price);
  }

  let tokenPrices = await Promise.all(promises);

  // Update the farms with the token prices and calculate the APR for each farm
  // let aprs: BigNumber[] = [];
  let farms: Farm[] = [];
  for (let i = 0; i < yieldFarm.farms.length; i++) {
    let farm = yieldFarm.farms[i];
    farm.token0price = tokenPrices[i * 2];
    farm.token1price = tokenPrices[i * 2 + 1];

    //   const farmTokenPrice = BigNumber.from(utils.parseUnits(farm.token0price.toString(), 18)).add(BigNumber.from(utils.parseUnits(farm.token1price.toString(), 18)));
    //   if (farm.details) {
    //     // convert to decimals 18 to prevent u/o flow
    //     const rps = BigNumber.from(utils.parseUnits(farm.details.rps.toString(), 18))
    //     // const valueOfLiquidityPool = BigNumber.from(utils.parseUnits(farm.details.totalLiquidity, 18))
    //     // const totalLiquidityPool = BigNumber.from(utils.parseUnits(farm.details.totalLiquidity.toString(), 18))
    //     const neutroPrice = BigNumber.from(utils.parseUnits("1", 18))
    //     const denominator = BigNumber.from(utils.parseUnits("1", 18))
    //     const totalLiquidity = BigNumber.from(utils.parseUnits("5", 18))
    //     const totalValueOfLiquidity = farmTokenPrice.div(totalLiquidity)
    //     console.log("rps", rps.toString())
    //     console.log("totalLiquidity", totalLiquidity.toString())
    //     console.log("liquidity", totalValueOfLiquidity.toString())
    //     console.log("farmTokenPrice", farmTokenPrice.toString())

    //     const apr = rps.mul(ONE_YEAR).mul(1).div(totalValueOfLiquidity).mul(100).div(denominator)

    //     // const apr = (
    //     //   BigNumber.from(utils.parseUnits(farm.details.rps.toString(), 18))
    //     //     .mul(ONE_YEAR)
    //     //     .mul(farmTokenPrice.toString())
    //     //     .div(BigNumber.from(farmTokenPrice.toString()).div(BigNumber.from(utils.parseUnits(farm.details.totalLiquidity, 18)))))
    //     //   .mul(BigNumber.from("100").toString())
    //     //   .div(utils.parseUnits(BigNumber.from("1").toString(), 18));
    //     farm.details.apr = apr.toString();
    //     // aprs.push(apr);
    //   }
    //   // aprs.push(apr);
    farms.push(farm);
  }

  // return { apr: aprs, updatedFarms: yieldFarm.farms };
  const result: YieldFarm = {
    tvl: yieldFarm.tvl,
    farms
  }

  return result
}

// Total value of liquidity pool = (10,000 * $1) + (5,000 * $2) = $20,000
// price LP: (totalValueOfLiquidity / totalSupplyLp) 
// tvl farm: farmTotalDeposit * price
// export async function totalValueOfLiquidity(lpToken: string, price0: string, price1: string) {
//
export async function totalValueOfLiquidity(yieldFarm: YieldFarm) {
  // const denominator = utils.parseUnits("1", 18);
  // const reserve0 = BigNumber.from("98730552937816945540")
  // const reserve1 = BigNumber.from("118036917174260054894686")
  // const price0 = BigNumber.from(utils.parseUnits("2109", 18))
  // const price1 = BigNumber.from(utils.parseUnits("1.76", 18))
  // const totalValueReserve0 = reserve0.mul(price0)
  // const totalValueReserve1 = reserve1.mul(price1)
  // console.log(Number(formatEther(totalValueReserve0.add(totalValueReserve1).div(denominator).toString())).toFixed(2))

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
  const contractCallContext: ContractCallContext[] = yieldFarm.farms.map(farm => ({
    reference: indexName + farm.lpToken,
    contractAddress: farm.lpToken,
    abi: [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Swap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint112", "name": "reserve0", "type": "uint112" }, { "indexed": false, "internalType": "uint112", "name": "reserve1", "type": "uint112" }], "name": "Sync", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MINIMUM_LIQUIDITY", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "PERMIT_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "devFee", "outputs": [{ "internalType": "uint40", "name": "", "type": "uint40" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_token0", "type": "address" }, { "internalType": "address", "name": "_token1", "type": "address" }], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "kLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "liquidity", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "price0CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "price1CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "skim", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "swapFee", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "sync", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }],
    calls: [{ reference: 'reservesCall', methodName: 'getReserves', methodParameters: [] }]
  }));
  // console.log("call context", contractCallContext)

  const contractCalls: ContractCallResults = await multicall.call(contractCallContext);

  let tvl = 0;
  for (const farm of yieldFarm.farms) {
    const reserves0 = contractCalls.results[indexName + farm.lpToken].callsReturnContext[0].returnValues[0]
    const reserves1 = contractCalls.results[indexName + farm.lpToken].callsReturnContext[0].returnValues[1]

    farm.reserves0 = BigNumber.from(reserves0.hex).toString()
    farm.reserves1 = BigNumber.from(reserves1.hex).toString()

    const reserve0 = BigNumber.from(farm.reserves0)
    const reserve1 = BigNumber.from(farm.reserves1)
    const price0 = BigNumber.from(utils.parseUnits(farm.token0price.toString(), 18))
    const price1 = BigNumber.from(utils.parseUnits(farm.token1price.toString(), 18))
    const totalValueReserve0 = reserve0.mul(price0)
    const totalValueReserve1 = reserve1.mul(price1)
    const denominator = utils.parseUnits("1", 18);
    farm.valueOfLiquidity = Number(formatEther(totalValueReserve0.add(totalValueReserve1).div(denominator).toString())).toFixed(2).toString()
    tvl += parseFloat(farm.valueOfLiquidity) * parseFloat(farm.details?.totalLiquidity ?? '0');
    // console.log(Number(formatEther(totalValueReserve0.add(totalValueReserve1).div(denominator).toString())).toFixed(2))
  }

  const result: YieldFarm = {
    tvl: tvl.toFixed(2).toString(),
    farms: yieldFarm.farms
  }

  return result
}

export async function calculateApr(yieldFarm: YieldFarm): Promise<YieldFarm> {
  const SEC_IN_YEAR = parseFloat("31536000")
  const neutroPrice = parseFloat("0.01")

  for (const farm of yieldFarm.farms) {
    if (!farm.details?.rps) { throw Error }
    const rps = parseFloat(farm.details.rps)
    const totalValueOfLiquidity = parseFloat(farm.valueOfLiquidity)
    let apr = (rps * SEC_IN_YEAR * neutroPrice / totalValueOfLiquidity) * 100
    if (apr.toString() == "Infinity") { apr = 0 }
    farm.details.apr = apr.toFixed(2).toString()
  }

  const result: YieldFarm = {
    tvl: yieldFarm.tvl,
    farms: yieldFarm.farms
  }

  return result
}

export async function getPrice(id: string): Promise<number> {
  if (id === "neutro") {
    return 0.01;
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

  switch (method) {
    case 'GET':
      try {
        let result = await getAllFarms()
        let data = await composeData(result)
        if (!data) {
          throw Error('error multicall')
        }
        let tp = await addTokenPrice(data)
        let vol = await totalValueOfLiquidity(tp);
        let apr = await calculateApr(vol)
        let response = {
          data: apr
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
