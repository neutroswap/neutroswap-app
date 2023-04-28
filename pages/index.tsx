/* eslint-disable @next/next/no-img-element */
import React, {
  useState,
  useEffect,
  Fragment,
  useMemo,
  ChangeEvent,
  useCallback,
} from "react";
import { Button, Note, Spinner, Text } from "@geist-ui/core";
import {
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/20/solid";
import { Popover, Transition, RadioGroup } from "@headlessui/react";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import NumberInput from "@/components/elements/NumberInput";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  UniswapPair,
  UniswapVersion,
  UniswapPairSettings,
  UniswapPairFactory,
  TradeContext,
  appendEthToContractAddress,
  TradeDirection,
} from "simple-uniswap-sdk";
import {
  useAccount,
  useContractReads,
  useNetwork,
  useSigner,
  useBalance,
} from "wagmi";
import { ERC20_ABI, NEUTRO_FACTORY_ABI, NEUTRO_POOL_ABI } from "@/shared/abi";
import { useContractRead } from "wagmi";
import { classNames } from "@/shared/helpers/classNamer";
import truncateEthAddress from "truncate-eth-address";
import debounce from "lodash/debounce";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils.js";
import { tokens } from "@/shared/statics/tokenList";
import { Token } from "@/shared/types/tokens.types";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";
import WalletIcon from "@/public/icons/wallet.svg";
import Link from "next/link";
import { Currency } from "@/shared/types/currency.types";
import { BigNumber, ethers } from "ethers";
import { useIsMounted } from "@/shared/hooks/useIsMounted";
import { useRouter } from "next/router";
import {
  DEFAULT_CHAIN_ID,
  supportedChainID,
  SupportedChainID,
} from "@/shared/types/chain.types";
import Head from "next/head";
import {
  NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_FACTORY_CONTRACT,
  NEXT_PUBLIC_FARM_CONTRACT,
  NEXT_PUBLIC_MULTICALL_CONTRACT,
  NEXT_PUBLIC_ROUTER_CONTRACT,
  NEXT_PUBLIC_RPC,
  NEXT_PUBLIC_WEOS_ADDRESS,
} from "@/shared/helpers/constants";

const TABS = ["0.1", "0.5", "1.0"];

