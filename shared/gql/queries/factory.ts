import { graphql } from "../types/factory";

export const getPair = graphql(`
  query GetPair($id: ID!, $start_date: Int!) {
    pairs(where: { id: $id }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      reserve0
      reserve1
      reserveUSD
      token0Price
      token1Price
      totalSupply
      pairDayData(where: { date_gte: $start_date }) {
        id
        dailyVolumeUSD
        dailyTxns
        date
      }
    }
  }
`);

export const getPositions = graphql(`
  query GetPositions($address: ID!) {
    liquidityPositions(
      where: { user_: { id: $address }, liquidityTokenBalance_gt: "0" }
      orderBy: liquidityTokenBalance
      orderDirection: desc
    ) {
      pair {
        id
        reserveUSD
        reserve0
        reserve1
        totalSupply
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      liquidityTokenBalance
    }
  }
`);

export const getPoolListQuery = graphql(`
  query GetPoolList($start_date: Int!) {
    pairs {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      reserve0
      reserve1
      reserveUSD
      reserveEOS
      trackedReserveEOS
      untrackedVolumeUSD
      token0Price
      token1Price
      volumeUSD
      txCount
      pairDayData(where: { date_gte: $start_date }) {
        id
        date
        dailyTxns
        dailyVolumeUSD
      }
    }
  }
`);

export const getNitroCompatibleLPList = graphql(`
  query GetNitroCompatibleLPList($pool_list: [ID!], $start_date: Int!) {
    pairs(where: { id_in: $pool_list }) {
      id
      reserveUSD
      token1 {
        id
        name
        symbol
        decimals
      }
      token0 {
        id
        name
        symbol
        decimals
      }
      pairDayData(where: { date_gte: $start_date }) {
        id
        date
      }
    }
  }
`);
