/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query GetNitroPoolDetailsQuery($id: Bytes!) {\n    nitroPools(where: { id: $id }) {\n      requirements {\n        depositAmountReq\n        depositEndTime\n        description\n        lockEndReq\n        endTime\n        harvestStartTime\n        lockDurationReq\n        lockEndReq\n        startTime\n        whitelist\n      }\n      rewardsToken1\n      rewardsToken2\n      totalLpToken\n      nftPool {\n        id\n        lpToken\n        nitroPool {\n          totalLpToken\n        }\n      }\n    }\n  }\n": types.GetNitroPoolDetailsQueryDocument,
    "\n  query GetNitroPoolList($pool_list: [Bytes!]) {\n    nftPools(where: { lpToken_in: $pool_list }) {\n      lpToken\n      nitroPool {\n        totalLpToken\n        rewardsToken1\n        rewardsToken2\n        requirements {\n          whitelist\n          startTime\n          lockEndReq\n          lockDurationReq\n          harvestStartTime\n          endTime\n          description\n          depositEndTime\n          depositAmountReq\n        }\n      }\n    }\n  }\n": types.GetNitroPoolListDocument,
    "\n  query GetNitroPoolListQuery {\n    nitroPools(where: { nftPool_: { id_contains: \"0x\" } }) {\n      nftPool {\n        id\n        lpToken\n      }\n      id\n      totalLpToken\n      rewardsToken1\n      rewardsToken2\n      requirements {\n        whitelist\n        startTime\n        lockEndReq\n        lockDurationReq\n        harvestStartTime\n        endTime\n        description\n        depositEndTime\n        depositAmountReq\n      }\n    }\n  }\n": types.GetNitroPoolListQueryDocument,
    "\n  query GetSPNFTPositions($address: ID!) {\n    userInNFtPool(id: $address) {\n      nftPoolToken(where: { status: true }) {\n        id\n        tokenId\n        startLockTime\n        lockDuration\n        endLockTime\n        amountLpToken\n        boostPoints\n        status\n        stakedInNitroPool\n        nftPool {\n          id\n          lpToken\n        }\n      }\n    }\n  }\n": types.GetSpnftPositionsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetNitroPoolDetailsQuery($id: Bytes!) {\n    nitroPools(where: { id: $id }) {\n      requirements {\n        depositAmountReq\n        depositEndTime\n        description\n        lockEndReq\n        endTime\n        harvestStartTime\n        lockDurationReq\n        lockEndReq\n        startTime\n        whitelist\n      }\n      rewardsToken1\n      rewardsToken2\n      totalLpToken\n      nftPool {\n        id\n        lpToken\n        nitroPool {\n          totalLpToken\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetNitroPoolDetailsQuery($id: Bytes!) {\n    nitroPools(where: { id: $id }) {\n      requirements {\n        depositAmountReq\n        depositEndTime\n        description\n        lockEndReq\n        endTime\n        harvestStartTime\n        lockDurationReq\n        lockEndReq\n        startTime\n        whitelist\n      }\n      rewardsToken1\n      rewardsToken2\n      totalLpToken\n      nftPool {\n        id\n        lpToken\n        nitroPool {\n          totalLpToken\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetNitroPoolList($pool_list: [Bytes!]) {\n    nftPools(where: { lpToken_in: $pool_list }) {\n      lpToken\n      nitroPool {\n        totalLpToken\n        rewardsToken1\n        rewardsToken2\n        requirements {\n          whitelist\n          startTime\n          lockEndReq\n          lockDurationReq\n          harvestStartTime\n          endTime\n          description\n          depositEndTime\n          depositAmountReq\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetNitroPoolList($pool_list: [Bytes!]) {\n    nftPools(where: { lpToken_in: $pool_list }) {\n      lpToken\n      nitroPool {\n        totalLpToken\n        rewardsToken1\n        rewardsToken2\n        requirements {\n          whitelist\n          startTime\n          lockEndReq\n          lockDurationReq\n          harvestStartTime\n          endTime\n          description\n          depositEndTime\n          depositAmountReq\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetNitroPoolListQuery {\n    nitroPools(where: { nftPool_: { id_contains: \"0x\" } }) {\n      nftPool {\n        id\n        lpToken\n      }\n      id\n      totalLpToken\n      rewardsToken1\n      rewardsToken2\n      requirements {\n        whitelist\n        startTime\n        lockEndReq\n        lockDurationReq\n        harvestStartTime\n        endTime\n        description\n        depositEndTime\n        depositAmountReq\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetNitroPoolListQuery {\n    nitroPools(where: { nftPool_: { id_contains: \"0x\" } }) {\n      nftPool {\n        id\n        lpToken\n      }\n      id\n      totalLpToken\n      rewardsToken1\n      rewardsToken2\n      requirements {\n        whitelist\n        startTime\n        lockEndReq\n        lockDurationReq\n        harvestStartTime\n        endTime\n        description\n        depositEndTime\n        depositAmountReq\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetSPNFTPositions($address: ID!) {\n    userInNFtPool(id: $address) {\n      nftPoolToken(where: { status: true }) {\n        id\n        tokenId\n        startLockTime\n        lockDuration\n        endLockTime\n        amountLpToken\n        boostPoints\n        status\n        stakedInNitroPool\n        nftPool {\n          id\n          lpToken\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSPNFTPositions($address: ID!) {\n    userInNFtPool(id: $address) {\n      nftPoolToken(where: { status: true }) {\n        id\n        tokenId\n        startLockTime\n        lockDuration\n        endLockTime\n        amountLpToken\n        boostPoints\n        status\n        stakedInNitroPool\n        nftPool {\n          id\n          lpToken\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;