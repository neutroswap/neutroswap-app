/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  /**
   * 8 bytes signed integer
   *
   */
  Int8: { input: any; output: any; }
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type NftPool = {
  __typename?: 'NftPool';
  id: Scalars['Bytes']['output'];
  lpToken: Scalars['Bytes']['output'];
  nftPoolFactory: NftPoolFactory;
  nftPoolToken?: Maybe<Array<NftPoolToken>>;
  nitroPool?: Maybe<Array<NitroPool>>;
};


export type NftPoolNftPoolTokenArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftPoolToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<NftPoolToken_Filter>;
};


export type NftPoolNitroPoolArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NitroPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<NitroPool_Filter>;
};

export type NftPoolFactory = {
  __typename?: 'NftPoolFactory';
  id: Scalars['Bytes']['output'];
  nftPool: Array<NftPool>;
};


export type NftPoolFactoryNftPoolArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<NftPool_Filter>;
};

export type NftPoolFactory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<NftPoolFactory_Filter>>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  nftPool_?: InputMaybe<NftPool_Filter>;
  or?: InputMaybe<Array<InputMaybe<NftPoolFactory_Filter>>>;
};

export enum NftPoolFactory_OrderBy {
  Id = 'id',
  NftPool = 'nftPool'
}

export type NftPoolToken = {
  __typename?: 'NftPoolToken';
  amountLpToken: Scalars['BigInt']['output'];
  boostPoints: Scalars['BigInt']['output'];
  endLockTime: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  lockDuration: Scalars['BigInt']['output'];
  nftPool: NftPool;
  stakedInNitroPool: Scalars['Bytes']['output'];
  startLockTime: Scalars['BigInt']['output'];
  status: Scalars['Boolean']['output'];
  tokenId: Scalars['BigInt']['output'];
  user: UserInNFtPool;
};

export type NftPoolToken_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amountLpToken?: InputMaybe<Scalars['BigInt']['input']>;
  amountLpToken_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amountLpToken_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amountLpToken_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amountLpToken_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amountLpToken_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amountLpToken_not?: InputMaybe<Scalars['BigInt']['input']>;
  amountLpToken_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<NftPoolToken_Filter>>>;
  boostPoints?: InputMaybe<Scalars['BigInt']['input']>;
  boostPoints_gt?: InputMaybe<Scalars['BigInt']['input']>;
  boostPoints_gte?: InputMaybe<Scalars['BigInt']['input']>;
  boostPoints_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  boostPoints_lt?: InputMaybe<Scalars['BigInt']['input']>;
  boostPoints_lte?: InputMaybe<Scalars['BigInt']['input']>;
  boostPoints_not?: InputMaybe<Scalars['BigInt']['input']>;
  boostPoints_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  endLockTime?: InputMaybe<Scalars['BigInt']['input']>;
  endLockTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  endLockTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  endLockTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  endLockTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  endLockTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  endLockTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  endLockTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lockDuration?: InputMaybe<Scalars['BigInt']['input']>;
  lockDuration_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lockDuration_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lockDuration_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lockDuration_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lockDuration_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lockDuration_not?: InputMaybe<Scalars['BigInt']['input']>;
  lockDuration_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nftPool?: InputMaybe<Scalars['String']['input']>;
  nftPool_?: InputMaybe<NftPool_Filter>;
  nftPool_contains?: InputMaybe<Scalars['String']['input']>;
  nftPool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_ends_with?: InputMaybe<Scalars['String']['input']>;
  nftPool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_gt?: InputMaybe<Scalars['String']['input']>;
  nftPool_gte?: InputMaybe<Scalars['String']['input']>;
  nftPool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nftPool_lt?: InputMaybe<Scalars['String']['input']>;
  nftPool_lte?: InputMaybe<Scalars['String']['input']>;
  nftPool_not?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nftPool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_starts_with?: InputMaybe<Scalars['String']['input']>;
  nftPool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<NftPoolToken_Filter>>>;
  stakedInNitroPool?: InputMaybe<Scalars['Bytes']['input']>;
  stakedInNitroPool_contains?: InputMaybe<Scalars['Bytes']['input']>;
  stakedInNitroPool_gt?: InputMaybe<Scalars['Bytes']['input']>;
  stakedInNitroPool_gte?: InputMaybe<Scalars['Bytes']['input']>;
  stakedInNitroPool_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  stakedInNitroPool_lt?: InputMaybe<Scalars['Bytes']['input']>;
  stakedInNitroPool_lte?: InputMaybe<Scalars['Bytes']['input']>;
  stakedInNitroPool_not?: InputMaybe<Scalars['Bytes']['input']>;
  stakedInNitroPool_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  stakedInNitroPool_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  startLockTime?: InputMaybe<Scalars['BigInt']['input']>;
  startLockTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  startLockTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  startLockTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  startLockTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  startLockTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  startLockTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  startLockTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  status?: InputMaybe<Scalars['Boolean']['input']>;
  status_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  status_not?: InputMaybe<Scalars['Boolean']['input']>;
  status_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  tokenId?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<UserInNFtPool_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum NftPoolToken_OrderBy {
  AmountLpToken = 'amountLpToken',
  BoostPoints = 'boostPoints',
  EndLockTime = 'endLockTime',
  Id = 'id',
  LockDuration = 'lockDuration',
  NftPool = 'nftPool',
  NftPoolId = 'nftPool__id',
  NftPoolLpToken = 'nftPool__lpToken',
  StakedInNitroPool = 'stakedInNitroPool',
  StartLockTime = 'startLockTime',
  Status = 'status',
  TokenId = 'tokenId',
  User = 'user',
  UserId = 'user__id'
}

