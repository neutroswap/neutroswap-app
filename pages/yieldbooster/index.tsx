import React, { useMemo } from "react";
import {
  useQuery as useTanstackQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import EpochLogo from "@/public/logo/epoch.svg";
import APYLogo from "@/public/logo/apy.svg";
import AllocationLogo from "@/public/logo/allocation.svg";

import { useTheme, Loading, Button } from "@geist-ui/core";
import { cn, currencyFormat } from "@/shared/utils";
import { useAccount, useContractRead, useContractReads } from "wagmi";
import {
  NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT,
  NEXT_PUBLIC_YIELDBOOSTER_CONTRACT,
} from "@/shared/helpers/constants";
import { NEUTRO_HELPER_ABI, YIELDBOOSTER_ABI } from "@/shared/abi";
import { formatEther } from "viem";
import getNFTPosition from "@/shared/getters/getNFTPosition";
import { ThemeType } from "@/shared/hooks/usePrefers";
import NoContentDark from "@/public/states/empty/dark.svg";
import NoContentLight from "@/public/states/empty/light.svg";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { AddLiquidityModal } from "../positions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/elements/Table";
import TokenLogo from "@/components/modules/TokenLogo";
import dayjs from "dayjs";
import {
  Lock,
  Lightning,
  FireSimple,
  Percent,
  Info,
} from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/elements/Tooltip";
import { ChevronRight } from "lucide-react";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";
import YieldBoosterModal from "@/components/modules/Modal/YieldBoosterModal";
import { urls } from "@/shared/config/urls";
import { DEFAULT_CHAIN_ID } from "@/shared/types/chain.types";

const queryClient = new QueryClient();
export default function YieldBooster() {
  const { address } = useAccount();

  const nftClient = new Client({
    url: urls[DEFAULT_CHAIN_ID.id].NFT_GRAPH_URL,
    exchanges: [cacheExchange, fetchExchange],
  });

  const { data: userAllocation } = useContractRead({
    address: NEXT_PUBLIC_YIELDBOOSTER_CONTRACT as `0x${string}`,
    abi: YIELDBOOSTER_ABI,
    functionName: "getUserTotalAllocation",
    args: [address!],
  });
  const formattedUserAllocation = useMemo(() => {
    if (!userAllocation) return "0";
    return `${Number(formatEther(userAllocation!))}`;
  }, [userAllocation]);

  const { data } = useContractReads({
    // enabled: Boolean(address),
    cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT as `0x${string}`,
        abi: NEUTRO_HELPER_ABI,
        functionName: "totalAllocationAtPlugin",
        args: [NEXT_PUBLIC_YIELDBOOSTER_CONTRACT as `0x${string}`],
      } as const,
      {
        address: NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT as `0x${string}`,
        abi: NEUTRO_HELPER_ABI,
        functionName: "deallocationFeePlugin",
        args: [NEXT_PUBLIC_YIELDBOOSTER_CONTRACT as `0x${string}`],
      } as const,
    ],
  });

  const deallocationFee = data?.[1] ?? BigInt(0);

  return (
    <main className="flex flex-col items-center sm:items-start justify-center sm:justify-between py-16">
      <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
        Yield Booster
      </span>
      <div className="flex flex-col">
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Allocate xNEUTRO here to increase the yield of your staking positions
          up to +100%.
        </p>
      </div>
      <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />
      <div className="flex w-full box-border">
        <div className="grid grid-cols-12 w-full box-border space-x-3">
          <div className="col-span-4 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Total Allocation
                  </span>
                  <div className="flex space-x-1">
                    <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                      {formatEther(data?.[0] ?? BigInt(0))}
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

          <div className="col-span-4 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Your Allocation
                  </span>
                  <div className="flex space-x-1">
                    <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                      {formattedUserAllocation}
                    </span>
                    <span className="text-sm text-neutral-500 mt-3">
                      xNEUTRO
                    </span>
                  </div>
                </div>
                <EpochLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-4 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Deallocation Fee
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    {Number(data?.[1])}%
                  </span>
                </div>
                <APYLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row w-full space-y-6 sm:space-y-0 sm:space-x-6 mt-8">
        <div className="w-full space-y-6">
          <Provider value={nftClient}>
            <QueryClientProvider client={queryClient}>
              <SPNFTPool />
            </QueryClientProvider>
          </Provider>
        </div>
      </div>
    </main>
  );
}

