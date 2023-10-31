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

export type FairAuction = {
  __typename?: 'FairAuction';
  auctionTokenDecimals: Scalars['BigInt']['output'];
  auctionTokenTotalSupply: Scalars['BigDecimal']['output'];
  circMarketCap: Scalars['BigDecimal']['output'];
  currentRaised: Scalars['BigDecimal']['output'];
  endTime: Scalars['BigInt']['output'];
  fairAuctionFactory: FairAuctionFactory;
  finalPrice: Scalars['BigDecimal']['output'];
  hardcap: Scalars['BigDecimal']['output'];
  id: Scalars['Bytes']['output'];
  maxTokenToDistribute: Scalars['BigDecimal']['output'];
  minToRaise: Scalars['BigDecimal']['output'];
  name: Scalars['String']['output'];
  presaleType: Scalars['String']['output'];
  priceTracker?: Maybe<Array<FairAuctionPriceTracker>>;
  projectToken1: Scalars['String']['output'];
  projectToken2: Scalars['String']['output'];
  saleToken: Scalars['Bytes']['output'];
  saleTokenDecimals: Scalars['BigInt']['output'];
  startTime: Scalars['BigInt']['output'];
  wlStage: Scalars['Boolean']['output'];
};


export type FairAuctionPriceTrackerArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FairAuctionPriceTracker_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<FairAuctionPriceTracker_Filter>;
};

export type FairAuctionFactory = {
  __typename?: 'FairAuctionFactory';
  fairAuctions: Array<FairAuction>;
  id: Scalars['ID']['output'];
};


export type FairAuctionFactoryFairAuctionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FairAuction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<FairAuction_Filter>;
};

export type FairAuctionFactory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<FairAuctionFactory_Filter>>>;
  fairAuctions_?: InputMaybe<FairAuction_Filter>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<FairAuctionFactory_Filter>>>;
};

export enum FairAuctionFactory_OrderBy {
  FairAuctions = 'fairAuctions',
  Id = 'id'
}

export type FairAuctionPriceTracker = {
  __typename?: 'FairAuctionPriceTracker';
  amount: Scalars['BigInt']['output'];
  currentPrice: Scalars['BigDecimal']['output'];
  fairAuction: FairAuction;
  id: Scalars['ID']['output'];
  timestamp: Scalars['BigInt']['output'];
  user: Scalars['Bytes']['output'];
};

export type FairAuctionPriceTracker_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<FairAuctionPriceTracker_Filter>>>;
  currentPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  currentPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  fairAuction?: InputMaybe<Scalars['String']['input']>;
  fairAuction_?: InputMaybe<FairAuction_Filter>;
  fairAuction_contains?: InputMaybe<Scalars['String']['input']>;
  fairAuction_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuction_ends_with?: InputMaybe<Scalars['String']['input']>;
  fairAuction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuction_gt?: InputMaybe<Scalars['String']['input']>;
  fairAuction_gte?: InputMaybe<Scalars['String']['input']>;
  fairAuction_in?: InputMaybe<Array<Scalars['String']['input']>>;
  fairAuction_lt?: InputMaybe<Scalars['String']['input']>;
  fairAuction_lte?: InputMaybe<Scalars['String']['input']>;
  fairAuction_not?: InputMaybe<Scalars['String']['input']>;
  fairAuction_not_contains?: InputMaybe<Scalars['String']['input']>;
  fairAuction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuction_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  fairAuction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuction_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  fairAuction_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  fairAuction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuction_starts_with?: InputMaybe<Scalars['String']['input']>;
  fairAuction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<FairAuctionPriceTracker_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  user?: InputMaybe<Scalars['Bytes']['input']>;
  user_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_gt?: InputMaybe<Scalars['Bytes']['input']>;
  user_gte?: InputMaybe<Scalars['Bytes']['input']>;
  user_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user_lt?: InputMaybe<Scalars['Bytes']['input']>;
  user_lte?: InputMaybe<Scalars['Bytes']['input']>;
  user_not?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum FairAuctionPriceTracker_OrderBy {
  Amount = 'amount',
  CurrentPrice = 'currentPrice',
  FairAuction = 'fairAuction',
  FairAuctionAuctionTokenDecimals = 'fairAuction__auctionTokenDecimals',
  FairAuctionAuctionTokenTotalSupply = 'fairAuction__auctionTokenTotalSupply',
  FairAuctionCircMarketCap = 'fairAuction__circMarketCap',
  FairAuctionCurrentRaised = 'fairAuction__currentRaised',
  FairAuctionEndTime = 'fairAuction__endTime',
  FairAuctionFinalPrice = 'fairAuction__finalPrice',
  FairAuctionHardcap = 'fairAuction__hardcap',
  FairAuctionId = 'fairAuction__id',
  FairAuctionMaxTokenToDistribute = 'fairAuction__maxTokenToDistribute',
  FairAuctionMinToRaise = 'fairAuction__minToRaise',
  FairAuctionName = 'fairAuction__name',
  FairAuctionPresaleType = 'fairAuction__presaleType',
  FairAuctionProjectToken1 = 'fairAuction__projectToken1',
  FairAuctionProjectToken2 = 'fairAuction__projectToken2',
  FairAuctionSaleToken = 'fairAuction__saleToken',
  FairAuctionSaleTokenDecimals = 'fairAuction__saleTokenDecimals',
  FairAuctionStartTime = 'fairAuction__startTime',
  FairAuctionWlStage = 'fairAuction__wlStage',
  Id = 'id',
  Timestamp = 'timestamp',
  User = 'user'
}

