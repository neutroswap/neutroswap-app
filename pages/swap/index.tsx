/* eslint-disable @next/next/no-img-element */
import React, {
  useState,
  useEffect,
  Fragment,
  useMemo,
  ChangeEvent,
  useCallback,
} from "react";
import { Button, Spinner, Text } from "@geist-ui/core";
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
import { useAccount, useBalance, useContractReads, useSigner } from "wagmi";
import { ERC20_ABI, NEUTRO_FACTORY_ABI } from "@/shared/abi";
import { useContractRead } from "wagmi";
import { classNames } from "@/shared/helpers/classNamer";
import truncateEthAddress from "truncate-eth-address";
import debounce from "lodash/debounce";
import { formatEther } from "ethers/lib/utils.js";
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
import { BigNumber } from "ethers";
import { useIsMounted } from "@/shared/hooks/useIsMounted";

const TABS = ["0.1", "0.5", "1.0"];

export default function Swap() {
  const isMounted = useIsMounted();
  const { address, isConnected } = useAccount();

  const [slippage, setSlippage] = useState("0.5");

  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingToken0Price, setIsFetchingToken0Price] = useState(false);
  const [isFetchingToken1Price, setIsFetchingToken1Price] = useState(false);
  const [isPreferNative, setIsPreferNative] = useState(true);
  // const [isBalanceEnough, setIsBalanceEnough] = useState(true);

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
  const [token0, setToken0] = useState<Token>(tokens[0]);
  const [token1, setToken1] = useState<Token>(tokens[1]);

  const [tradeContext, setTradeContext] = useState<TradeContext>();
  const [uniswapFactory, setUniswapFactory] = useState<UniswapPairFactory>();
  const [direction, setDirection] = useState<"input" | "output">("input");
  const [txHash, setTxHash] = useState<string>("");

  // useBalance({
  //   address: address,
  //   onSuccess(value) {
  //     setEosBalance({
  //       decimal: value.decimals,
  //       raw: value.value,
  //       formatted: parseFloat(value.formatted).toFixed(5),
  //     });
  //   },
  // });

  const { isFetching: isFetchingBalance0 } = useContractReads({
    enabled: Boolean(address),
    // &&
    // token0.address !== "0x6ccc5ad199bf1c64b50f6e7dd530d71402402eb6",
    contracts: [
      {
        address: token0.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      { address: token0.address, abi: ERC20_ABI, functionName: "symbol" },
      {
        address: token0.address,
        abi: ERC20_ABI,
        functionName: "decimals",
      },
    ],
    onSuccess(value) {
      // if (token0 === tokens[0]) {
      //   setBalance0(eosBalance);
      // } else {
      setBalance0({
        decimal: value[2].toNumber(),
        raw: value[0],
        formatted: Number(formatEther(value[0])).toFixed(5).toString(),
      });
      setTokenName0(value[1]);
      // }
    },
  });

  const { isFetching: isFetchingBalance1 } = useContractReads({
    enabled: Boolean(address),
    // &&
    // token1.address !== "0x6ccc5ad199bf1c64b50f6e7dd530d71402402eb6",
    contracts: [
      {
        address: token1.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      { address: token1.address, abi: ERC20_ABI, functionName: "symbol" },
      {
        address: token0.address,
        abi: ERC20_ABI,
        functionName: "decimals",
      },
    ],
    onSuccess(value) {
      // if (token1 === tokens[0]) {
      //   setBalance1(eosBalance);
      // } else {
      setBalance1({
        decimal: value[2].toNumber(),
        raw: value[0],
        formatted: Number(formatEther(value[0])).toFixed(5).toString(),
      });
      setTokenName1(value[1]);
      // }
    },
  });

  useEffect(() => {
    console.log("Uniswap Factory =", uniswapFactory);
    console.log("Pairs =", pairs);
    console.log("Trade context = ", tradeContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniswapFactory, tradeContext]);

  const { data: pairs } = useContractRead({
    address: "0xA5d8c59Fbd225eAb42D41164281c1e9Cee57415a",
    abi: NEUTRO_FACTORY_ABI,
    functionName: "getPair",
    chainId: 15557,
    args: [token0.address, token1.address],
  });

  let customNetworkData = useMemo(
    () => ({
      nameNetwork: "EOS EVM",
      multicallContractAddress: "0x294bb4c48F762DC0AFfe9DA653E9C6E1A4011452",
      nativeCurrency: {
        name: "EOS",
        symbol: "EOS",
      },
      nativeWrappedTokenInfo: {
        chainId: 15557,
        contractAddress: "0x6ccc5ad199bf1c64b50f6e7dd530d71402402eb6",
        decimals: 18,
        symbol: "WEOS",
        name: "Wrapped EOS",
      },
    }),
    []
  );

  let cloneUniswapContractDetailsV2 = useMemo(
    () => ({
      routerAddress: "0xa406053604bFBbE8BEc48313fB6edb5c5032A3ad",
      factoryAddress: "0xa5AD06E9E70Fde3011489A4fbfa49Ce4cBd1D583",
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
      chainId: 15557,
      providerUrl: "https://api-testnet2.trust.one/",
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
    chainId: 15557,
  });

  useEffect(() => {
    if (!tradeContext) return;
    setTokenMin1(tradeContext.minAmountConvertQuote as string);
    setTokenEst1(tradeContext.expectedConvertQuote as string);

    if (tradeContext.hasEnoughAllowance === true) {
      setIsApproved(true);
    } else setIsApproved(false);
  }, [tradeContext]);

  const handleToken0Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setTokenAmount0(value);
    debouncedToken0(value);
    // if (value < balance0.raw.toString()) {
    //   setIsBalanceEnough(false);
    // }
  };

  const debouncedToken0 = debounce(async (nextValue) => {
    console.log("Called");
    if (!uniswapFactory) throw new Error("No Uniswap Pair Factory");
    // if (!tradeContext) throw new Error("No TradeContext found");

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
    if (isNaN(+value) || !+value) return;
    setTokenAmount1(value);
    debouncedToken1(value);
    // if (value < balance1.raw.toString()) {
    //   setIsBalanceEnough(false);
    // }
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

  const handleSwitchTokens = () => {
    setToken0(token1);
    setToken1(token0);
    setTokenAmount0(tokenAmount1);
    setTokenAmount1(tokenAmount0);
  };

  const approve = async () => {
    setIsLoading(true);
    if (!tradeContext) return new Error("No TradeContext found");
    if (!signer) throw new Error("No signer");

    if (tradeContext.approvalTransaction) {
      const approved = await signer.sendTransaction(
        tradeContext.approvalTransaction
      );
      console.log("approved txHash", approved.hash);
      const approvedReceipt = await approved.wait();
      console.log("approved receipt", approvedReceipt);
      setIsLoading(false);
      setIsApproved(true);
    }
  };

  const swap = async () => {
    setIsLoading(true);
    if (!tradeContext) return new Error("No TradeContext found");
    if (!signer) throw new Error("No signer");

    // if (tradeContext.approvalTransaction) {
    //   const approved = await signer.sendTransaction(
    //     tradeContext.approvalTransaction
    //   );
    //   console.log("approved txHash", approved.hash);
    //   const approvedReceipt = await approved.wait();
    //   console.log("approved receipt", approvedReceipt);
    //   setIsLoading(false);
    // }

    try {
      const tradeTransaction = await signer.sendTransaction(
        tradeContext.transaction
      );
      console.log("trade txHash", tradeTransaction.hash);
      setTxHash(tradeTransaction.hash);
      const tradeReceipt = await tradeTransaction.wait();
      console.log("trade receipt", tradeReceipt);
      setIsLoading(false);
      tradeContext.destroy(); //Coba dulu
    } catch (error) {
      setIsLoading(false);
      tradeContext.destroy(); //Coba dulu
    }
  };

  if (!isMounted) {
    return <Spinner />;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[80%] py-10">
        <div>
          <Text h2 height={3} className="text-center">
            Trade
          </Text>
          <Text type="secondary" p className="text-center !mt-0">
            Trade your token
          </Text>
        </div>
        <div>
          <div className="mt-8 rounded-lg border border-neutral-200/60 dark:border-neutral-800/50 shadow-dark-sm dark:shadow-dark-lg p-4">
            <div className="flex justify-between items-center ">
              <Text h3 height={2} className="text-center">
                Swap
              </Text>
              <Popover className="relative">
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

            <div className="p-4 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <p className="text-sm text-neutral-500 mr-2">You Sell</p>
                </div>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    if (!address) return;
                    setTokenAmount0(formatEther(balance0.raw));
                    debouncedToken0(formatEther(balance0.raw));
                  }}
                >
                  <WalletIcon className="mr-2 w-5 h-5 text-neutral-400 dark:text-neutral-600" />
                  {isFetchingBalance0 && (
                    <div className="w-24 h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                  )}
                  {!isFetchingBalance0 && (
                    <p className="text-sm text-neutral-500 hover:dark:text-neutral-700">
                      {balance0.formatted} {tokenName0}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  {isFetchingToken0Price && (
                    <div className="w-40 h-8 bg-neutral-700 rounded animate-pulse"></div>
                  )}
                  {!isFetchingToken0Price && (
                    <input
                      className="text-2xl bg-transparent focus:outline-none"
                      placeholder="0.0"
                      value={tokenAmount0}
                      onChange={handleToken0Change}
                    />
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
                      <div className="flex items-center">
                        <img
                          src={selectedToken.logo}
                          alt="Selected Token 0"
                          className="h-6 mr-2"
                        />
                        <span className="text-sm">{selectedToken.symbol}</span>
                      </div>
                      <div>
                        <ChevronDownIcon strokeWidth={3} className="w-4 h-4" />
                      </div>
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
                  "bg-neutral-200/50 hover:bg-neutral-300/70 dark:bg-neutral-800/75 hover:dark:bg-neutral-800/50",
                  "ring-4 ring-white dark:ring-black"
                )}
              >
                <div className="transition-transform rotate-0 group-hover:rotate-180">
                  <ArrowDownIcon
                    strokeWidth={3}
                    className="w-5 h-5 text-neutral-600 dark:text-neutral-100"
                  />
                </div>
              </button>
            </div>

            <div className="p-4 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <p className="text-sm text-neutral-500 mr-2">You Buy</p>
                </div>
                <div
                  className="flex items-center cursor-pointer "
                  onClick={() => {
                    if (!address) return;
                    setTokenAmount1(formatEther(balance1.raw));
                    debouncedToken1(formatEther(balance1.raw));
                  }}
                >
                  <WalletIcon className="mr-2 w-5 h-5 text-neutral-400 dark:text-neutral-600" />
                  {isFetchingBalance1 && (
                    <div className="w-24 h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                  )}
                  {!isFetchingBalance1 && (
                    <p className="text-sm text-neutral-500 hover:dark:text-neutral-700">
                      {balance1.formatted} {tokenName1}
                    </p>
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
                      className="text-2xl bg-transparent focus:outline-none"
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
                      <div className="flex items-center">
                        <img
                          src={selectedToken.logo}
                          alt="Selected Token 1"
                          className="h-6 mr-2"
                        />
                        <span className="text-sm">{selectedToken.symbol}</span>
                      </div>
                      <div>
                        <ChevronDownIcon strokeWidth={3} className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                </TokenPicker>
              </div>
            </div>

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
                                    .toFixed(5)
                                    .toString()}{" "}
                                  {tokenName1}
                                </div>
                                <div className="text-lg text-black/60 dark:text-neutral-400 font-medium">
                                  Sell {tokenAmount0} {tokenName0}
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
                                  {parseFloat(tokenMin1).toFixed(5).toString()}{" "}
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
                                href={`https://explorer-testnet2.trust.one/address/${
                                  address as string
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
                              <div className="mr-2">
                                You sold {tokenAmount0} {tokenName0} for{" "}
                                {parseFloat(tokenAmount1).toFixed(5).toString()}{" "}
                                {tokenName1}
                              </div>
                              <Link
                                href={`https://explorer-testnet2.trust.one/tx/${txHash}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ArrowTopRightOnSquareIcon className="h-5 text-blue-500 justify-center" />
                              </Link>
                            </div>
                            <Button
                              onClick={close}
                              className="!flex !items-center hover:bg-[#2D3036]/50 !bg-[#2D3036] !p-2 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !border-none !text-white !text-md"
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
