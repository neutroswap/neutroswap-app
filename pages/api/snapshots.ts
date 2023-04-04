import { ethers } from 'ethers'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NEUTRO_ROUTER_ABI, NEUTRO_PAIR_ABI } from '../../shared/abi'
import { getLPDetail, getAllLP, getTokenDetails } from './tokens' // Import the `get` function from `./lp`

import { CoinGeckoClient } from 'coingecko-api-v3'

const coingecko = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true
})

const neutroswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

const provider = new ethers.providers.JsonRpcProvider(
  'https://rpc.ankr.com/eth_goerli/f2e43c4d573778bbcaa09f4d6a65f293e94c39bffb570fad500375aad5d1e9d7'
)
// const signer = new ethers.Wallet('your private key', provider)
const neutroswapRouterContract = new ethers.Contract(
  neutroswapRouterAddress,
  NEUTRO_ROUTER_ABI,
  provider
)
//5e5b1eab-0271-4081-a789-e340b9b5a2f1
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

const liquidityTokenId = 'your liquidity token ID'

let previousReserve0: ethers.BigNumber
let previousReserve1: ethers.BigNumber

async function takeSnapshot (): Promise<void> {
  // Get the current reserves of the token pair
  // let lpToken:string = "0xd0646b3FDeFb047d6C2bB7cc5475C7493BB83Ddc";
  // let lpDetails = await getLPDetail(lpToken);
  let lpTokens: any = await getAllLP()
  console.log('lp tokens ', lpTokens)
  for (let i = 0; i < lpTokens.length; i++) {
    let lpToken = lpTokens[i]
    const lpTokenContract = new ethers.Contract(
      lpToken.address,
      NEUTRO_PAIR_ABI,
      provider
    )
    //harus bs di optimize sih
    let [token0, token1] = await Promise.all([
      getTokenDetails(lpToken.token0),
      getTokenDetails(lpToken.token1)
    ])
    console.log('token 0 ', token0)
    const [reserve0, reserve1] = await lpTokenContract.getReserves()
    console.log('reserver ', reserve0, reserve1)
    // Calculate the prices of each token
    // const token0Price = reserve1.mul(ethers.utils.parseEther("1")).div(reserve0);
    // const token1Price = reserve0.mul(ethers.utils.parseEther("1")).div(reserve1);

    // Get the price of each token in the pair in USD
    console.log("oyooyoyoy ", await coingecko.simplePrice({
      // id: "ethereum",
      // ids: "0x6b175474e89094c44da98b954eedeac495271d0f",
      ids: 'dai,okb,bitcoin',
      // contract_addresses: "0x6b175474e89094c44da98b954eedeac495271d0f",
      vs_currencies: 'usd'
    }))
    // await coingecko.simplePrice()
    let token0Price, token1Price;
    try {
      [token0Price, token1Price] = await Promise.all([coingecko.simplePrice({
        // id: "ethereum",
        // ids: "0x6b175474e89094c44da98b954eedeac495271d0f",
        ids: 'dai',
        // contract_addresses: "0x6b175474e89094c44da98b954eedeac495271d0f",
        vs_currencies: 'usd'
      }),
      coingecko.simplePrice({
        // id: "ethereum",
        ids: 'okx',
        vs_currencies: 'usd'
      })])
    } catch (error) {
      console.error("Error getting token prices : ", error);
    }
    console.log('priceee ', token0Price, token1Price)
    // Calculate the TVL and volume
    // const tvl = reserve0
    //   .mul(10 ** token0.decimal)
    //   .add(reserve1.mul(10 ** token0.decimal))
    //   .div(10 ** 18)
    // const volume = reserve0
    //   .sub(previousReserve0)
    //   .mul(10 ** token0.decimal)
    //   .add(reserve1.sub(previousReserve1).mul(10 ** token0.decimal))
    return "gud"
  }

  // Insert the snapshot into the Supabase database
  // await supabase.from('tvl_snapshots').insert({
  //   liquidity_token: liquidityTokenId,
  //   reserve0: reserve0.toString(),
  //   reserve1: reserve1.toString(),
  //   price0: 0,
  //   price1: 0,
  //   created_at: new Date(),
  //   timestamp: Math.floor(Date.now() / 1000),
  //   network_id: 'your network ID' // Replace with your network ID
  // })

  // Save the current reserves for the next snapshot
  // previousReserve0 = reserve0
  // previousReserve1 = reserve1
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  await takeSnapshot()
  res.status(200).json();
}
