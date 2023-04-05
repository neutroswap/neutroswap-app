// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getNetworkById } from './tokens'
import { ethers } from 'ethers'
import { ERC20_ABI } from '@/shared/abi'
import { supabaseClient } from '@/shared/helpers/supabaseClient'
import { error } from 'console'

type Data = {
  name: string
}

export async function getAllLPs () {
  const { data: liquidityTokens, error } = await supabaseClient
    .from('liquidity_tokens')
    .select('network_id,address,decimal,name,symbol,logo')
  return liquidityTokens
}

export async function getUserLP (userAddress: any) {
  try {
    let lps: any = await getAllLPs()
    console.log('lps ', lps)
    if (lps.length == 0) throw Error('lps length is 0')
    let network: any = await getNetworkById(lps[0].network_id)

    const provider = new ethers.providers.JsonRpcProvider(network.rpc)
    let promises = []
    let userLPs = []
    // lps.push({
    //   address: '0xe2e894da2ce2abd4f69f2623092f2f8a0f3c41da',
    //   decimal: 18,
    //   name: 'HYDT',
    //   symbol: 'HYDT',
    //   logo: 'Default'
    // },)
    for (let i = 0; i < lps?.length; i++) {
      let lp = lps[i]

      const lpTokenContract = new ethers.Contract(
        lp.address,
        ERC20_ABI,
        provider
      )
      promises.push(lpTokenContract.balanceOf(userAddress))
    }
    let balances = await Promise.all(promises)
    console.log('balances ', balances)
    for (let i = 0; i < balances.length; i++) {
      let balance = balances[i]
      if (balance.eq(ethers.BigNumber.from(0))) {
        console.log('Balance is zero')
      } else {
        //add to the userLPs
        userLPs.push({
          ...lps[i],
          balance //add balance
        })
        console.log(`Balance is ${balance.toString()}`)
      }
    }
    console.log('lpssss ', userLPs)
    return userLPs;
  } catch (err) {
    console.error(err)
    return err;
  }
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method, body } = req

  switch (method) {
    case 'GET':
      const { userAddress } = req.query
      console.log('iser ', userAddress)
      let nonZeroLP = await getUserLP(userAddress)
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