export type NftPool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<NftPool_Filter>>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lpToken?: InputMaybe<Scalars['Bytes']['input']>;
  lpToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lpToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lpToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lpToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lpToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lpToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lpToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  lpToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lpToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  nftPoolFactory?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_?: InputMaybe<NftPoolFactory_Filter>;
  nftPoolFactory_contains?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_ends_with?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_gt?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_gte?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nftPoolFactory_lt?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_lte?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_not?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_not_contains?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nftPoolFactory_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_starts_with?: InputMaybe<Scalars['String']['input']>;
  nftPoolFactory_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPoolToken_?: InputMaybe<NftPoolToken_Filter>;
  nitroPool_?: InputMaybe<NitroPool_Filter>;
  or?: InputMaybe<Array<InputMaybe<NftPool_Filter>>>;
};

export enum NftPool_OrderBy {
  Id = 'id',
  LpToken = 'lpToken',
  NftPoolFactory = 'nftPoolFactory',
  NftPoolFactoryId = 'nftPoolFactory__id',
  NftPoolToken = 'nftPoolToken',
  NitroPool = 'nitroPool'
}

export type NitroPool = {
  __typename?: 'NitroPool';
  id: Scalars['Bytes']['output'];
  nftPool?: Maybe<NftPool>;
  nitroPoolFactory: NitroPoolFactory;
  requirements: NitroPoolRequirement;
  rewardsToken1: Scalars['Bytes']['output'];
  rewardsToken2: Scalars['Bytes']['output'];
  totalLpToken: Scalars['BigInt']['output'];
};

export type NitroPoolFactory = {
  __typename?: 'NitroPoolFactory';
  id: Scalars['Bytes']['output'];
  nitroPool: Array<NitroPool>;
};


export type NitroPoolFactoryNitroPoolArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NitroPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<NitroPool_Filter>;
};

export type NitroPoolFactory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<NitroPoolFactory_Filter>>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  nitroPool_?: InputMaybe<NitroPool_Filter>;
  or?: InputMaybe<Array<InputMaybe<NitroPoolFactory_Filter>>>;
};

export enum NitroPoolFactory_OrderBy {
  Id = 'id',
  NitroPool = 'nitroPool'
}

export type NitroPoolRequirement = {
  __typename?: 'NitroPoolRequirement';
  depositAmountReq: Scalars['BigInt']['output'];
  depositEndTime: Scalars['BigInt']['output'];
  description: Scalars['String']['output'];
  endTime: Scalars['BigInt']['output'];
  harvestStartTime: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  lockDurationReq: Scalars['BigInt']['output'];
  lockEndReq: Scalars['BigInt']['output'];
  nitroPool: NitroPool;
  startTime: Scalars['BigInt']['output'];
  whitelist: Scalars['Boolean']['output'];
};

