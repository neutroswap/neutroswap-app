import EpochLogo from "@/public/logo/epoch.svg";
import DeallocationLogo from "@/public/logo/deallocation.svg";
import APRLogo from "@/public/logo/apy.svg";
import AllocationLogo from "@/public/logo/allocation.svg";
import { useAccount, useContractReads, useNetwork } from "wagmi";
import { DIVIDENDS_ABI, NEUTRO_HELPER_ABI } from "@/shared/abi";
import { formatEther } from "viem";
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
import { DEFAULT_CHAIN_ID, SupportedChainID } from "@/shared/types/chain.types";
import getPairInfo from "@/shared/getters/getPairInfo";
import TokenLogo from "@/components/modules/TokenLogo";

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
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "getNeutroPrice",
      } as const,
    ],
  });
  const totalCurrentEpoch =
    BigInt(data?.[4][0]?.currentDistributionAmountInUsd ?? 0) +
    BigInt(data?.[4][1]?.currentDistributionAmountInUsd ?? 0);

  const totalAllocation = formatEther(data?.[0] ?? BigInt(0));
  const deallocationFee = data?.[1] ?? BigInt(0);

  //countdown utils
  const protocolEarningsTime = Math.floor(Number(data?.[2]));

  // const nextCycleDate = dayjs.unix(Number(data?.[2])).format("MMMM D, YYYY");

  const addressToTokenInfo = useMemo(() => {
    if (!chain || chain.unsupported)
      return new Map(
        tokens[DEFAULT_CHAIN_ID.id].map((item) => [item.address, item])
      );
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

  const totalCurrentDistributionAmount =
    data?.[4]
      ?.map((reward) => BigInt(reward.currentDistributionAmountInUsd ?? "0"))
      ?.reduce((total, amount) => total + amount, BigInt(0)) ?? BigInt(0);

  const getNeutroPrice = formatEther(data?.[5] ?? BigInt(0));

  const totalAllocationInDollar =
    parseFloat(totalAllocation) * parseFloat(getNeutroPrice);

  const totalAPR =
    ((parseFloat(formatEther(totalCurrentDistributionAmount)) * 52) /
      totalAllocationInDollar) *
    100;

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
      <div className="flex flex-col md:flex-row w-full box-border">
        <div className="flex flex-col md:flex-row w-full box-border">
          <div className="md:flex md:space-x-3 w-full box-border">
            <div className="md:w-1/4">
              <div className="col-span-12 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
                <div className="px-2 py-1">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                        Allocated <span className="normal-case">xNEUTRO</span>
                      </span>
                      <div className="flex space-x-1">
                        <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-semibold">
                          {Number(totalAllocation).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <AllocationLogo className="w-7 h-7 text-primary rounded-full mt-3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/4 mt-4 md:mt-0">
              <div className="col-span-12 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
                <div className="px-2 py-1">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                        Total Reward Current Epochs
                      </span>
                      <div className="flex space-x-1">
                        <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-semibold">
                          $
                          {currencyFormat(
                            parseFloat(formatEther(BigInt(totalCurrentEpoch)))
                          )}
                        </span>
                      </div>
                    </div>
                    <EpochLogo className="w-7 h-7 text-primary rounded-full mt-3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/4 mt-4 md:mt-0">
              <div className="col-span-12 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
                <div className="px-2 py-1">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                        Total APR
                      </span>
                      <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-semibold">
                        {!!totalAPR ? totalAPR.toFixed(2) : "0"}%
                      </span>
                    </div>
                    <APRLogo className="w-7 h-7 text-primary rounded-full mt-3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/4 mt-4 md:mt-0">
              <div className="col-span-12 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
                <div className="px-2 py-1">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                        Deallocation Fee
                      </span>
                      <div className="flex space-x-1">
                        <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-semibold">
                          {Number(deallocationFee) / 100}%
                        </span>
                      </div>
                    </div>
                    <DeallocationLogo className="w-7 h-7 text-primary rounded-full mt-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 w-full box-border sm:space-x-3">
        <div className="sm:col-span-7 w-full mt-8">
          {!!data && (
            <div className="flex flex-col rounded">
              <div className="border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm md:dark:shadow-dark-lg">
                <div className="flex flex-col">
                  <div className="flex flex-row justify-between items-start md:p-8 -mb-7">
                    <span className="m-4 sm:m-0 text-left font-semibold whitespace-nowrap">
                      Current Epoch Details
                    </span>
                  </div>

                  <div className="flex flex-wrap">
                    {!!data &&
                      data[4].map((reward, index) => {
                        const info = getRewardInfo(reward.token);
                        const currentDistributionAmount = BigInt(
                          reward.currentDistributionAmount ?? 0
                        );
                        const formattedDistributedAmount = parseFloat(
                          formatEther(currentDistributionAmount)
                        ).toFixed(5);
                        if (!info) return null;
                        return (
                          <div
                            className="flex w-full sm:w-1/2 items-center mt-4 sm:mt-0 pl-0 sm:pl-8 m-4 sm:m-0"
                            key={index}
                          >
                            <div className="flex items-center">
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
                                  <span className="text-neutral-500 text-xs">
                                    {formattedDistributedAmount} {info.symbol}
                                  </span>
                                  &nbsp;$
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
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <hr className="my-4 w-full border-neutral-200/80 dark:border-neutral-800/80" />

                <div className="flex flex-col justify-between items-start p-2 m-5 py-0">
                  <p className="m-0 text-left whitespace-nowrap text-sm text-muted-foreground">
                    Next distribution is scheduled at:{" "}
                    <span className="inline-block">
                      <Countdown targetEpochTime={protocolEarningsTime} />
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <UserDividends />
      </div>
    </div>
  );
}