export type FairAuction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<FairAuction_Filter>>>;
  auctionTokenDecimals?: InputMaybe<Scalars['BigInt']['input']>;
  auctionTokenDecimals_gt?: InputMaybe<Scalars['BigInt']['input']>;
  auctionTokenDecimals_gte?: InputMaybe<Scalars['BigInt']['input']>;
  auctionTokenDecimals_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  auctionTokenDecimals_lt?: InputMaybe<Scalars['BigInt']['input']>;
  auctionTokenDecimals_lte?: InputMaybe<Scalars['BigInt']['input']>;
  auctionTokenDecimals_not?: InputMaybe<Scalars['BigInt']['input']>;
  auctionTokenDecimals_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  auctionTokenTotalSupply?: InputMaybe<Scalars['BigDecimal']['input']>;
  auctionTokenTotalSupply_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  auctionTokenTotalSupply_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  auctionTokenTotalSupply_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  auctionTokenTotalSupply_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  auctionTokenTotalSupply_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  auctionTokenTotalSupply_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  auctionTokenTotalSupply_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  circMarketCap?: InputMaybe<Scalars['BigDecimal']['input']>;
  circMarketCap_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  circMarketCap_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  circMarketCap_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  circMarketCap_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  circMarketCap_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  circMarketCap_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  circMarketCap_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  currentRaised?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentRaised_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentRaised_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentRaised_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  currentRaised_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentRaised_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentRaised_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  currentRaised_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  endTime?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  endTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  endTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fairAuctionFactory?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_?: InputMaybe<FairAuctionFactory_Filter>;
  fairAuctionFactory_contains?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_ends_with?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_gt?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_gte?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_in?: InputMaybe<Array<Scalars['String']['input']>>;
  fairAuctionFactory_lt?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_lte?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_not?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_not_contains?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  fairAuctionFactory_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_starts_with?: InputMaybe<Scalars['String']['input']>;
  fairAuctionFactory_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  finalPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  finalPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  finalPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  finalPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  finalPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  finalPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  finalPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  finalPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  hardcap?: InputMaybe<Scalars['BigDecimal']['input']>;
  hardcap_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  hardcap_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  hardcap_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  hardcap_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  hardcap_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  hardcap_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  hardcap_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
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
  maxTokenToDistribute?: InputMaybe<Scalars['BigDecimal']['input']>;
  maxTokenToDistribute_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  maxTokenToDistribute_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  maxTokenToDistribute_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  maxTokenToDistribute_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  maxTokenToDistribute_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  maxTokenToDistribute_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  maxTokenToDistribute_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  minToRaise?: InputMaybe<Scalars['BigDecimal']['input']>;
  minToRaise_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  minToRaise_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  minToRaise_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  minToRaise_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  minToRaise_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  minToRaise_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  minToRaise_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<FairAuction_Filter>>>;
  presaleType?: InputMaybe<Scalars['String']['input']>;
  presaleType_contains?: InputMaybe<Scalars['String']['input']>;
  presaleType_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  presaleType_ends_with?: InputMaybe<Scalars['String']['input']>;
  presaleType_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  presaleType_gt?: InputMaybe<Scalars['String']['input']>;
  presaleType_gte?: InputMaybe<Scalars['String']['input']>;
  presaleType_in?: InputMaybe<Array<Scalars['String']['input']>>;
  presaleType_lt?: InputMaybe<Scalars['String']['input']>;
  presaleType_lte?: InputMaybe<Scalars['String']['input']>;
  presaleType_not?: InputMaybe<Scalars['String']['input']>;
  presaleType_not_contains?: InputMaybe<Scalars['String']['input']>;
  presaleType_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  presaleType_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  presaleType_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  presaleType_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  presaleType_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  presaleType_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  presaleType_starts_with?: InputMaybe<Scalars['String']['input']>;
  presaleType_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  priceTracker_?: InputMaybe<FairAuctionPriceTracker_Filter>;
  projectToken1?: InputMaybe<Scalars['String']['input']>;
  projectToken1_contains?: InputMaybe<Scalars['String']['input']>;
  projectToken1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken1_ends_with?: InputMaybe<Scalars['String']['input']>;
  projectToken1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken1_gt?: InputMaybe<Scalars['String']['input']>;
  projectToken1_gte?: InputMaybe<Scalars['String']['input']>;
  projectToken1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  projectToken1_lt?: InputMaybe<Scalars['String']['input']>;
  projectToken1_lte?: InputMaybe<Scalars['String']['input']>;
  projectToken1_not?: InputMaybe<Scalars['String']['input']>;
  projectToken1_not_contains?: InputMaybe<Scalars['String']['input']>;
  projectToken1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  projectToken1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  projectToken1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  projectToken1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken1_starts_with?: InputMaybe<Scalars['String']['input']>;
  projectToken1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken2?: InputMaybe<Scalars['String']['input']>;
  projectToken2_contains?: InputMaybe<Scalars['String']['input']>;
  projectToken2_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken2_ends_with?: InputMaybe<Scalars['String']['input']>;
  projectToken2_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken2_gt?: InputMaybe<Scalars['String']['input']>;
  projectToken2_gte?: InputMaybe<Scalars['String']['input']>;
  projectToken2_in?: InputMaybe<Array<Scalars['String']['input']>>;
  projectToken2_lt?: InputMaybe<Scalars['String']['input']>;
  projectToken2_lte?: InputMaybe<Scalars['String']['input']>;
  projectToken2_not?: InputMaybe<Scalars['String']['input']>;
  projectToken2_not_contains?: InputMaybe<Scalars['String']['input']>;
  projectToken2_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken2_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  projectToken2_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken2_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  projectToken2_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  projectToken2_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectToken2_starts_with?: InputMaybe<Scalars['String']['input']>;
  projectToken2_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  saleToken?: InputMaybe<Scalars['Bytes']['input']>;
  saleTokenDecimals?: InputMaybe<Scalars['BigInt']['input']>;
  saleTokenDecimals_gt?: InputMaybe<Scalars['BigInt']['input']>;
  saleTokenDecimals_gte?: InputMaybe<Scalars['BigInt']['input']>;
  saleTokenDecimals_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  saleTokenDecimals_lt?: InputMaybe<Scalars['BigInt']['input']>;
  saleTokenDecimals_lte?: InputMaybe<Scalars['BigInt']['input']>;
  saleTokenDecimals_not?: InputMaybe<Scalars['BigInt']['input']>;
  saleTokenDecimals_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  saleToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  saleToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  saleToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  saleToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  saleToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  saleToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  saleToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  saleToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  saleToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  startTime?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  startTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  wlStage?: InputMaybe<Scalars['Boolean']['input']>;
  wlStage_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  wlStage_not?: InputMaybe<Scalars['Boolean']['input']>;
  wlStage_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

