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
    "\n  query GetPair($id: ID!, $start_date: Int!) {\n    pairs(where: { id: $id }) {\n      id\n      token0 {\n        id\n        symbol\n        name\n      }\n      token1 {\n        id\n        symbol\n        name\n      }\n      reserve0\n      reserve1\n      reserveUSD\n      token0Price\n      token1Price\n      totalSupply\n      pairDayData(where: { date_gte: $start_date }) {\n        id\n        dailyVolumeUSD\n        dailyTxns\n        date\n      }\n    }\n  }\n": types.GetPairDocument,
    "\n  query GetPositions($address: ID!) {\n    liquidityPositions(\n      where: { user_: { id: $address }, liquidityTokenBalance_gt: \"0\" }\n      orderBy: liquidityTokenBalance\n      orderDirection: desc\n    ) {\n      pair {\n        id\n        reserveUSD\n        reserve0\n        reserve1\n        totalSupply\n        token0 {\n          id\n          symbol\n        }\n        token1 {\n          id\n          symbol\n        }\n      }\n      liquidityTokenBalance\n    }\n  }\n": types.GetPositionsDocument,
    "\n  query GetPoolList($start_date: Int!) {\n    neutroFactories {\n      totalLiquidityUSD\n    }\n    pairs {\n      id\n      token0 {\n        id\n        symbol\n        name\n      }\n      token1 {\n        id\n        symbol\n        name\n      }\n      reserve0\n      reserve1\n      reserveUSD\n      reserveEOS\n      trackedReserveEOS\n      untrackedVolumeUSD\n      token0Price\n      token1Price\n      volumeUSD\n      txCount\n      pairDayData(where: { date_gte: $start_date }) {\n        id\n        date\n        dailyTxns\n        dailyVolumeUSD\n      }\n    }\n  }\n": types.GetPoolListDocument,
    "\n  query GetNitroCompatibleLPList($pool_list: [ID!], $start_date: Int!) {\n    pairs(where: { id_in: $pool_list }) {\n      id\n      reserveUSD\n      token1 {\n        id\n        name\n        symbol\n        decimals\n      }\n      token0 {\n        id\n        name\n        symbol\n        decimals\n      }\n      pairDayData(where: { date_gte: $start_date }) {\n        id\n        date\n      }\n    }\n  }\n": types.GetNitroCompatibleLpListDocument,
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
export function graphql(source: "\n  query GetPair($id: ID!, $start_date: Int!) {\n    pairs(where: { id: $id }) {\n      id\n      token0 {\n        id\n        symbol\n        name\n      }\n      token1 {\n        id\n        symbol\n        name\n      }\n      reserve0\n      reserve1\n      reserveUSD\n      token0Price\n      token1Price\n      totalSupply\n      pairDayData(where: { date_gte: $start_date }) {\n        id\n        dailyVolumeUSD\n        dailyTxns\n        date\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPair($id: ID!, $start_date: Int!) {\n    pairs(where: { id: $id }) {\n      id\n      token0 {\n        id\n        symbol\n        name\n      }\n      token1 {\n        id\n        symbol\n        name\n      }\n      reserve0\n      reserve1\n      reserveUSD\n      token0Price\n      token1Price\n      totalSupply\n      pairDayData(where: { date_gte: $start_date }) {\n        id\n        dailyVolumeUSD\n        dailyTxns\n        date\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPositions($address: ID!) {\n    liquidityPositions(\n      where: { user_: { id: $address }, liquidityTokenBalance_gt: \"0\" }\n      orderBy: liquidityTokenBalance\n      orderDirection: desc\n    ) {\n      pair {\n        id\n        reserveUSD\n        reserve0\n        reserve1\n        totalSupply\n        token0 {\n          id\n          symbol\n        }\n        token1 {\n          id\n          symbol\n        }\n      }\n      liquidityTokenBalance\n    }\n  }\n"): (typeof documents)["\n  query GetPositions($address: ID!) {\n    liquidityPositions(\n      where: { user_: { id: $address }, liquidityTokenBalance_gt: \"0\" }\n      orderBy: liquidityTokenBalance\n      orderDirection: desc\n    ) {\n      pair {\n        id\n        reserveUSD\n        reserve0\n        reserve1\n        totalSupply\n        token0 {\n          id\n          symbol\n        }\n        token1 {\n          id\n          symbol\n        }\n      }\n      liquidityTokenBalance\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPoolList($start_date: Int!) {\n    neutroFactories {\n      totalLiquidityUSD\n    }\n    pairs {\n      id\n      token0 {\n        id\n        symbol\n        name\n      }\n      token1 {\n        id\n        symbol\n        name\n      }\n      reserve0\n      reserve1\n      reserveUSD\n      reserveEOS\n      trackedReserveEOS\n      untrackedVolumeUSD\n      token0Price\n      token1Price\n      volumeUSD\n      txCount\n      pairDayData(where: { date_gte: $start_date }) {\n        id\n        date\n        dailyTxns\n        dailyVolumeUSD\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPoolList($start_date: Int!) {\n    neutroFactories {\n      totalLiquidityUSD\n    }\n    pairs {\n      id\n      token0 {\n        id\n        symbol\n        name\n      }\n      token1 {\n        id\n        symbol\n        name\n      }\n      reserve0\n      reserve1\n      reserveUSD\n      reserveEOS\n      trackedReserveEOS\n      untrackedVolumeUSD\n      token0Price\n      token1Price\n      volumeUSD\n      txCount\n      pairDayData(where: { date_gte: $start_date }) {\n        id\n        date\n        dailyTxns\n        dailyVolumeUSD\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetNitroCompatibleLPList($pool_list: [ID!], $start_date: Int!) {\n    pairs(where: { id_in: $pool_list }) {\n      id\n      reserveUSD\n      token1 {\n        id\n        name\n        symbol\n        decimals\n      }\n      token0 {\n        id\n        name\n        symbol\n        decimals\n      }\n      pairDayData(where: { date_gte: $start_date }) {\n        id\n        date\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetNitroCompatibleLPList($pool_list: [ID!], $start_date: Int!) {\n    pairs(where: { id_in: $pool_list }) {\n      id\n      reserveUSD\n      token1 {\n        id\n        name\n        symbol\n        decimals\n      }\n      token0 {\n        id\n        name\n        symbol\n        decimals\n      }\n      pairDayData(where: { date_gte: $start_date }) {\n        id\n        date\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;