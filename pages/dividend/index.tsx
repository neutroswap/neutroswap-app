import Navbar from "@/components/modules/Navbar";
import EthLogo from "@/public/logo/eth.svg";
import NeutroLogo from "@/public/logo/neutro_token.svg";
import EpochLogo from "@/public/logo/epoch.svg";
import DeallocationLogo from "@/public/logo/deallocation.svg";
import APYLogo from "@/public/logo/apy.svg";
import AllocationLogo from "@/public/logo/allocation.svg";
import { useContractReads } from "wagmi";
import {
  NEXT_PUBLIC_DIVIDENDS_CONTRACT,
  NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT,
} from "@/shared/helpers/constants";
import { DIVIDENDS_ABI, NEUTRO_HELPER_ABI } from "@/shared/abi";
import { formatEther, formatUnits } from "ethers/lib/utils.js";
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import Countdown from "@/components/modules/Countdown";
import UserDividends from "./modules/UserDividends";

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

export default function Dividend() {
  const { data } = useContractReads({
    cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT as `0x${string}`,
        abi: NEUTRO_HELPER_ABI,
        functionName: "totalAllocationAtPlugin",
        args: [NEXT_PUBLIC_DIVIDENDS_CONTRACT as `0x${string}`],
      } as const,
      {
        address: NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT as `0x${string}`,
        abi: NEUTRO_HELPER_ABI,
        functionName: "deallocationFeePlugin",
        args: [NEXT_PUBLIC_DIVIDENDS_CONTRACT as `0x${string}`],
      } as const,
      {
        address: NEXT_PUBLIC_DIVIDENDS_CONTRACT as `0x${string}`,
        abi: DIVIDENDS_ABI,
        functionName: "nextCycleStartTime",
      } as const,
      {
        address: NEXT_PUBLIC_DIVIDENDS_CONTRACT as `0x${string}`,
        abi: DIVIDENDS_ABI,
        functionName: "currentCycleStartTime",
      } as const,
      {
        address: NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT as `0x${string}`,
        abi: NEUTRO_HELPER_ABI,
        functionName: "dividendsDistributedTokensRewards",
      } as const,
    ],
  });
  const totalCurrentEpoch = data?.[4][0]?.currentDistributionAmountInUsd.sub(
    data?.[4][1]?.currentDistributionAmountInUsd
  );

  const totalAllocation = formatEther(data?.[0] ?? 0);
  const deallocationFee = formatEther(data?.[1] ?? 0);

  //countdown utils
  const protocolEarningsTime = Math.floor(Number(data?.[2]));

  return (
    <div className="flex flex-col items-center sm:items-start justify-center sm:justify-between py-16">
      <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
        Dividends
      </span>
      <div className="flex flex-col">
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Allocate xNEUTRO here to earn a share of protocol earnings in the form
          of real yield.
        </p>
      </div>

      <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />
      <div className="flex w-full box-border">
        <div className="grid grid-cols-12 w-full box-border space-x-3">
          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Total Allocation
                  </span>
                  <div className="flex space-x-1">
                    <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                      {totalAllocation}
                    </span>
                    <span className="text-sm text-neutral-500 mt-3">
                      xNEUTRO
                    </span>
                  </div>
                </div>
                <AllocationLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Current Epochs
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    ${formatEther(totalCurrentEpoch ?? 0)}
                  </span>
                </div>
                <EpochLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    APY
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    {masterData.APY}%
                  </span>
                </div>
                <APYLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Deallocation Fee
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    {deallocationFee}%
                  </span>
                </div>
                <DeallocationLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 w-full box-border space-x-3">
        <div className="col-span-7 w-full mt-8">
          <div className="flex flex-col rounded">
            <div className="border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm md:dark:shadow-dark-lg">
              <div className="flex flex-row justify-between items-start md:p-8 -mb-7">
                <p className="m-0 text-left font-semibold whitespace-nowrap">
                  Current epoch
                </p>
              </div>

              {/* Need to change numbering format */}
              <div className="flex">
                {currentEpochReward.map((item, index) => (
                  <div
                    key={index}
                    className="flex w-1/2 items-center md:pl-8 m-0 "
                  >
                    <div className="flex items-center ">
                      <div className="flex">
                        <EthLogo className="relative w-8 h-8 rounded-full" />
                        <NeutroLogo className="w-8 h-8 rounded-full -ml-2" />
                        {/* <img src={item.logoToken0} className="relative w-8 h-8 rounded-full" />
                        <img src={item.logoToken1} className="w-8 h-8 rounded-full -ml-2" /> */}
                      </div>
                      <div className="ml-2">
                        <span className="text-sm text-neutral-500">
                          {item.tokenName}
                        </span>
                        <div className="mt-0 text-sm">
                          {Number(item.amountToDistributeInToken)} &nbsp;
                          <span className="text-neutral-500 text-xs">
                            ($
                            {currencyFormat(
                              Number(item.amountToDistributeInUsd)
                            )}
                            )
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4 ml-8 w-11/12 border-neutral-200/80 dark:border-neutral-800/80" />
              <div className="flex flex-col justify-between items-start md:p-8 md:pt-0">
                <div className="flex flex-col w-full">
                  <p className="m-0 text-left font-semibold whitespace-nowrap">
                    Next epoch
                  </p>
                  <div className="grid grid-cols-3 auto-cols-max mt-2 ">
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-500">
                        Min. estimated value
                      </span>
                      <span className="text-sm ">
                        ${currencyFormat(nextEpochReward.minEstValue)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-500">APY</span>
                      <span className="text-sm ">{nextEpochReward.APY}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-500">
                        Remaining time
                      </span>
                      <Countdown targetEpochTime={protocolEarningsTime} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <UserDividends />
      </div>
    </div>
  );
}