export type NitroPoolRequirement_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<NitroPoolRequirement_Filter>>>;
  depositAmountReq?: InputMaybe<Scalars['BigInt']['input']>;
  depositAmountReq_gt?: InputMaybe<Scalars['BigInt']['input']>;
  depositAmountReq_gte?: InputMaybe<Scalars['BigInt']['input']>;
  depositAmountReq_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositAmountReq_lt?: InputMaybe<Scalars['BigInt']['input']>;
  depositAmountReq_lte?: InputMaybe<Scalars['BigInt']['input']>;
  depositAmountReq_not?: InputMaybe<Scalars['BigInt']['input']>;
  depositAmountReq_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositEndTime?: InputMaybe<Scalars['BigInt']['input']>;
  depositEndTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  depositEndTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  depositEndTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositEndTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  depositEndTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  depositEndTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  depositEndTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  description_contains?: InputMaybe<Scalars['String']['input']>;
  description_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  description_ends_with?: InputMaybe<Scalars['String']['input']>;
  description_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  description_gt?: InputMaybe<Scalars['String']['input']>;
  description_gte?: InputMaybe<Scalars['String']['input']>;
  description_in?: InputMaybe<Array<Scalars['String']['input']>>;
  description_lt?: InputMaybe<Scalars['String']['input']>;
  description_lte?: InputMaybe<Scalars['String']['input']>;
  description_not?: InputMaybe<Scalars['String']['input']>;
  description_not_contains?: InputMaybe<Scalars['String']['input']>;
  description_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  description_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  description_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  description_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  description_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  description_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  description_starts_with?: InputMaybe<Scalars['String']['input']>;
  description_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  endTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  harvestStartTime?: InputMaybe<Scalars['BigInt']['input']>;
  harvestStartTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  harvestStartTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  harvestStartTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  harvestStartTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  harvestStartTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  harvestStartTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  harvestStartTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lockDurationReq?: InputMaybe<Scalars['BigInt']['input']>;
  lockDurationReq_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lockDurationReq_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lockDurationReq_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lockDurationReq_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lockDurationReq_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lockDurationReq_not?: InputMaybe<Scalars['BigInt']['input']>;
  lockDurationReq_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lockEndReq?: InputMaybe<Scalars['BigInt']['input']>;
  lockEndReq_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lockEndReq_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lockEndReq_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lockEndReq_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lockEndReq_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lockEndReq_not?: InputMaybe<Scalars['BigInt']['input']>;
  lockEndReq_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nitroPool?: InputMaybe<Scalars['String']['input']>;
  nitroPool_?: InputMaybe<NitroPool_Filter>;
  nitroPool_contains?: InputMaybe<Scalars['String']['input']>;
  nitroPool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPool_ends_with?: InputMaybe<Scalars['String']['input']>;
  nitroPool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPool_gt?: InputMaybe<Scalars['String']['input']>;
  nitroPool_gte?: InputMaybe<Scalars['String']['input']>;
  nitroPool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nitroPool_lt?: InputMaybe<Scalars['String']['input']>;
  nitroPool_lte?: InputMaybe<Scalars['String']['input']>;
  nitroPool_not?: InputMaybe<Scalars['String']['input']>;
  nitroPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  nitroPool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  nitroPool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nitroPool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  nitroPool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPool_starts_with?: InputMaybe<Scalars['String']['input']>;
  nitroPool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<NitroPoolRequirement_Filter>>>;
  startTime?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  startTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  whitelist?: InputMaybe<Scalars['Boolean']['input']>;
  whitelist_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  whitelist_not?: InputMaybe<Scalars['Boolean']['input']>;
  whitelist_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

export enum NitroPoolRequirement_OrderBy {
  DepositAmountReq = 'depositAmountReq',
  DepositEndTime = 'depositEndTime',
  Description = 'description',
  EndTime = 'endTime',
  HarvestStartTime = 'harvestStartTime',
  Id = 'id',
  LockDurationReq = 'lockDurationReq',
  LockEndReq = 'lockEndReq',
  NitroPool = 'nitroPool',
  NitroPoolId = 'nitroPool__id',
  NitroPoolRewardsToken1 = 'nitroPool__rewardsToken1',
  NitroPoolRewardsToken2 = 'nitroPool__rewardsToken2',
  NitroPoolTotalLpToken = 'nitroPool__totalLpToken',
  StartTime = 'startTime',
  Whitelist = 'whitelist'
}