export enum FairAuction_OrderBy {
  AuctionTokenDecimals = 'auctionTokenDecimals',
  AuctionTokenTotalSupply = 'auctionTokenTotalSupply',
  CircMarketCap = 'circMarketCap',
  CurrentRaised = 'currentRaised',
  EndTime = 'endTime',
  FairAuctionFactory = 'fairAuctionFactory',
  FairAuctionFactoryId = 'fairAuctionFactory__id',
  FinalPrice = 'finalPrice',
  Hardcap = 'hardcap',
  Id = 'id',
  MaxTokenToDistribute = 'maxTokenToDistribute',
  MinToRaise = 'minToRaise',
  Name = 'name',
  PresaleType = 'presaleType',
  PriceTracker = 'priceTracker',
  ProjectToken1 = 'projectToken1',
  ProjectToken2 = 'projectToken2',
  SaleToken = 'saleToken',
  SaleTokenDecimals = 'saleTokenDecimals',
  StartTime = 'startTime',
  WlStage = 'wlStage'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type PluginTotalSupply = {
  __typename?: 'PluginTotalSupply';
  id: Scalars['Bytes']['output'];
  totalSupply: Scalars['BigInt']['output'];
};

export type PluginTotalSupply_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PluginTotalSupply_Filter>>>;
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
  or?: InputMaybe<Array<InputMaybe<PluginTotalSupply_Filter>>>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum PluginTotalSupply_OrderBy {
  Id = 'id',
  TotalSupply = 'totalSupply'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  fairAuction?: Maybe<FairAuction>;
  fairAuctionFactories: Array<FairAuctionFactory>;
  fairAuctionFactory?: Maybe<FairAuctionFactory>;
  fairAuctionPriceTracker?: Maybe<FairAuctionPriceTracker>;
  fairAuctionPriceTrackers: Array<FairAuctionPriceTracker>;
  fairAuctions: Array<FairAuction>;
  pluginTotalSupplies: Array<PluginTotalSupply>;
  pluginTotalSupply?: Maybe<PluginTotalSupply>;
  user?: Maybe<User>;
  userInAuction?: Maybe<UserInAuction>;
  userInAuctions: Array<UserInAuction>;
  users: Array<User>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryFairAuctionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFairAuctionFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FairAuctionFactory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FairAuctionFactory_Filter>;
};


export type QueryFairAuctionFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFairAuctionPriceTrackerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFairAuctionPriceTrackersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FairAuctionPriceTracker_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FairAuctionPriceTracker_Filter>;
};


