import { graphql } from "../types/nft";

export const getNitroPoolDetailsQuery = graphql(`
  query GetNitroPoolDetailsQuery($id: Bytes!) {
    nitroPools(where: { id: $id }) {
      requirements {
        depositAmountReq
        depositEndTime
        description
        lockEndReq
        endTime
        harvestStartTime
        lockDurationReq
        lockEndReq
        startTime
        whitelist
      }
      rewardsToken1
      rewardsToken2
      totalLpToken
      nftPool {
        id
        lpToken
        nitroPool {
          totalLpToken
        }
      }
    }
  }
`);

export const getNitroPoolList = graphql(`
  query GetNitroPoolList($pool_list: [Bytes!]) {
    nftPools(where: { lpToken_in: $pool_list }) {
      lpToken
      nitroPool {
        totalLpToken
        rewardsToken1
        rewardsToken2
        requirements {
          whitelist
          startTime
          lockEndReq
          lockDurationReq
          harvestStartTime
          endTime
          description
          depositEndTime
          depositAmountReq
        }
      }
    }
  }
`);

export const getNitroPoolListQuery = graphql(`
  query GetNitroPoolListQuery {
    nitroPools(where: { nftPool_: { id_contains: "0x" } }) {
      nftPool {
        id
        lpToken
      }
      id
      totalLpToken
      rewardsToken1
      rewardsToken2
      requirements {
        whitelist
        startTime
        lockEndReq
        lockDurationReq
        harvestStartTime
        endTime
        description
        depositEndTime
        depositAmountReq
      }
    }
  }
`);

export const getSPNFTPositions = graphql(`
  query GetSPNFTPositions($address: ID!) {
    userInNFtPool(id: $address) {
      nftPoolToken(where: { status: true }) {
        id
        tokenId
        startLockTime
        lockDuration
        endLockTime
        amountLpToken
        boostPoints
        status
        stakedInNitroPool
        nftPool {
          id
          lpToken
        }
      }
    }
  }
`);