export type NitroPool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<NitroPool_Filter>>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  nftPool?: InputMaybe<Scalars['String']['input']>;
  nftPool_?: InputMaybe<NftPool_Filter>;
  nftPool_contains?: InputMaybe<Scalars['String']['input']>;
  nftPool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_ends_with?: InputMaybe<Scalars['String']['input']>;
  nftPool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_gt?: InputMaybe<Scalars['String']['input']>;
  nftPool_gte?: InputMaybe<Scalars['String']['input']>;
  nftPool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nftPool_lt?: InputMaybe<Scalars['String']['input']>;
  nftPool_lte?: InputMaybe<Scalars['String']['input']>;
  nftPool_not?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nftPool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  nftPool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nftPool_starts_with?: InputMaybe<Scalars['String']['input']>;
  nftPool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_?: InputMaybe<NitroPoolFactory_Filter>;
  nitroPoolFactory_contains?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_ends_with?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_gt?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_gte?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nitroPoolFactory_lt?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_lte?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_not?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_not_contains?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nitroPoolFactory_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_starts_with?: InputMaybe<Scalars['String']['input']>;
  nitroPoolFactory_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<NitroPool_Filter>>>;
  requirements_?: InputMaybe<NitroPoolRequirement_Filter>;
  rewardsToken1?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken1_contains?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken1_gt?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken1_gte?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken1_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  rewardsToken1_lt?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken1_lte?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken1_not?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken1_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken1_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  rewardsToken2?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken2_contains?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken2_gt?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken2_gte?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken2_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  rewardsToken2_lt?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken2_lte?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken2_not?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken2_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  rewardsToken2_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  totalLpToken?: InputMaybe<Scalars['BigInt']['input']>;
  totalLpToken_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalLpToken_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalLpToken_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalLpToken_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalLpToken_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalLpToken_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalLpToken_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum NitroPool_OrderBy {
  Id = 'id',
  NftPool = 'nftPool',
  NftPoolId = 'nftPool__id',
  NftPoolLpToken = 'nftPool__lpToken',
  NitroPoolFactory = 'nitroPoolFactory',
  NitroPoolFactoryId = 'nitroPoolFactory__id',
  Requirements = 'requirements',
  RequirementsDepositAmountReq = 'requirements__depositAmountReq',
  RequirementsDepositEndTime = 'requirements__depositEndTime',
  RequirementsDescription = 'requirements__description',
  RequirementsEndTime = 'requirements__endTime',
  RequirementsHarvestStartTime = 'requirements__harvestStartTime',
  RequirementsId = 'requirements__id',
  RequirementsLockDurationReq = 'requirements__lockDurationReq',
  RequirementsLockEndReq = 'requirements__lockEndReq',
  RequirementsStartTime = 'requirements__startTime',
  RequirementsWhitelist = 'requirements__whitelist',
  RewardsToken1 = 'rewardsToken1',
  RewardsToken2 = 'rewardsToken2',
  TotalLpToken = 'totalLpToken'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  nftPool?: Maybe<NftPool>;
  nftPoolFactories: Array<NftPoolFactory>;
  nftPoolFactory?: Maybe<NftPoolFactory>;
  nftPoolToken?: Maybe<NftPoolToken>;
  nftPoolTokens: Array<NftPoolToken>;
  nftPools: Array<NftPool>;
  nitroPool?: Maybe<NitroPool>;
  nitroPoolFactories: Array<NitroPoolFactory>;
  nitroPoolFactory?: Maybe<NitroPoolFactory>;
  nitroPoolRequirement?: Maybe<NitroPoolRequirement>;
  nitroPoolRequirements: Array<NitroPoolRequirement>;
  nitroPools: Array<NitroPool>;
  userInNFtPool?: Maybe<UserInNFtPool>;
  userInNFtPools: Array<UserInNFtPool>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryNftPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNftPoolFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftPoolFactory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftPoolFactory_Filter>;
};


export type QueryNftPoolFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNftPoolTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNftPoolTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftPoolToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftPoolToken_Filter>;
};


export type QueryNftPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftPool_Filter>;
};


export type QueryNitroPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNitroPoolFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NitroPoolFactory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NitroPoolFactory_Filter>;
};