export default function Home() {
  const router = useRouter();
  const isMounted = useIsMounted();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  const [slippage, setSlippage] = useState("0.5");

  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingToken0Price, setIsFetchingToken0Price] = useState(false);
  const [isFetchingToken1Price, setIsFetchingToken1Price] = useState(false);
  const [isPreferNative, setIsPreferNative] = useState(true);

  const [balance0, setBalance0] = useState<Currency>({
    decimal: 18,
    raw: BigNumber.from(0),
    formatted: "0.00",
  });
  const [balance1, setBalance1] = useState<Currency>({
    decimal: 18,
    raw: BigNumber.from(0),
    formatted: "0.00",
  });
  const [eosBalance, setEosBalance] = useState<Currency>({
    decimal: 18,
    raw: BigNumber.from(0),
    formatted: "0.00",
  });
  const [tokenName0, setTokenName0] = useState("");
  const [tokenName1, setTokenName1] = useState("");
  const [tokenAmount0, setTokenAmount0] = useState("0");
  const [tokenAmount1, setTokenAmount1] = useState("0");
  const [tokenMin1, setTokenMin1] = useState("0");
  const [tokenEst1, setTokenEst1] = useState("0");

  const [tradeContext, setTradeContext] = useState<TradeContext>();
  const [uniswapFactory, setUniswapFactory] = useState<UniswapPairFactory>();
  const [direction, setDirection] = useState<"input" | "output">("input");
  const [txHash, setTxHash] = useState<string>("");
  const [marketPrice, setMarketPrice] = useState(0);

  // TODO: MOVE THIS HOOKS
  const chainSpecificTokens = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID];
    if (!supportedChainID.includes(chain.id.toString() as any))
      return tokens[DEFAULT_CHAIN_ID];
    return tokens[chain.id.toString() as SupportedChainID];
  }, [chain]);

  const [token0, setToken0] = useState<Token>(chainSpecificTokens[0]);
  const [token1, setToken1] = useState<Token>(chainSpecificTokens[1]);

  const { data: balance, refetch: refetchBalanceETH } = useBalance({
    enabled: Boolean(address),
    address,
  });

  const { isFetching: isFetchingBalance0 } = useContractReads({
    enabled: Boolean(address),
    contracts: [
      {
        address: token0.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        chainId: Number(NEXT_PUBLIC_CHAIN_ID),
        args: [address!],
      },
      { address: token0.address, abi: ERC20_ABI, functionName: "symbol" },
      {
        address: token0.address,
        abi: ERC20_ABI,
        functionName: "decimals",
        chainId: Number(NEXT_PUBLIC_CHAIN_ID),
      },
    ],
    onSuccess(value) {
      setBalance0({
        decimal: value[2].toNumber(),
        raw: value[0],
        formatted: parseFloat(
          formatUnits(value[0].toString(), value[2].toNumber()).toString()
        ).toFixed(3),
      });
      setTokenName0(value[1]);
    },
  });

  const { isFetching: isFetchingBalance1 } = useContractReads({
    enabled: Boolean(address),
    contracts: [
      {
        address: token1.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
        chainId: Number(NEXT_PUBLIC_CHAIN_ID),
      },
      { address: token1.address, abi: ERC20_ABI, functionName: "symbol" },
      {
        address: token1.address,
        abi: ERC20_ABI,
        functionName: "decimals",
        chainId: Number(NEXT_PUBLIC_CHAIN_ID),
      },
    ],
    onSuccess(value) {
      setBalance1({
        decimal: value[2].toNumber(),
        raw: value[0],
        formatted: parseFloat(
          formatUnits(value[0].toString(), value[2].toNumber()).toString()
        ).toFixed(3),
      });
      setTokenName1(value[1]);
    },
  });

  // useEffect(() => {
  //   console.log("Uniswap Factory =", uniswapFactory);
  //   console.log("Pairs =", pairs);
  //   console.log("Trade context = ", tradeContext);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [uniswapFactory, tradeContext]);

  const { data: pairs } = useContractRead({
    address: NEXT_PUBLIC_FACTORY_CONTRACT as `0x${string}`,
    abi: NEUTRO_FACTORY_ABI,
    functionName: "getPair",
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
    args: [token0.address, token1.address],
  });

  const poolContract = {
    address: pairs as `0x${string}`,
    abi: NEUTRO_POOL_ABI,
  };

  const { refetch: refetchReserves } = useContractReads({
    enabled: Boolean(token0 && token1 && pairs),
    contracts: [
      { ...poolContract, functionName: "token0" },
      { ...poolContract, functionName: "token1" },
      { ...poolContract, functionName: "getReserves" }
    ],
    onSuccess(response) {
      const [t0, t1, reserves] = response;
      if (token0.address === t0) setMarketPrice(+formatUnits(reserves._reserve1, token1.decimal) / +formatUnits(reserves._reserve0, token0.decimal))
      if (token0.address === t1) setMarketPrice(+formatUnits(reserves._reserve0, token0.decimal) / +formatUnits(reserves._reserve1, token1.decimal))

      // console.log('constants product', +formatUnits(reserves._reserve0, token0.decimal) * +formatUnits(reserves._reserve1, token1.decimal))
    }
  });

  let customNetworkData = useMemo(
    () => ({
      nameNetwork: "EOS EVM",
      multicallContractAddress: NEXT_PUBLIC_MULTICALL_CONTRACT as string,
      nativeCurrency: {
        name: "EOS",
        symbol: "EOS",
      },
      nativeWrappedTokenInfo: {
        chainId: Number(NEXT_PUBLIC_CHAIN_ID),
        contractAddress: NEXT_PUBLIC_WEOS_ADDRESS as string,
        decimals: 18,
        symbol: "WEOS",
        name: "Wrapped EOS",
      },
    }),
    []
  );

  let cloneUniswapContractDetailsV2 = useMemo(
    () => ({
      routerAddress: NEXT_PUBLIC_ROUTER_CONTRACT as string,
      factoryAddress: NEXT_PUBLIC_FACTORY_CONTRACT as string,
      pairAddress: pairs as string,
    }),
    [pairs]
  );

  let formatWrappedToken = useCallback(
    (token: `0x${string}`, isPreferNative: boolean) => {
      if (token !== customNetworkData.nativeWrappedTokenInfo.contractAddress)
        return token;
      if (!isPreferNative) return token;
      let appendedToken = appendEthToContractAddress(token);
      return appendedToken as `0x${string}`;
    },
    [customNetworkData]
  );

  useEffect(() => {
    if (!pairs) return;
    if (!address) return;
    const uniswapPair = new UniswapPair({
      fromTokenContractAddress: formatWrappedToken(
        token0.address,
        isPreferNative
      ),
      toTokenContractAddress: formatWrappedToken(
        token1.address,
        isPreferNative
      ),
      ethereumAddress: address as string,
      chainId: Number(NEXT_PUBLIC_CHAIN_ID),
      providerUrl: NEXT_PUBLIC_RPC as string,
      settings: new UniswapPairSettings({
        gasSettings: {
          getGasPrice: async () => {
            return "GWEI_GAS_PRICE";
          },
        },
        slippage: Number(slippage) / 100,
        deadlineMinutes: 15,
        disableMultihops: true,
        cloneUniswapContractDetails: {
          v2Override: cloneUniswapContractDetailsV2,
        },
        uniswapVersions: [UniswapVersion.v2],
        customNetwork: customNetworkData,
      }),
    });
    const fac = async (uni: any) => {
      let x = await uni.createFactory();
      setUniswapFactory(x);
    };
    fac(uniswapPair);

    return () => {
      setTokenAmount0("");
      setTokenAmount1("");
    }
  }, [
    address,
    cloneUniswapContractDetailsV2,
    customNetworkData,
    formatWrappedToken,
    isPreferNative,
    pairs,
    slippage,
    token0,
    token1,
  ]);

  const { data: signer } = useSigner({
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
  });

  useEffect(() => {
    if (!tradeContext) return;
    setTokenMin1(tradeContext.minAmountConvertQuote as string);
    setTokenEst1(tradeContext.expectedConvertQuote as string);

    if (tradeContext.hasEnoughAllowance === true) {
      setIsApproved(true);
    } else setIsApproved(false);
  }, [tradeContext]);

  const isAmount0Invalid = () => {
    let value: BigNumber;
    if (tokenName0 === "WEOS" && balance) value = balance.value;
    else value = balance0.raw;
    return Number(tokenAmount0) > +formatUnits(value, token0.decimal);
  };

  const handleToken0Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setTokenAmount0(value);
    if (+value) debouncedToken0(value);
  };

  const debouncedToken0 = debounce(async (nextValue) => {
    if (!uniswapFactory) throw new Error("No Uniswap Pair Factory");
    setIsFetchingToken1Price(true);
    const trade = await uniswapFactory.trade(nextValue, TradeDirection.input);
    setTokenAmount1(trade.expectedConvertQuote);
    setTokenMin1(trade.minAmountConvertQuote as string);
    setTokenEst1(trade.expectedConvertQuote as string);
    setDirection("input");
    setTradeContext(trade);
    setIsFetchingToken1Price(false);
  }, 500);

  const handleToken1Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setTokenAmount1(value);
    if (+value) debouncedToken1(value);
  };

  const debouncedToken1 = debounce(async (nextValue) => {
    if (!uniswapFactory) return new Error("No Uniswap Pair Factory");
    // if (!tradeContext) return new Error("No TradeContext found");

    setIsFetchingToken0Price(true);
    const trade = await uniswapFactory.trade(nextValue, TradeDirection.output);
    setTokenAmount0(trade.expectedConvertQuote);
    const flippedTrade = await uniswapFactory.trade(
      trade.expectedConvertQuote,
      TradeDirection.input
    );
    setDirection("output");
    setTradeContext(flippedTrade);
    setIsFetchingToken0Price(false);
  }, 500);

  const handleSwitchTokens = async () => {
    setToken0(token1);
    setToken1(token0);
    setTokenAmount0(tokenAmount1);
    setTokenAmount1(tokenAmount0);
    await refetchReserves();
  };

  const handleSwapAgain = () => {
    setTxHash("");
    router.reload();
  };

  const approve = async () => {
    setIsLoading(true);
    if (!tradeContext) return new Error("No TradeContext found");
    if (!signer) throw new Error("No signer");

    if (tradeContext.approvalTransaction) {
      const approved = await signer.sendTransaction(
        tradeContext.approvalTransaction
      );

      const approvedReceipt = await approved.wait();

      setIsLoading(false);
      setIsApproved(true);
    }
  };

  const swap = async () => {
    setIsLoading(true);
    if (!tradeContext) return new Error("No TradeContext found");
    if (!signer) throw new Error("No signer");

    try {
      const tradeTransaction = await signer.sendTransaction(
        tradeContext.transaction
      );

      setTxHash(tradeTransaction.hash);
      const tradeReceipt = await tradeTransaction.wait();
      setIsLoading(false);
      tradeContext.destroy();
    } catch (error) {
      setIsLoading(false);
      tradeContext.destroy();
    }
  };

  const calcPriceImpact = useMemo(() => {
    return (1 - (+tokenAmount0 * marketPrice / +tokenAmount1)) * 100
  }, [tokenAmount0, marketPrice, tokenAmount1])

  if (!isMounted) {
    return <Spinner />;
  }

  return (
    <>
      <Head>
        <title>Neutroswap</title>
        <meta
          name="description"
          content="Audited community-driven AMM and Launchpad on EOS EVM blockchain."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col items-center justify-center min-h-[80%] pt-16">
        <div className="w-full max-w-lg">
          <div className={classNames(
            "mt-8 rounded-xl p-0 md:p-4",
            "shadow-none md:shadow-dark-sm md:dark:shadow-dark-lg",
            "border-0 md:border border-neutral-200/60 dark:border-neutral-800/50"
          )}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold"> Swap </span>
              <Popover className="relative flex items-center">
                <>
                  <Popover.Button>
                    <AdjustmentsHorizontalIcon className="h-5 cursor-pointer text-neutral-500 hover:text-inherit transition" />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute top-10 right-0 z-50 -mr-2.5 min-w-20 md:m-w-22 md:-mr-5 rounded-lg w-72 shadow-dark-sm dark:shadow-dark-lg">
                      <div
                        className={classNames(
                          "py-4 px-3 rounded-lg space-y-3",
                          "bg-neutral-50 dark:bg-[#0C0C0C]",
                          "border border-neutral-200 dark:border-neutral-800/50"
                        )}
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500 dark:text-neutral-400">
                            Slippage
                          </span>
                          <span className="text-neutral-800 dark:text-neutral-200 font-semibold">
                            {slippage}%
                          </span>
                        </div>
                        <RadioGroup onChange={setSlippage}>
                          <div className="items-center relative bg-neutral-200/50 dark:bg-white/[0.04] rounded-lg overflow-hidden flex p-1 space-x-1">
                            <>
                              {TABS.map((tab, i) => (
                                <RadioGroup.Option
                                  as={Fragment}
                                  key={i}
                                  value={tab}
                                >
                                  {({ checked }) => (
                                    <div
                                      className={classNames(
                                        checked
                                          ? "text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 shadow"
                                          : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 hover:dark:bg-white/[0.04]",
                                        "z-[1] relative rounded-lg text-xs h-8 font-medium flex flex-grow items-center justify-center cursor-pointer"
                                      )}
                                    >
                                      {tab}%
                                    </div>
                                  )}
                                </RadioGroup.Option>
                              ))}

                              <NumberInput
                                className="focus:bg-neutral-200 focus:dark:bg-black dark:placeholder:text-neutral-400 focus:dark:text-white rounded-lg text-sm h-8 font-medium bg-transparent text-center w-[100px] transition"
                                placeholder="Custom"
                                value={slippage}
                                onChange={setSlippage}
                              />
                            </>
                          </div>
                        </RadioGroup>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              </Popover>
            </div>

            <div
              className={classNames(
                "p-4 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg box-border transition",
                "border border-transparent focus-within:border-neutral-200 focus-within:dark:border-neutral-800/50"
              )}
            >
              <div className="flex justify-between">
                <div className="flex items-center">
                  <p className="text-sm text-neutral-500 mr-2">You Sell</p>
                </div>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    if (!address) return;
                    const value =
                      balance && tokenName0 === "WEOS"
                        ? balance.value
                        : balance0.raw;
                    setTokenAmount0(formatUnits(value, token0.decimal));
                    debouncedToken0(formatUnits(value, token0.decimal));
                  }}
                >
                  <WalletIcon className="mr-2 w-4 h-4 md:w-5 md:h-5 text-neutral-400 dark:text-neutral-600" />
                  {isFetchingBalance0 && (
                    <div className="w-24 h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                  )}
                  {!isFetchingBalance0 && (
                    <div className="flex space-x-1">
                      <p className="text-sm text-neutral-500 hover:dark:text-neutral-700">
                        {tokenName0 !== "WEOS" && balance0.formatted}
                        {tokenName0 === "WEOS" &&
                          Number(balance!.formatted).toFixed(3)}
                      </p>
                      <p className="text-sm text-neutral-500 hover:dark:text-neutral-700">
                        {tokenName0 !== "WEOS" && tokenName0}
                        {tokenName0 === "WEOS" && "EOS"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex flex-col">
                  {isFetchingToken0Price && (
                    <div className="w-40 h-8 bg-neutral-700 rounded animate-pulse"></div>
                  )}
                  {!isFetchingToken0Price && (
                    <input
                      className="w-full text-2xl bg-transparent focus:outline-none"
                      placeholder="0.0"
                      value={tokenAmount0}
                      onChange={handleToken0Change}
                    />
                  )}
                  {isAmount0Invalid() && (
                    <small className="mt-1 text-red-500">
                      Insufficient balance
                    </small>
                  )}
                </div>
                <TokenPicker
                  selectedToken={token0}
                  setSelectedToken={setToken0}
                  disabledToken={token1}
                >
                  {({ selectedToken: selectedToken }) => (
                    <button
                      placeholder="Select a token"
                      type="button"
                      className={classNames(
                        "flex items-center space-x-2 z-10 group p-2 transition-all rounded-lg cursor-pointer",
                        "bg-neutral-100 hover:bg-neutral-200/40 dark:bg-neutral-900 hover:dark:bg-neutral-800/75 ",
                        "border border-neutral-200 dark:border-transparent"
                      )}
                    >
                      <img
                        src={selectedToken.logo}
                        alt="Selected Token 0"
                        className="h-6 mr-2"
                      />
                      <span className="text-sm">{selectedToken.symbol}</span>
                      <ChevronDownIcon strokeWidth={3} className="w-4 h-4" />
                    </button>
                  )}
                </TokenPicker>
              </div>
            </div>

            <div className="left-0 right-0 -my-[15px] flex items-center justify-center">
              <button
                onClick={() => handleSwitchTokens()}
                type="button"
                className={classNames(
                  "z-10 group p-2 transition-all rounded-lg cursor-pointer",
                  "bg-[#EFEEEE] hover:bg-neutral-300/60 dark:bg-neutral-800/75 hover:dark:bg-neutral-800/50",
                  "ring-4 ring-white dark:ring-black"
                )}
              >
                <div className="transition-transform rotate-0 group-hover:rotate-180">
                  <ArrowDownIcon
                    strokeWidth={3}
                    className="w-5 h-5 text-neutral-700 dark:text-neutral-100"
                  />
                </div>
              </button>
            </div>

            <div
              className={classNames(
                "p-4 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg box-border transition",
                "border border-transparent focus-within:border-neutral-200 focus-within:dark:border-neutral-800/50"
              )}
            >
              <div className="flex justify-between">
                <div className="flex items-center">
                  <p className="text-sm text-neutral-500 mr-2">You Buy</p>
                </div>
                <div
                  className="flex items-center cursor-pointer "
                  onClick={() => {
                    if (!address) return;
                    const value =
                      balance && tokenName1 === "WEOS"
                        ? balance.value
                        : balance1.raw;
                    setTokenAmount1(formatUnits(value, token1.decimal));
                    debouncedToken1(formatUnits(value, token1.decimal));
                  }}
                >
                  <WalletIcon className="mr-2 w-4 h-4 md:w-5 md:h-5 text-neutral-400 dark:text-neutral-600" />
                  {isFetchingBalance1 && (
                    <div className="w-24 h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                  )}
                  {!isFetchingBalance1 && (
                    <div className="flex space-x-1 text-neutral-500 hover:dark:text-neutral-700">
                      <p className="text-sm">
                        {tokenName1 !== "WEOS" && balance1.formatted}
                        {tokenName1 === "WEOS" &&
                          Number(balance?.formatted).toFixed(3)}
                      </p>
                      <p className="text-sm ">
                        {tokenName1 !== "WEOS" && tokenName1}
                        {tokenName1 === "WEOS" && "EOS"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="relative">
                  {isFetchingToken1Price && (
                    <div className="w-40 h-8 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                  )}
                  {!isFetchingToken1Price && (
                    <input
                      className="w-full text-2xl bg-transparent focus:outline-none"
                      placeholder="0.0"
                      value={tokenAmount1}
                      onChange={handleToken1Change}
                    />
                  )}
                </div>
                <TokenPicker
                  selectedToken={token1}
                  setSelectedToken={setToken1}
                  disabledToken={token0}
                >
                  {({ selectedToken }) => (
                    <button
                      placeholder="Select a token"
                      type="button"
                      className={classNames(
                        "flex items-center space-x-2 z-10 group p-2 transition-all rounded-lg cursor-pointer",
                        "bg-neutral-100 hover:bg-neutral-200/40 dark:bg-neutral-900 hover:dark:bg-neutral-800/75 ",
                        "border border-neutral-200 dark:border-transparent"
                      )}
                    >
                      <img
                        src={selectedToken.logo}
                        alt="Selected Token 1"
                        className="h-6 mr-2"
                      />
                      <span className="text-sm">{selectedToken.symbol}</span>
                      <ChevronDownIcon strokeWidth={3} className="w-4 h-4" />
                    </button>
                  )}
                </TokenPicker>
              </div>
            </div>


            {((!!tokenAmount1 && !isFetchingBalance0 && !isFetchingBalance1) && calcPriceImpact < -2) && (
              <div
                className={classNames(
                  "flex mt-4 text-sm border border-red-500 p-2 justify-between animate-pulse rounded-lg",
                  "text-red-500 font-medium"
                )}
              >
                <span>Price impact warning </span>
                <span>{calcPriceImpact < -100 ? "> -100" : calcPriceImpact.toFixed(2)}%</span>
                {/* <span>{calcPriceImpact.toFixed(2)}%</span> */}
              </div>
            )}

            <div className="flex mt-3 justify-center">
              {!isConnected && (
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== "loading";
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === "authenticated");

                    return (
                      <div
                        className="flex flex-col w-full"
                        {...(!ready && {
                          "aria-hidden": true,
                          style: {
                            opacity: 0,
                            pointerEvents: "none",
                            userSelect: "none",
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] border-white transition-all rounded-lg cursor-pointer w-full justify-center"
                              >
                                <div className="p-2">Connect Wallet</div>
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button onClick={openChainModal} type="button">
                                Wrong network
                              </button>
                            );
                          }

                          return (
                            <div style={{ display: "flex", gap: 12 }}>
                              <button
                                onClick={openChainModal}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                type="button"
                              >
                                {chain.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground,
                                      width: 12,
                                      height: 12,
                                      borderRadius: 999,
                                      overflow: "hidden",
                                      marginRight: 4,
                                    }}
                                  >
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name ?? "Chain icon"}
                                        src={chain.iconUrl}
                                        style={{ width: 12, height: 12 }}
                                      />
                                    )}
                                  </div>
                                )}
                                {chain.name}
                              </button>
                              <button onClick={openAccountModal} type="button">
                                {account.displayName}
                                {account.displayBalance
                                  ? ` (${account.displayBalance})`
                                  : ""}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              )}

              {isConnected && (
                <Modal>
                  <ModalOpenButton>
                    <Button
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-amber-600",
                        "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                      )}
                    >
                      Swap
                    </Button>
                  </ModalOpenButton>
                  <ModalContents>
                    {({ close }) => (
                      <div>
                        <div className="w-full flex mb-5">
                          <ArrowLeftIcon
                            className="h-7 cursor-pointer text-black hover:text-amber-600 dark:text-white dark:hover:text-amber-500"
                            onClick={close}
                          />
                        </div>
                        {txHash === "" && (
                          <>
                            <div className="flex items-center justify-between ">
                              <div className="flex flex-col ">
                                <div className="text-2xl mb-1 font-medium text-black dark:text-white">
                                  Buy{" "}
                                  {parseFloat(tokenAmount1)
                                    .toFixed(3)
                                    .toString()}{" "}
                                  {tokenName1 === "WEOS" ? "EOS" : tokenName1}
                                </div>
                                <div className="text-lg text-black/60 dark:text-neutral-400 font-medium">
                                  Sell {tokenAmount0}{" "}
                                  {tokenName0 === "WEOS" ? "EOS" : tokenName0}
                                </div>
                              </div>
                              <img
                                src={token1.logo}
                                alt="Token1 Logo"
                                className="h-16"
                              />
                            </div>
                            <div className="p-3 my-5 flex flex-col bg-neutral-100/75 dark:bg-zinc-900 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-col max-w-xs">
                                  <div className="font-medium text-black dark:text-neutral-300">
                                    Slippage
                                  </div>
                                  <div className="font-light text-sm text-black/60 dark:text-neutral-300">
                                    The slippage you set for the trade
                                  </div>
                                </div>
                                <div className="text-black dark:text-neutral-300">
                                  {slippage}%
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col max-w-xs">
                                  <div className="font-medium text-black dark:text-neutral-300">
                                    Minimal received
                                  </div>
                                  <div className="font-light text-sm text-black/60 dark:text-neutral-300">
                                    The minimum amount you are <br />{" "}
                                    guaranteeed to receive
                                  </div>
                                </div>
                                <div className="text-black dark:text-neutral-300">
                                  {parseFloat(tokenMin1).toFixed(3).toString()}{" "}
                                  ${tokenName1}
                                </div>
                              </div>
                            </div>
                            <div className="p-3 my-5 flex bg-neutral-100/75 dark:bg-zinc-900 rounded-lg items-center justify-between">
                              <div className="flex flex-col max-w-xs">
                                <div className="font-medium text-black dark:text-neutral-300">
                                  Recipient
                                </div>
                              </div>
                              <Link
                                href={`https://explorer.evm.eosnetwork.com/address/${address as string
                                  }`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {truncateEthAddress(address as string)}
                              </Link>
                            </div>
                            <div className="flex space-x-2">
                              <>
                                {!isApproved && (
                                  <Button
                                    onClick={() => approve()}
                                    disabled={!tokenAmount0 || !isConnected}
                                    className={classNames(
                                      "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                                      "text-white dark:text-amber-600",
                                      "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                                      "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                                    )}
                                    loading={isLoading}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {isApproved && (
                                  <Button
                                    onClick={() => swap()}
                                    disabled={!tokenAmount0 || !isConnected}
                                    className={classNames(
                                      "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                                      "text-white dark:text-amber-600",
                                      "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                                      "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                                    )}
                                    loading={isLoading}
                                  >
                                    Swap
                                  </Button>
                                )}
                              </>
                            </div>
                          </>
                        )}
                        {txHash !== "" && (
                          <>
                            <div className="flex justify-center items-center py-20 mb-5 ">
                              <div className="mr-2 text-black dark:text-white">
                                You sold {tokenAmount0}{" "}
                                {tokenName0 === "WEOS" ? "EOS" : tokenName0} for{" "}
                                {parseFloat(tokenAmount1).toFixed(3).toString()}{" "}
                                {tokenName1 === "WEOS" ? "EOS" : tokenName1}
                              </div>
                              <Link
                                href={`https://explorer.evm.eosnetwork.com/tx/${txHash}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ArrowTopRightOnSquareIcon className="h-5 text-blue-500 justify-center" />
                              </Link>
                            </div>
                            <Button
                              onClick={handleSwapAgain}
                              className={classNames(
                                "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                                "text-white dark:text-amber-600",
                                "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                                "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                              )}
                            >
                              Swap again
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </ModalContents>
                </Modal>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
