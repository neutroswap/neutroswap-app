import EthLogo from "@/public/logo/eth.svg";
import NeutroLogo from "@/public/logo/neutro_token.svg";
import EpochLogo from "@/public/logo/epoch.svg";
import DeallocationLogo from "@/public/logo/deallocation.svg";
import APYLogo from "@/public/logo/apy.svg";
import AllocationLogo from "@/public/logo/allocation.svg";
import { useContractReads, useNetwork } from "wagmi";
import {
  NEXT_PUBLIC_DIVIDENDS_CONTRACT,
  NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT,
} from "@/shared/helpers/constants";
import { DIVIDENDS_ABI, NEUTRO_HELPER_ABI } from "@/shared/abi";
import { formatEther, formatUnits } from "viem";
import { currencyFormat } from "@/shared/utils";
import Countdown from "@/components/modules/Countdown";
import UserDividends from "./modules/UserDividends";
import {
  DIVIDENDS_CONTRACT,
  NEUTRO_HELPER_CONTRACT,
} from "@/shared/helpers/contract";
import { useMemo } from "react";
import { Token } from "@/shared/types/tokens.types";
import { tokens } from "@/shared/statics/tokenList";
import { SupportedChainID } from "@/shared/types/chain.types";
import getPairInfo from "@/shared/getters/getPairInfo";
import TokenLogo from "@/components/modules/TokenLogo";
import dayjs from "dayjs";

interface Reward extends Omit<Token, "logo"> {
  logo: string[];
}

export default function Dividend() {
  const { chain } = useNetwork();

  const { data } = useContractReads({
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
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "deallocationFeePlugin",
        args: [DIVIDENDS_CONTRACT],
      } as const,
      {
        address: DIVIDENDS_CONTRACT,
        abi: DIVIDENDS_ABI,
        functionName: "nextCycleStartTime",
      } as const,
      {
        address: DIVIDENDS_CONTRACT,
        abi: DIVIDENDS_ABI,
        functionName: "currentCycleStartTime",
      } as const,
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "dividendsDistributedTokensRewards",
      } as const,
    ],
  });
  const totalCurrentEpoch =
    BigInt(data?.[4][0]?.currentDistributionAmountInUsd ?? 0) +
    BigInt(data?.[4][1]?.currentDistributionAmountInUsd ?? 0);

  const totalAllocation = formatEther(data?.[0] ?? BigInt(0));
  const deallocationFee = formatEther(data?.[1] ?? BigInt(0));

  //countdown utils
  // const protocolEarningsTime = Math.floor(Number(data?.[2]));

  const nextCycleDate = dayjs.unix(Number(data?.[2])).format("MMMM D, YYYY");

  const addressToTokenInfo = useMemo(() => {
    if (!chain || chain.unsupported) return new Map<`0x${string}`, Token>();
    return new Map(
      tokens[chain.id as SupportedChainID].map((item) => [item.address, item])
    );
  }, [chain]);

  function getRewardInfo(address: `0x${string}`): Reward {
    const info = addressToTokenInfo.get(address);
    if (!info) {
      getPairInfo(address).then((pair) => {
        if (!pair[0] || !pair[1]) return;
        const lpInfo: Reward = {
          name: `NEUTRO LP Token`,
          address: address,
          symbol: `${pair[0].symbol}-${pair[1].symbol} LP`,
          logo: [pair[0].logo, pair[1].logo],
          decimal: 18,
        };
        return lpInfo;
      });
      return {
        name: `Unknown LP Token`,
        address: address,
        symbol: `Unknown LP`,
        logo: [],
        decimal: 18,
      };
    }
    return {
      ...info,
      logo: [info.logo],
    };
  }

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
                    Reward Current Epochs
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    $
                    {currencyFormat(
                      parseFloat(formatEther(BigInt(totalCurrentEpoch)))
                    )}
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
                    0%
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
                  Protocol Earnings
                </p>
              </div>

              {/* Need to change numbering format */}
              <div className="flex">
                {!!data &&
                  data[4].map((reward) => {
                    const info = getRewardInfo(reward.token);
                    if (!info) return null;
                    return (
                      <div className="flex w-1/2 items-center md:pl-8 m-0 ">
                        <div className="flex items-center ">
                          <div className="flex">
                            {info.logo.map((logo) => (
                              <TokenLogo
                                className="w-8 h-8"
                                src={logo}
                                key={logo}
                              />
                            ))}
                          </div>
                          <div className="ml-2">
                            <span className="text-sm text-neutral-500">
                              {info.symbol}
                            </span>
                            <div className="mt-0 text-sm">
                              {formatUnits(
                                BigInt(reward.currentDistributionAmount ?? 0),
                                info.decimal
                              )}{" "}
                              {info.symbol} &nbsp;
                              <span className="text-neutral-500 text-xs">
                                $
                                {currencyFormat(
                                  parseFloat(
                                    formatEther(
                                      BigInt(
                                        reward.currentDistributionAmountInUsd
                                      )
                                    )
                                  ),
                                  2,
                                  0.01
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <hr className="my-4 w-full border-neutral-200/80 dark:border-neutral-800/80" />
              <div className="flex flex-col justify-between items-start p-2 m-5 py-0">
                <p className="m-0 text-left whitespace-nowrap text-sm text-muted-foreground">
                  Next distribution is scheduled at: {nextCycleDate}
                </p>
              </div>
            </div>
          </div>
        </div>
        <UserDividends />
      </div>
    </div>
  );
}