export type QueryFairAuctionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FairAuction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FairAuction_Filter>;
};


export type QueryPluginTotalSuppliesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PluginTotalSupply_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PluginTotalSupply_Filter>;
};


export type QueryPluginTotalSupplyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUserInAuctionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUserInAuctionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserInAuction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UserInAuction_Filter>;
};


export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  fairAuction?: Maybe<FairAuction>;
  fairAuctionFactories: Array<FairAuctionFactory>;
  fairAuctionFactory?: Maybe<FairAuctionFactory>;
  fairAuctionPriceTracker?: Maybe<FairAuctionPriceTracker>;
  fairAuctionPriceTrackers: Array<FairAuctionPriceTracker>;
  fairAuctions: Array<FairAuction>;
  pluginTotalSupplies: Array<PluginTotalSupply>;
  pluginTotalSupply?: Maybe<PluginTotalSupply>;
  user?: Maybe<User>;
  userInAuction?: Maybe<UserInAuction>;
  userInAuctions: Array<UserInAuction>;
  users: Array<User>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionFairAuctionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionFairAuctionFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FairAuctionFactory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FairAuctionFactory_Filter>;
};


export type SubscriptionFairAuctionFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionFairAuctionPriceTrackerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionFairAuctionPriceTrackersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FairAuctionPriceTracker_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FairAuctionPriceTracker_Filter>;
};


export type SubscriptionFairAuctionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FairAuction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FairAuction_Filter>;
};


export type SubscriptionPluginTotalSuppliesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PluginTotalSupply_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PluginTotalSupply_Filter>;
};


export type SubscriptionPluginTotalSupplyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUserInAuctionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUserInAuctionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserInAuction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UserInAuction_Filter>;
};


export type SubscriptionUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type User = {
  __typename?: 'User';
  balance: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
};

export type UserInAuction = {
  __typename?: 'UserInAuction';
  fairAuction: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  user: Scalars['Bytes']['output'];
  value: Scalars['BigInt']['output'];
};

