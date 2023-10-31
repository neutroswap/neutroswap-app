import { graphql } from "../types/launchpad";

export const getFairAuction = graphql(`
  query GetFairAuction($id: ID!) {
    fairAuction(id: $id) {
      id
      name
      presaleType
      hardcap
      wlStage
      maxTokenToDistribute
      auctionTokenDecimals
      saleToken
      saleTokenDecimals
      minToRaise
      maxTokenToDistribute
      startTime
      endTime
      currentRaised
      finalPrice
      circMarketCap
      auctionTokenTotalSupply
      priceTracker(orderBy: currentPrice, orderDirection: desc, first: 1) {
        currentPrice
      }
    }
  }
`);

export const getFairAuctionPrice = graphql(`
  query GetFairAuctionPrice($id: ID!) {
    fairAuction(id: $id) {
      priceTracker(orderBy: timestamp, orderDirection: asc) {
        currentPrice
        timestamp
      }
    }
  }
`);
