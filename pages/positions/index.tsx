"use client";

import React, { useState, useMemo } from "react";
import { Button, Loading, useTheme } from "@geist-ui/core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/elements/Table";
import NoContentDark from "@/public/states/empty/dark.svg";
import NoContentLight from "@/public/states/empty/light.svg";
import { currencyCompactFormat, currencyFormat } from "@/shared/utils";
import SpNftModal from "@/components/modules/Modal/SpNftModal";
import {
  useQuery as useTanstackQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Client, Provider, cacheExchange, fetchExchange, useQuery } from "urql";
import { useRouter } from "next/router";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { tokens } from "@/shared/statics/tokenList";
import {
  DEFAULT_CHAIN_ID,
  SupportedChainID,
  supportedChainID,
} from "@/shared/types/chain.types";
import { Token } from "@/shared/types/tokens.types";
import { FACTORY_CONTRACT } from "@/shared/helpers/contract";
import { NEUTRO_FACTORY_ABI } from "@/shared/abi";
import { classNames } from "@/shared/helpers/classNamer";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import { ThemeType } from "@/shared/hooks/usePrefers";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import getNFTPosition from "@/shared/getters/getNFTPosition";
import { urls } from "@/shared/config/urls";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/elements/Tabs";
import { waitForTransaction } from "@wagmi/core";
import { decodeAbiParameters, parseAbiParameters } from "viem";
import dayjs from "dayjs";
import {
  Lock,
  Lightning,
  FireSimple,
  Percent,
  Info,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/elements/Tooltip";
import { ChevronRight } from "lucide-react";
import TokenLogo from "@/components/modules/TokenLogo";
import { getPositions } from "@/shared/gql/queries/factory";
import { getTokenImageUrl } from "@/shared/getters/getTokenInfo";

const queryClient = new QueryClient();
export default function PoolPosition() {
  const { chain } = useNetwork();

  const factoryClient = new Client({
    url: urls[DEFAULT_CHAIN_ID.id].FACTORY_GRAPH_URL,
    exchanges: [cacheExchange, fetchExchange],
  });

  const nftClient = new Client({
    url: urls[DEFAULT_CHAIN_ID.id].NFT_GRAPH_URL,
    exchanges: [cacheExchange, fetchExchange],
  });

  return (
    <main className="flex flex-col items-center sm:items-start justify-between py-16">
      <div className="flex justify-between items-center w-full">
        <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
          Positions
        </span>
        <Modal>
          <ModalOpenButton>
            <Button
              auto
              className={classNames(
                "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                "text-white dark:text-primary",
                "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50"
              )}
              iconRight={<PlusIcon className="text-white dark:text-primary" />}
            >
              Add Liquidity
            </Button>
          </ModalOpenButton>
          <ModalContents>
            {({ close }) => <AddLiquidityModal handleClose={close} />}
          </ModalContents>
        </Modal>
      </div>
      <div className="flex flex-col">
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Create and manage all your staking positions.
        </p>
      </div>
      <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />

      <Tabs defaultValue="spnft" className="w-full">
        <TabsList>
          <TabsTrigger value="lp">Liquidity V2</TabsTrigger>
          <TabsTrigger value="spnft">spNFT</TabsTrigger>
        </TabsList>
        <TabsContent value="lp">
          <Provider value={factoryClient}>
            <LiquidityPool />
          </Provider>
        </TabsContent>
        <TabsContent value="spnft">
          <Provider value={nftClient}>
            <QueryClientProvider client={queryClient}>
              <SPNFTPool />
            </QueryClientProvider>
          </Provider>
        </TabsContent>
      </Tabs>
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
        <div className="mt-8 text-center rounded-lg md:border border-neutral-200 dark:border-neutral-900/50 md:shadow-dark-sm md:dark:shadow-dark-lg w-full">
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

            <div className="flex space-x-2 mt-4">
              <Button
                auto
                onClick={() => window.location.reload()}
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                  "text-white dark:text-primary",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                )}
              >
                Refresh
              </Button>
              <Modal>
                <ModalOpenButton>
                  <Button
                    auto
                    className={classNames(
                      "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                      "text-white dark:text-primary",
                      "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                      "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                      "disabled:opacity-50"
                    )}
                  >
                    Add Liquidity
                  </Button>
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
    <div className="flex flex-col items-center sm:items-start justify-between py-3">
      <div
        className={classNames(
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((pool) => (
              <SpNftModal key={pool.id} data={pool}>
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
                          <span className="font-semibold">
                            {pool.assets.token0.symbol}
                          </span>
                          <span className="font-semibold text-muted-foreground">
                            /
                          </span>
                          <span className="font-semibold">
                            {pool.assets.token1.symbol}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground tracking-wide">
                          #ID-{pool.tokenId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-left font-medium">
                        {currencyFormat(+pool.amount, 5, 0.00001)}
                      </span>
                      <span className="text-left text-muted-foreground"></span>
                    </div>
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
                                <span className="text-xs font-medium">
                                  {pool.settings.yield_bearing === true
                                    ? "Active Yield Bearing"
                                    : "No Active Yield Bearing"}
                                </span>
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
                                <span className="text-xs font-medium">
                                  {isLockActive === true
                                    ? "Active Lock"
                                    : "No Active Lock"}
                                </span>
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
                                <span className="text-xs font-medium">
                                  {pool.settings.boost === true
                                    ? "Boost Active"
                                    : "No Boost Active"}
                                </span>
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
                                <span className="text-xs font-medium">
                                  {pool.settings.nitro !==
                                  "0x0000000000000000000000000000000000000000"
                                    ? "Nitro Active"
                                    : "No Nitro Active"}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-center">
                    {(() => {
                      const { base, nitro, multiplier } = pool.apr;
                      const bonus = (multiplier.lock + multiplier.boost) * base;
                      const total = Object.values(multiplier).reduce(
                        (prev, curr) => prev + curr,
                        base + nitro + bonus
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
                                <span className="text-xs font-medium">
                                  <b>Base APR: </b>
                                  {currencyFormat(base, 2, 0.01)}%
                                </span>
                                <span className="text-xs font-medium">
                                  <b>Bonus APR: </b>
                                  {currencyFormat(bonus, 2, 0.01)}%
                                </span>

                                <span className="text-xs font-medium">
                                  <b>Nitro APR: </b>
                                  {currencyFormat(nitro, 2, 0.01)}%
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition" />
                    </div>
                  </TableCell>
                </TableRow>
              </SpNftModal>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function LiquidityPool() {
  const theme = useTheme();
  const { address } = useAccount();
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    pause: !address,
    query: getPositions,
    variables: {
      address: address ? address.toLowerCase() : "",
    },
  });

  if (fetching) return <Loading />;
  if (error) throw new Error("Error fetching pool position");
  if (!data || !data.liquidityPositions.length) {
    return (
      <div className="flex justify-center items-center w-full">
        <div className="mt-8 text-center rounded-lg md:border border-neutral-200 dark:border-neutral-900/50 md:shadow-dark-sm md:dark:shadow-dark-lg w-full">
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
                auto
                onClick={() => window.location.reload()}
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                  "text-white dark:text-primary",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                )}
              >
                Refresh
              </Button>
              <Modal>
                <ModalOpenButton>
                  <Button
                    auto
                    className={classNames(
                      "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                      "text-white dark:text-primary",
                      "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                      "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                      "disabled:opacity-50"
                    )}
                  >
                    Add Liquidity
                  </Button>
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
    <div
      className={cn(
        "relative flex flex-col w-full border rounded-lg bg-white dark:bg-neutral-900/50 shadow-lg shadow-slate-200 dark:shadow-black/50 overflow-hidden"
      )}
    >
      <Table>
        <TableHeader className="border-b">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-60">Asset</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Composition</TableHead>
            <TableHead>Pool Share</TableHead>
            <TableHead className="text-right w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.liquidityPositions.map(({ pair, liquidityTokenBalance }) => (
            <TableRow
              key={pair.id}
              className="cursor-pointer group"
              href={`/pool/${pair.id}`}
            >
              <TableCell className="flex items-center mt-1.5 space-x-4">
                <div className="flex -space-x-2.5 flex-shrink-0">
                  <TokenLogo
                    className="w-7 h-7"
                    src={getTokenImageUrl(pair.token0.id as `0x${string}`)}
                  />
                  <TokenLogo
                    className="w-7 h-7"
                    src={getTokenImageUrl(pair.token1.id as `0x${string}`)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-left font-medium">
                    {pair.token0.symbol}
                  </span>
                  <span className="text-left font-medium text-muted-foreground opacity-25">
                    /
                  </span>
                  <span className="text-left font-medium">
                    {pair.token1.symbol}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-left font-medium">
                    {currencyFormat(liquidityTokenBalance, 6, 0.000001)}
                  </span>
                  <span className="text-left text-muted-foreground">
                    $
                    {currencyFormat(
                      (Number(pair.reserveUSD) / Number(pair.totalSupply)) *
                        Number(liquidityTokenBalance)
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-left">
                <div className="flex flex-col text-xs text-muted-foreground">
                  <span>
                    {currencyCompactFormat(
                      (Number(liquidityTokenBalance) /
                        Number(pair.totalSupply)) *
                        Number(pair.reserve0)
                    )}{" "}
                    ${pair.token0.symbol}
                  </span>
                  <span>
                    {currencyCompactFormat(
                      (Number(liquidityTokenBalance) /
                        Number(pair.totalSupply)) *
                        Number(pair.reserve1)
                    )}{" "}
                    ${pair.token1.symbol}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-left">
                <span>
                  {(
                    (Number(liquidityTokenBalance) / Number(pair.totalSupply)) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </TableCell>
              <TableCell className="flex justify-end text-right">
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const AddLiquidityModal: React.FC<{ handleClose: () => void }> = ({
  handleClose,
}) => {
  const router = useRouter();
  const { chain } = useNetwork();

  // TODO: MOVE THIS HOOKS
  const chainSpecificTokens = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID.id];
    if (!supportedChainID.includes(chain.id as any))
      return tokens[DEFAULT_CHAIN_ID.id];
    return tokens[chain.id as SupportedChainID];
  }, [chain]);

  const [token0, setToken0] = useState<Token>(chainSpecificTokens[0]);
  const [token1, setToken1] = useState<Token>(chainSpecificTokens[1]);

  const {
    data: existingPool,
    isError,
    isLoading: isFetchingGetPair,
  } = useContractRead({
    address: FACTORY_CONTRACT,
    abi: NEUTRO_FACTORY_ABI,
    functionName: "getPair",
    args: [token0.address, token1.address],
  });

  const { config: createPairConfig } = usePrepareContractWrite({
    address: FACTORY_CONTRACT,
    abi: NEUTRO_FACTORY_ABI,
    functionName: "createPair",
    args: [token0.address, token1.address],
  });
  const { isLoading: isCreatingPair, write: createPair } = useContractWrite({
    ...createPairConfig,
    onSuccess: async (result) => {
      const tx = await waitForTransaction({
        hash: result.hash,
        confirmations: 8,
      });
      const decodedResult = decodeAbiParameters(
        parseAbiParameters("address, uint256"),
        tx.logs[0].data
      );
      router.push(`/pool/${decodedResult[0]}`);
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-black dark:text-white mb-8">
        <div>
          <p className="text-left text-xl font-semibold m-0">Add Liquidity</p>
          <p className="text-sm m-0 opacity-50">
            Select token pair to add liquidty
          </p>
        </div>
        <button type="button" onClick={handleClose}>
          <XCircleIcon className="h-6 w-6 text-cool-gray-500 hover:text-cool-gray-400 opacity-30" />
        </button>
      </div>

      <TokenPicker
        selectedToken={token0}
        setSelectedToken={setToken0}
        disabledToken={token1}
      >
        {({ selectedToken }) => (
          <div
            className={classNames(
              "py-1 px-4 rounded-2xl rounded-b-none cursor-pointer transition-colors group",
              "bg-neutral-100 dark:bg-neutral-900",
              "hover:bg-neutral-200/75 hover:dark:bg-neutral-800/60"
            )}
          >
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-neutral-500 dark:text-neutral-600">
                  1
                </div>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={selectedToken.logo}
                  className="h-7 mr-2 rounded-full"
                  onError={(event) => {
                    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${selectedToken.symbol}`;
                  }}
                />
                <span className="text-sm font-semibold text-black dark:text-white">
                  {selectedToken.symbol}
                </span>
              </div>
              <ChevronRightIcon className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-all text-black dark:text-white" />
            </div>
          </div>
        )}
      </TokenPicker>
      <TokenPicker
        selectedToken={token1}
        setSelectedToken={setToken1}
        disabledToken={token0}
      >
        {({ selectedToken }) => (
          <div
            className={classNames(
              "py-1 px-4 rounded-2xl rounded-t-none cursor-pointer transition-colors group",
              "bg-neutral-100 dark:bg-neutral-900",
              "hover:bg-neutral-200/75 hover:dark:bg-neutral-800/60"
            )}
          >
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-neutral-500 dark:text-neutral-600">
                  2
                </div>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={selectedToken.logo}
                  className="h-7 mr-2 rounded-full"
                  onError={(event) => {
                    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${selectedToken.symbol}`;
                  }}
                />
                <span className="text-sm font-semibold text-black dark:text-white">
                  {selectedToken.symbol}
                </span>
              </div>
              <ChevronRightIcon className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-all text-black dark:text-white" />
            </div>
          </div>
        )}
      </TokenPicker>
      {(!existingPool ||
        existingPool !== "0x0000000000000000000000000000000000000000") && (
        <Button
          scale={1.25}
          className={classNames(
            "!flex !items-center !mt-4 !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
            "text-white dark:text-primary",
            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
            "disabled:opacity-50"
          )}
          disabled={isError}
          loading={isFetchingGetPair}
          onClick={() => router.push(`/pool/${existingPool}`)}
        >
          <span>Enter Pool</span>
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Button>
      )}
      {existingPool === "0x0000000000000000000000000000000000000000" && (
        <div>
          <Button
            scale={1.25}
            className={classNames(
              "!flex !items-center !mt-4 !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
              "text-white dark:text-amber-600",
              "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
              "!border !border-orange-600/50 dark:border-orange-400/[.12]",
              "disabled:opacity-50"
            )}
            disabled={!createPair}
            loading={isCreatingPair}
            onClick={() => createPair?.()}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>Start adding liquidity</span>
          </Button>
          <p className="max-w-3xl mx-auto text-sm text-neutral-400 dark:text-neutral-600 text-center">
            No pool found! But, you can create it now and start providing
            liquidity.
          </p>
        </div>
      )}
    </div>
  );
};
