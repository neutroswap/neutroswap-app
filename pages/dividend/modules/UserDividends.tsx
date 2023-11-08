import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import EthLogo from "@/public/logo/eth.svg";
import NeutroLogo from "@/public/logo/neutro_token.svg";
import AllocateDividendModal from "@/components/modules/Modal/AllocateDividendModal";
import DeallocateDividendModal from "@/components/modules/Modal/DeallocateDividendModal";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import {
  NEXT_PUBLIC_DIVIDENDS_CONTRACT,
  NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT,
  NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT,
  NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT,
} from "@/shared/helpers/constants";
import { DIVIDENDS_ABI, NEUTRO_HELPER_ABI, XNEUTRO_ABI } from "@/shared/abi";
import { useState } from "react";
import { formatEther } from "viem";
import { waitForTransaction } from "@wagmi/core";
import { currencyFormat } from "@/shared/utils";
import Countdown from "@/components/modules/Countdown";
import {
  DIVIDENDS_CONTRACT,
  NEUTRO_HELPER_CONTRACT,
  XNEUTRO_CONTRACT,
} from "@/shared/helpers/contract";

const masterData = {
  totalAllocation: 1000,
  currentEpoch: 1000,
  APY: 24.57,
  deallocationFee: 0,
  currentEpochDetails: [
    {
      tokenName: "ETH-USDC.e",
      logoToken0: "logoToken0",
      logoToken1: "logoToken1",
      amountToDistributeInToken: 0.00004,
      amountToDistributeInUsd: 20000,
    },
    {
      tokenName: "xNEUTRO",
      logoToken0: "logoToken0",
      logoToken1: "logoToken1",
      amountToDistributeInToken: 12.2,
      amountToDistributeInUsd: 1782.1,
    },
  ],
  nextEpochDetails: {
    minEstValue: 120, // in dollar
    APY: 10,
    startTime: 1692177380, // epoch
  },
};

const currentEpochReward = masterData.currentEpochDetails;
const nextEpochReward = masterData.nextEpochDetails;

const allocationData = {
  userTotalAllocation: 20.2,
  manualAllocation: 12.2,
  totalShare: 34.12,
  redeemAllocation: 12.22,
  // buat fetching ini jgn manual,
  dividendTokens: [
    {
      tokenName: "ETH-USDC.e",
      tokenAddress: 0x000000000000000,
      logoToken0: "logoToken0",
      logoToken1: "logoToken1",
      pendingAmountInToken: 1.2,
      pendingAmountInUsd: 200,
    },
    {
      tokenName: "xNEUTRO",
      tokenAddress: 0xfc43ba5d73afc7ae2745ea6c2f534b1f40871b34,
      logoToken0: "logoToken0",
      logoToken1: "logoToken1",
      pendingAmountInToken: 0.00001,
      pendingAmountInUsd: 12.82,
    },
  ],
};

const allocationReward = allocationData.dividendTokens;