export type QueryNitroPoolFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNitroPoolRequirementArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNitroPoolRequirementsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NitroPoolRequirement_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NitroPoolRequirement_Filter>;
};


export type QueryNitroPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NitroPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NitroPool_Filter>;
};


export type QueryUserInNFtPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUserInNFtPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserInNFtPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UserInNFtPool_Filter>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  nftPool?: Maybe<NftPool>;
  nftPoolFactories: Array<NftPoolFactory>;
  nftPoolFactory?: Maybe<NftPoolFactory>;
  nftPoolToken?: Maybe<NftPoolToken>;
  nftPoolTokens: Array<NftPoolToken>;
  nftPools: Array<NftPool>;
  nitroPool?: Maybe<NitroPool>;
  nitroPoolFactories: Array<NitroPoolFactory>;
  nitroPoolFactory?: Maybe<NitroPoolFactory>;
  nitroPoolRequirement?: Maybe<NitroPoolRequirement>;
  nitroPoolRequirements: Array<NitroPoolRequirement>;
  nitroPools: Array<NitroPool>;
  userInNFtPool?: Maybe<UserInNFtPool>;
  userInNFtPools: Array<UserInNFtPool>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionNftPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNftPoolFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftPoolFactory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftPoolFactory_Filter>;
};


export type SubscriptionNftPoolFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNftPoolTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNftPoolTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftPoolToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftPoolToken_Filter>;
};


export type SubscriptionNftPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftPool_Filter>;
};


export type SubscriptionNitroPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNitroPoolFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NitroPoolFactory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NitroPoolFactory_Filter>;
};


export type SubscriptionNitroPoolFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNitroPoolRequirementArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNitroPoolRequirementsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NitroPoolRequirement_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NitroPoolRequirement_Filter>;
};


export type SubscriptionNitroPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NitroPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NitroPool_Filter>;
};


export type SubscriptionUserInNFtPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUserInNFtPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserInNFtPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UserInNFtPool_Filter>;
};

export type UserInNFtPool = {
  __typename?: 'UserInNFtPool';
  id: Scalars['Bytes']['output'];
  nftPoolToken?: Maybe<Array<NftPoolToken>>;
};


export type UserInNFtPoolNftPoolTokenArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftPoolToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<NftPoolToken_Filter>;
};

export type UserInNFtPool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<UserInNFtPool_Filter>>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  nftPoolToken_?: InputMaybe<NftPoolToken_Filter>;
  or?: InputMaybe<Array<InputMaybe<UserInNFtPool_Filter>>>;
};