function SPNFTPool() {
  const theme = useTheme();
  const { address } = useAccount();

  const { data, error, isFetching } = useTanstackQuery({
    queryKey: ["spnft.positions"],
    queryFn: async () => {
      const response = await getNFTPosition(
        address
          ? (address.toLowerCase() as `0x${string}`)
          : "0x0000000000000000000000000000000000000000"
      );
      if (!response) throw new Error("Cannot fetch spnft.positions");
      return response;
    },
    refetchOnWindowFocus: false,
  });

  if (isFetching) return <Loading scale={3} />;

  if (error || !data || !data.length) {
    return (
      <div className="flex justify-center items-center w-full">
        <div className="mt-8 text-center rounded-lg md:border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm md:dark:shadow-dark-lg w-full">
          <div className="flex flex-col items-center w-full md:p-8">
            {(theme.type as ThemeType) === "nlight" && (
              <NoContentLight className="w-40 h-40 opacity-75" />
            )}
            {(theme.type as ThemeType) === "ndark" && (
              <NoContentDark className="w-40 h-40 opacity-75" />
            )}
            <p className="text-neutral-500 w-3/4">
              You do not have any liquidity positions. Add some liquidity to
              start earning.
            </p>

            <div className="flex space-x-4 mt-4">
              <Button
                className="!mt-2"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
              <Modal>
                <ModalOpenButton>
                  <Button className="!mt-2">Add Liquidity</Button>
                </ModalOpenButton>
                <ModalContents>
                  {({ close }) => <AddLiquidityModal handleClose={close} />}
                </ModalContents>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "relative flex flex-col w-full border rounded-lg bg-white dark:bg-neutral-900/50 shadow-lg shadow-slate-200 dark:shadow-black/50 overflow-hidden"
        )}
      >
        <Table>
          <TableHeader className="border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead>Staked spNFT</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-center">Settings</TableHead>
              <TableHead className="text-center">APR</TableHead>
              <TableHead className="text-left">Boost Allocation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((pool) => (
              <YieldBoosterModal key={pool.id} data={pool}>
                <TableRow
                  className="cursor-pointer group"
                  // @ts-ignore
                  type="tr"
                >
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex items-center -space-x-2 mr-2">
                        <TokenLogo
                          className="w-6 h-6"
                          src={pool.assets.token0.logo}
                        />
                        <TokenLogo
                          className="w-6 h-6"
                          src={pool.assets.token1.logo}
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 mr-4">
                          <p className="font-semibold">
                            {pool.assets.token0.symbol}
                          </p>
                          <p className="font-semibold text-muted-foreground">
                            /
                          </p>
                          <p className="font-semibold">
                            {pool.assets.token1.symbol}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground tracking-wide">
                          #ID-{pool.tokenId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>{pool.amount}</span>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const now = dayjs().unix();
                      const isLockActive = dayjs
                        .unix(now)
                        .isBefore(dayjs.unix(+pool.endLockTime));
                      return (
                        <div className="flex items-center justify-center space-x-1">
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <Percent
                                  className={cn(
                                    pool.settings.yield_bearing === true
                                      ? "text-primary"
                                      : "text-muted-foreground",
                                    "w-5 h-5"
                                  )}
                                  weight="duotone"
                                />
                              </TooltipTrigger>
                              <TooltipContent className="flex flex-col items-start">
                                <p className="text-xs font-medium">
                                  {pool.settings.yield_bearing === true
                                    ? "Active Yield Bearing"
                                    : "No Active Yield Bearing"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <Lock
                                  className={cn(
                                    isLockActive === true
                                      ? "text-primary"
                                      : "text-muted-foreground",
                                    "w-5 h-5"
                                  )}
                                  weight="duotone"
                                />
                              </TooltipTrigger>
                              <TooltipContent className="flex flex-col items-start">
                                <p className="text-xs font-medium">
                                  {isLockActive === true
                                    ? "Active Lock"
                                    : "No Active Lock"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <Lightning
                                  className={cn(
                                    pool.settings.boost === true
                                      ? "text-primary"
                                      : "text-muted-foreground",
                                    "w-5 h-5"
                                  )}
                                  weight="duotone"
                                />
                              </TooltipTrigger>
                              <TooltipContent className="flex flex-col items-start">
                                <p className="text-xs font-medium">
                                  {pool.settings.boost === true
                                    ? "Boost Active"
                                    : "No Boost Active"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <FireSimple
                                  className={cn(
                                    pool.settings.nitro !==
                                      "0x0000000000000000000000000000000000000000"
                                      ? "text-primary"
                                      : "text-muted-foreground",
                                    "w-5 h-5"
                                  )}
                                  weight="duotone"
                                />
                              </TooltipTrigger>
                              <TooltipContent className="flex flex-col items-start">
                                <p className="text-xs font-medium">
                                  {pool.settings.nitro !==
                                  "0x0000000000000000000000000000000000000000"
                                    ? "Nitro Active"
                                    : "No Nitro Active"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-center">
                    {(() => {
                      const { base, fees, nitro, multiplier } = pool.apr;
                      const bonus = (multiplier.lock + multiplier.boost) * base;
                      const total = Object.values(multiplier).reduce(
                        (prev, curr) => prev + curr,
                        base + fees + nitro + bonus
                      );
                      return (
                        <div className="flex justify-center items-center">
                          <p>{currencyFormat(total, 2, 0.01)}%</p>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground ml-1" />
                              </TooltipTrigger>
                              <TooltipContent className="flex flex-col items-start">
                                <p className="text-xs font-medium">
                                  <b>Base APR: </b>
                                  {currencyFormat(base, 2, 0.01)}%
                                </p>
                                <p className="text-xs font-medium">
                                  <b>Bonus APR: </b>
                                  {currencyFormat(bonus, 2, 0.01)}%
                                </p>
                                <p className="text-xs font-medium">
                                  <b>Fees APR: </b>
                                  {currencyFormat(fees, 2, 0.01)}%
                                </p>
                                <p className="text-xs font-medium">
                                  <b>Nitro APR: </b>
                                  {currencyFormat(nitro, 2, 0.01)}%
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <BoostAllocationTable
                      id={pool.id}
                      tokenId={pool.tokenId}
                      boost={pool.apr.multiplier.boost}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition" />
                    </div>
                  </TableCell>
                </TableRow>
              </YieldBoosterModal>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface BoostAllocationTable {
  id: `0x${string}`;
  tokenId: `0x${string}`;
  boost: number;
}

function BoostAllocationTable(props: BoostAllocationTable) {
  const { address } = useAccount();

  const YIELD_BOOSTER_CONTRACT = process.env.NEXT_PUBLIC_YIELDBOOSTER_CONTRACT;

  const { data: userAllocationInPosition } = useContractRead({
    address: YIELD_BOOSTER_CONTRACT as `0x${string}`,
    abi: YIELDBOOSTER_ABI,
    functionName: "getUserPositionAllocation",
    args: [address!, props.id, BigInt(props.tokenId)],
  });

  return (
    <div className="flex flex-col">
      <p>
        {formatEther(BigInt(userAllocationInPosition ?? 0))} {""} xNEUTRO
      </p>
      <p className="text-muted-foreground">x{(1 + props.boost).toFixed(3)}</p>
    </div>
  );
}