export default function UserDividends() {
  const { address } = useAccount();

  const { data } = useContractReads({
    // enabled: Boolean(address),
    cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "totalAllocationAtPlugin",
        args: [DIVIDENDS_CONTRACT],
      } as const,
      {
        address: XNEUTRO_CONTRACT,
        abi: XNEUTRO_ABI,
        functionName: "getUsageApproval",
        args: [address!, DIVIDENDS_CONTRACT],
      } as const,
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "userAllocationInDividendsPlugin",
        args: [address!],
      } as const,
    ],
  });

  const userAllocationInPercent =
    !isNaN(Number(data?.[2]?.[0])) && !isNaN(Number(data?.[0]))
      ? ((Number(data?.[2]?.[0]) || 0) / (Number(data?.[0]) || 1)) * 100
      : 0;

  //Claim all button function
  const { config: harvestAllConfig, refetch: refetchHarvestAllConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address!),
      address: DIVIDENDS_CONTRACT,
      abi: DIVIDENDS_ABI,
      functionName: "harvestAllDividends",
    });
  const { write: harvestAll, isLoading: isLoadingHarvestAll } =
    useContractWrite({
      ...harvestAllConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
      },
    });
  return (
    <div className="col-span-5 mt-8 flex flex-col rounded border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg">
      <div>
        <div className="flex flex-row items-center w-full md:p-8 justify-between">
          <p className="m-0 text-left font-semibold whitespace-nowrap">
            Your allocation
          </p>
          <div className="flex space-x-4">
            <DeallocateDividendModal />
            <AllocateDividendModal />
          </div>
        </div>
        <div className="flex flex-col md:pl-8 m-0">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-sm text-neutral-500">Total Allocation</span>
              <div className="mt-1 text-sm">
                {formatEther(data?.[2][0] ?? BigInt(0))} xNEUTRO
              </div>
            </div>
            <div>
              <span className="text-sm text-neutral-500">Total Share</span>
              <div className="mt-1 text-sm">
                {userAllocationInPercent.toFixed(2)}%
              </div>
            </div>
            <div>
              <span className="text-sm text-neutral-500">
                Manual Allocation
              </span>
              <div className="mt-1 text-sm">
                {formatEther(data?.[2][1] ?? BigInt(0))} xNEUTRO
              </div>
            </div>
            <div>
              <span className="text-sm text-neutral-500">
                Redeem Allocation
              </span>
              <div className="mt-1 text-sm">
                {formatEther(data?.[2][2] ?? BigInt(0))} xNEUTRO
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-7 border-neutral-200/80 dark:border-neutral-800/80" />
      <div className="-space-y-12">
        <div className="flex flex-row items-center justify-between w-full md:p-8 md:pt-0">
          <p className="m-0 text-left font-semibold whitespace-nowrap">
            Your dividends
          </p>
          <div className="flex space-x-4">
            <Button
              className="px-4 py-2 text-white border bg-amber-500 border-orange-600/50 text-xs font-semibold hover:bg-amber-600 rounded"
              onClick={() => harvestAll?.()}
              disabled={!harvestAll}
            >
              Claim all
            </Button>
          </div>
        </div>

        {allocationReward.map((item, index) => (
          <AllocationReward key={index} data={item} />
        ))}
      </div>
    </div>
  );
}

const AllocationReward = ({ data }: { data: any }) => {
  const { address } = useAccount();

  const { refetch: infoRewards } = useContractReads({
    enabled: Boolean(address),
    cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "userPendingRewardsInDividendsPlugin",
        args: [address!],
      } as const,
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "dividendsDistributedTokensRewards",
      } as const,
    ],
  });

  //Claim individual reward button function
  const { config: harvestConfig, refetch: refetchHarvestConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address!),
      address: DIVIDENDS_CONTRACT,
      abi: DIVIDENDS_ABI,
      functionName: "harvestDividends",
      args: [data.tokenAddress as `0x${string}`],
    });
  const { write: harvest, isLoading: isLoadingHarvest } = useContractWrite({
    ...harvestConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash });
    },
  });

  return (
    <div className="flex flex-row items-center justify-between w-full md:p-8 md:mt-0">
      <div className="flex items-center">
        <div className="flex">
          <EthLogo className="relative w-8 h-8 rounded-full" />
          <NeutroLogo className="w-8 h-8 rounded-full -ml-2" />
          {/* <img
              src={data.logoToken0}
              className="relative w-8 h-8 rounded-full"
            />
            <img src={data.logoToken1} className="w-8 h-8 rounded-full -ml-2" /> */}
        </div>
        <div className="ml-2">
          <span className="text-sm text-neutral-500">{data.tokenName}</span>
          <br />
          <span className="text-sm">
            {Number(data.pendingAmountInToken)} &nbsp;
            <span className="text-neutral-500 text-xs">
              ($
              {currencyFormat(Number(data.pendingAmountInUsd))})
            </span>
          </span>
        </div>
      </div>
      <div>
        <Button
          onClick={() => harvest?.()}
          disabled={!harvest}
          className="px-5 py-2 border bg-grey-500 text-xs font-semibold rounded"
        >
          Claim
        </Button>
      </div>
    </div>
  );
};