export enum UserInNFtPool_OrderBy {
  Id = 'id',
  NftPoolToken = 'nftPoolToken'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type GetNitroPoolDetailsQueryQueryVariables = Exact<{
  id: Scalars['Bytes']['input'];
}>;


export type GetNitroPoolDetailsQueryQuery = { __typename?: 'Query', nitroPools: Array<{ __typename?: 'NitroPool', rewardsToken1: any, rewardsToken2: any, totalLpToken: any, requirements: { __typename?: 'NitroPoolRequirement', depositAmountReq: any, depositEndTime: any, description: string, lockEndReq: any, endTime: any, harvestStartTime: any, lockDurationReq: any, startTime: any, whitelist: boolean }, nftPool?: { __typename?: 'NftPool', id: any, lpToken: any, nitroPool?: Array<{ __typename?: 'NitroPool', totalLpToken: any }> | null } | null }> };

export type GetNitroPoolListQueryVariables = Exact<{
  pool_list?: InputMaybe<Array<Scalars['Bytes']['input']> | Scalars['Bytes']['input']>;
}>;


export type GetNitroPoolListQuery = { __typename?: 'Query', nftPools: Array<{ __typename?: 'NftPool', lpToken: any, nitroPool?: Array<{ __typename?: 'NitroPool', totalLpToken: any, rewardsToken1: any, rewardsToken2: any, requirements: { __typename?: 'NitroPoolRequirement', whitelist: boolean, startTime: any, lockEndReq: any, lockDurationReq: any, harvestStartTime: any, endTime: any, description: string, depositEndTime: any, depositAmountReq: any } }> | null }> };

export type GetNitroPoolListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNitroPoolListQueryQuery = { __typename?: 'Query', nitroPools: Array<{ __typename?: 'NitroPool', id: any, totalLpToken: any, rewardsToken1: any, rewardsToken2: any, nftPool?: { __typename?: 'NftPool', id: any, lpToken: any } | null, requirements: { __typename?: 'NitroPoolRequirement', whitelist: boolean, startTime: any, lockEndReq: any, lockDurationReq: any, harvestStartTime: any, endTime: any, description: string, depositEndTime: any, depositAmountReq: any } }> };

export type GetSpnftPositionsQueryVariables = Exact<{
  address: Scalars['ID']['input'];
}>;


export type GetSpnftPositionsQuery = { __typename?: 'Query', userInNFtPool?: { __typename?: 'UserInNFtPool', nftPoolToken?: Array<{ __typename?: 'NftPoolToken', id: string, tokenId: any, startLockTime: any, lockDuration: any, endLockTime: any, amountLpToken: any, boostPoints: any, status: boolean, stakedInNitroPool: any, nftPool: { __typename?: 'NftPool', id: any, lpToken: any } }> | null } | null };


export const GetNitroPoolDetailsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNitroPoolDetailsQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Bytes"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nitroPools"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"depositAmountReq"}},{"kind":"Field","name":{"kind":"Name","value":"depositEndTime"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"lockEndReq"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"harvestStartTime"}},{"kind":"Field","name":{"kind":"Name","value":"lockDurationReq"}},{"kind":"Field","name":{"kind":"Name","value":"lockEndReq"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"whitelist"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardsToken1"}},{"kind":"Field","name":{"kind":"Name","value":"rewardsToken2"}},{"kind":"Field","name":{"kind":"Name","value":"totalLpToken"}},{"kind":"Field","name":{"kind":"Name","value":"nftPool"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lpToken"}},{"kind":"Field","name":{"kind":"Name","value":"nitroPool"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalLpToken"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetNitroPoolDetailsQueryQuery, GetNitroPoolDetailsQueryQueryVariables>;
export const GetNitroPoolListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNitroPoolList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pool_list"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Bytes"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nftPools"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"lpToken_in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pool_list"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lpToken"}},{"kind":"Field","name":{"kind":"Name","value":"nitroPool"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalLpToken"}},{"kind":"Field","name":{"kind":"Name","value":"rewardsToken1"}},{"kind":"Field","name":{"kind":"Name","value":"rewardsToken2"}},{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"whitelist"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"lockEndReq"}},{"kind":"Field","name":{"kind":"Name","value":"lockDurationReq"}},{"kind":"Field","name":{"kind":"Name","value":"harvestStartTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"depositEndTime"}},{"kind":"Field","name":{"kind":"Name","value":"depositAmountReq"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetNitroPoolListQuery, GetNitroPoolListQueryVariables>;
export const GetNitroPoolListQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNitroPoolListQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nitroPools"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"nftPool_"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id_contains"},"value":{"kind":"StringValue","value":"0x","block":false}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nftPool"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lpToken"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"totalLpToken"}},{"kind":"Field","name":{"kind":"Name","value":"rewardsToken1"}},{"kind":"Field","name":{"kind":"Name","value":"rewardsToken2"}},{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"whitelist"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"lockEndReq"}},{"kind":"Field","name":{"kind":"Name","value":"lockDurationReq"}},{"kind":"Field","name":{"kind":"Name","value":"harvestStartTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"depositEndTime"}},{"kind":"Field","name":{"kind":"Name","value":"depositAmountReq"}}]}}]}}]}}]} as unknown as DocumentNode<GetNitroPoolListQueryQuery, GetNitroPoolListQueryQueryVariables>;
export const GetSpnftPositionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSPNFTPositions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userInNFtPool"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nftPoolToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"BooleanValue","value":true}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tokenId"}},{"kind":"Field","name":{"kind":"Name","value":"startLockTime"}},{"kind":"Field","name":{"kind":"Name","value":"lockDuration"}},{"kind":"Field","name":{"kind":"Name","value":"endLockTime"}},{"kind":"Field","name":{"kind":"Name","value":"amountLpToken"}},{"kind":"Field","name":{"kind":"Name","value":"boostPoints"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"stakedInNitroPool"}},{"kind":"Field","name":{"kind":"Name","value":"nftPool"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lpToken"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetSpnftPositionsQuery, GetSpnftPositionsQueryVariables>;