export type UserInAuction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<UserInAuction_Filter>>>;
  fairAuction?: InputMaybe<Scalars['Bytes']['input']>;
  fairAuction_contains?: InputMaybe<Scalars['Bytes']['input']>;
  fairAuction_gt?: InputMaybe<Scalars['Bytes']['input']>;
  fairAuction_gte?: InputMaybe<Scalars['Bytes']['input']>;
  fairAuction_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fairAuction_lt?: InputMaybe<Scalars['Bytes']['input']>;
  fairAuction_lte?: InputMaybe<Scalars['Bytes']['input']>;
  fairAuction_not?: InputMaybe<Scalars['Bytes']['input']>;
  fairAuction_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  fairAuction_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<UserInAuction_Filter>>>;
  user?: InputMaybe<Scalars['Bytes']['input']>;
  user_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_gt?: InputMaybe<Scalars['Bytes']['input']>;
  user_gte?: InputMaybe<Scalars['Bytes']['input']>;
  user_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user_lt?: InputMaybe<Scalars['Bytes']['input']>;
  user_lte?: InputMaybe<Scalars['Bytes']['input']>;
  user_not?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  value?: InputMaybe<Scalars['BigInt']['input']>;
  value_gt?: InputMaybe<Scalars['BigInt']['input']>;
  value_gte?: InputMaybe<Scalars['BigInt']['input']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  value_lt?: InputMaybe<Scalars['BigInt']['input']>;
  value_lte?: InputMaybe<Scalars['BigInt']['input']>;
  value_not?: InputMaybe<Scalars['BigInt']['input']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum UserInAuction_OrderBy {
  FairAuction = 'fairAuction',
  Id = 'id',
  User = 'user',
  Value = 'value'
}

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  balance?: InputMaybe<Scalars['BigInt']['input']>;
  balance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  balance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  balance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  balance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  balance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  balance_not?: InputMaybe<Scalars['BigInt']['input']>;
  balance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
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
  or?: InputMaybe<Array<InputMaybe<User_Filter>>>;
};

export enum User_OrderBy {
  Balance = 'balance',
  Id = 'id'
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

export type GetFairAuctionQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetFairAuctionQuery = { __typename?: 'Query', fairAuction?: { __typename?: 'FairAuction', id: any, name: string, presaleType: string, hardcap: any, wlStage: boolean, maxTokenToDistribute: any, auctionTokenDecimals: any, saleToken: any, saleTokenDecimals: any, minToRaise: any, startTime: any, endTime: any, currentRaised: any, finalPrice: any, circMarketCap: any, auctionTokenTotalSupply: any, priceTracker?: Array<{ __typename?: 'FairAuctionPriceTracker', currentPrice: any }> | null } | null };

export type GetFairAuctionPriceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetFairAuctionPriceQuery = { __typename?: 'Query', fairAuction?: { __typename?: 'FairAuction', priceTracker?: Array<{ __typename?: 'FairAuctionPriceTracker', currentPrice: any, timestamp: any }> | null } | null };


export const GetFairAuctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFairAuction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fairAuction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"presaleType"}},{"kind":"Field","name":{"kind":"Name","value":"hardcap"}},{"kind":"Field","name":{"kind":"Name","value":"wlStage"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokenToDistribute"}},{"kind":"Field","name":{"kind":"Name","value":"auctionTokenDecimals"}},{"kind":"Field","name":{"kind":"Name","value":"saleToken"}},{"kind":"Field","name":{"kind":"Name","value":"saleTokenDecimals"}},{"kind":"Field","name":{"kind":"Name","value":"minToRaise"}},{"kind":"Field","name":{"kind":"Name","value":"maxTokenToDistribute"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"currentRaised"}},{"kind":"Field","name":{"kind":"Name","value":"finalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"circMarketCap"}},{"kind":"Field","name":{"kind":"Name","value":"auctionTokenTotalSupply"}},{"kind":"Field","name":{"kind":"Name","value":"priceTracker"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"currentPrice"}},{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"EnumValue","value":"desc"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentPrice"}}]}}]}}]}}]} as unknown as DocumentNode<GetFairAuctionQuery, GetFairAuctionQueryVariables>;
export const GetFairAuctionPriceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFairAuctionPrice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fairAuction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"priceTracker"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"timestamp"}},{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"EnumValue","value":"asc"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentPrice"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]} as unknown as DocumentNode<GetFairAuctionPriceQuery, GetFairAuctionPriceQueryVariables>;