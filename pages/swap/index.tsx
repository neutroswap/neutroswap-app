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
import { ArrowDownIcon } from "@heroicons/react/24/outline";
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
import { useAccount, useContractReads, useSigner } from "wagmi";
import { ERC20_ABI, NEUTRO_FACTORY_ABI } from "@/shared/abi";
import { useContractRead } from "wagmi";
import { classNames } from "@/shared/helpers/classNames";
import truncateEthAddress from "truncate-eth-address";
// import { tokens } from "@/components/modules/swap/TokenPicker";
import debounce from "lodash/debounce";
import { formatEther } from "ethers/lib/utils.js";
import { tokens } from "@/shared/statics/tokenList";
import { Token } from "@/shared/types/tokens.types";

const TABS = ["0.1", "0.5", "1.0"];

export default function Swap() {
  const { address, isConnected } = useAccount();

  const [slippage, setSlippage] = useState("0.5");

  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingToken0Price, setIsFetchingToken0Price] = useState(false);
  const [isFetchingToken1Price, setIsFetchingToken1Price] = useState(false);
  const [isPreferNative, setIsPreferNative] = useState(true);

  const [balance0, setBalance0] = useState("0");
  const [balance1, setBalance1] = useState("0");
  const [tokenName0, setTokenName0] = useState("");
  const [tokenName1, setTokenName1] = useState("");
  const [token0Amount, setToken0Amount] = useState("0");
  const [token1Amount, setToken1Amount] = useState("0");
  const [token1Min, setToken1Min] = useState("0");
  const [token1Est, setToken1Est] = useState("0");
  const [token0, setToken0] = useState<Token>(tokens[0]);
  const [token1, setToken1] = useState<Token>(tokens[1]);

  const [tradeContext, setTradeContext] = useState<TradeContext>();
  const [uniswapFactory, setUniswapFactory] = useState<UniswapPairFactory>();
  const [direction, setDirection] = useState<"input" | "output">("input");

  useContractReads({
    enabled: Boolean(address),
    contracts: [
      {
        address: token0.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: token1.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      { address: token0.address, abi: ERC20_ABI, functionName: "symbol" },
      { address: token1.address, abi: ERC20_ABI, functionName: "symbol" },
    ],
    onSuccess(value) {
      setBalance0(Number(formatEther(value[0])).toFixed(5).toString());
      setBalance1(Number(formatEther(value[1])).toFixed(5).toString());
      setTokenName0(value[2]);
      setTokenName1(value[3]);
    },
  });

  useEffect(() => {
    console.log("Uniswap Factory =", uniswapFactory);
    console.log("Pairs =", pairs);
    console.log("Trade context = ", tradeContext);
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
    setToken1Min(tradeContext.minAmountConvertQuote as string);
    setToken1Est(tradeContext.expectedConvertQuote as string);

    if (tradeContext.hasEnoughAllowance === true) {
      setIsApproved(true);
    } else setIsApproved(false);
  }, [tradeContext]);

  const handleToken0Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setToken0Amount(value);
    debouncedToken0(value);
  };

  const debouncedToken0 = debounce(async (nextValue) => {
    console.log("kepanggil");
    if (!uniswapFactory) throw new Error("No Uniswap Pair Factory");
    // if (!tradeContext) throw new Error("No TradeContext found");

    setIsFetchingToken1Price(true);
    const trade = await uniswapFactory.trade(nextValue, TradeDirection.input);
    setToken1Amount(trade.expectedConvertQuote);
    setToken1Min(trade.minAmountConvertQuote as string);
    setToken1Est(trade.expectedConvertQuote as string);
    setDirection("input");
    setTradeContext(trade);
    setIsFetchingToken1Price(false);
  }, 500);

  const handleToken1Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value) || !+value) return;
    setToken1Amount(value);
    debouncedToken1(value);
  };

  const debouncedToken1 = debounce(async (nextValue) => {
    if (!uniswapFactory) return new Error("No Uniswap Pair Factory");
    // if (!tradeContext) return new Error("No TradeContext found");

    setIsFetchingToken0Price(true);
    const trade = await uniswapFactory.trade(nextValue, TradeDirection.output);
    setToken0Amount(trade.expectedConvertQuote);
    const flippedTrade = await uniswapFactory.trade(
      trade.expectedConvertQuote,
      TradeDirection.input
    );
    setDirection("output");
    setTradeContext(flippedTrade);
    setIsFetchingToken0Price(false);
  }, 500);

  const swap = async () => {
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
    }

    try {
      const tradeTransaction = await signer.sendTransaction(
        tradeContext.transaction
      );
      console.log("trade txHash", tradeTransaction.hash);
      const tradeReceipt = await tradeTransaction.wait();
      console.log("trade receipt", tradeReceipt);
      setIsLoading(false);
      tradeContext.destroy(); //Coba dulu
    } catch (error) {
      setIsLoading(false);
      tradeContext.destroy(); //Coba dulu
    }
  };

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
          <div className="mt-8 rounded-lg border border-neutral-800/50 shadow-dark-lg p-4">
            <div className="flex justify-between items-center ">
              <Text h3 height={2} className="text-center">
                Swap
              </Text>
              <Popover className="relative">
                <>
                  <Popover.Button>
                    <AdjustmentsHorizontalIcon className="h-5 cursor-pointer hover:dark:text-neutral-600" />
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
                    <Popover.Panel className="absolute top-10 right-0 z-50 -mr-2.5 min-w-20 md:m-w-22 md:-mr-5 bg-[#2D3036] rounded-lg w-80 shadow-lg">
                      <div className="p-4 space-y-4">
                        <div className="text-base font-bold text-high-emphesis">
                          Settings
                        </div>
                        <div className="bg-[#060606] py-4 px-3 rounded-lg space-y-3">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Slippage</span>
                            <span className="text-neutral-400">
                              {slippage}%
                            </span>
                          </div>
                          <RadioGroup onChange={setSlippage}>
                            <div className="items-center relative bg-black/[0.08] dark:bg-white/[0.04] ring-4 ring-black/[0.08] dark:ring-white/[0.04] rounded-lg overflow-hidden flex p-1">
                              <>
                                {TABS.map((tab, i) => (
                                  <RadioGroup.Option
                                    as={Fragment}
                                    key={i}
                                    value={tab}
                                  >
                                    {({ checked }) => (
                                      <button
                                        className={classNames(
                                          checked
                                            ? "text-gray-900 dark:text-white bg-white dark:bg-[#2D3036]"
                                            : "text-gray-500 dark:text-neutral-400 hover:bg-gray-100 hover:dark:bg-white/[0.04]",
                                          "z-[1] relative rounded-lg text-sm h-8 font-medium flex flex-grow items-center justify-center"
                                        )}
                                      >
                                        {tab}%
                                      </button>
                                    )}
                                  </RadioGroup.Option>
                                ))}

                                <NumberInput
                                  className="focus:dark:bg-[#2D3036] dark:placeholder:text-neutral-400 focus:dark:text-white rounded-lg text-sm h-8 font-medium bg-transparent text-center w-[100px]"
                                  placeholder="custom"
                                  value={slippage}
                                  onChange={setSlippage}
                                />
                              </>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              </Popover>
            </div>
            <div className="p-4 bg-black/50 rounded-lg">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <p className="text-sm text-neutral-400 mr-2">You Sell</p>
                  {isFetchingToken0Price && <Spinner className="w-4 h-4" />}
                </div>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    if (!address) return;
                    setToken0Amount(balance0);
                    debouncedToken0(balance0);
                  }}
                >
                  <img
                    src="/icons/wallet.png"
                    alt="Wallet Icon"
                    className="h-5 mr-1"
                  />
                  <p className="text-sm text-neutral-400 hover:dark:text-neutral-600">
                    {balance0} {tokenName0}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <input
                    className="text-2xl bg-transparent focus:outline-none"
                    placeholder="0.0"
                    value={token0Amount}
                    onChange={handleToken0Change}
                  />
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
                      className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center">
                        <img
                          src={selectedToken.logo}
                          alt="Selected Token 0"
                          className="h-6 mr-2"
                        />
                        <span className="text-md">{selectedToken.symbol}</span>
                      </div>
                      <div>
                        <ChevronDownIcon strokeWidth={3} className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                </TokenPicker>
              </div>
            </div>
            <div className="left-0 right-0 -mt-3 -mb-3 flex items-center justify-center">
              <button
                // onClick={() => switchTokens}
                type="button"
                className="z-10 group bg-gray-100 hover:bg-gray-200 hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-md cursor-pointer"
              >
                <div className="transition-transform rotate-0 group-hover:rotate-180">
                  <ArrowDownIcon
                    strokeWidth={3}
                    className="w-4 h-4 text-blue"
                  />
                </div>
              </button>
            </div>
            <div className="p-4 bg-black/50 rounded-lg">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <p className="text-sm text-neutral-400 mr-2">You Buy</p>
                  {isFetchingToken1Price && <Spinner className="w-4 h-4" />}
                </div>
                <div
                  className="flex items-center cursor-pointer "
                  onClick={() => {
                    if (!address) return;
                    setToken1Amount(balance1);
                    debouncedToken1(balance1);
                  }}
                >
                  <img
                    src="/icons/wallet.png"
                    alt="Wallet Icon"
                    className="h-5 mr-1"
                  />
                  <p className="text-sm text-neutral-400 hover:dark:text-neutral-600">
                    {balance1} {tokenName1}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="relative">
                  <input
                    className="text-2xl bg-transparent focus:outline-none"
                    placeholder="0.0"
                    value={token1Amount}
                    onChange={handleToken1Change}
                  />
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
                      className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center">
                        <img
                          src={selectedToken.logo}
                          alt="Selected Token 1"
                          className="h-6 mr-2"
                        />
                        <span className="text-md">{selectedToken.symbol}</span>
                      </div>
                      <div>
                        <ChevronDownIcon strokeWidth={3} className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                </TokenPicker>
              </div>
            </div>
          </div>
          <div className="flex my-3 justify-center">
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

            {isConnected && isApproved === false && (
              <div className="flex flex-col w-full">
                <Button
                  onClick={() => swap()}
                  disabled={!token0Amount || !isConnected}
                  className="!flex !items-center hover:bg-[#2D3036]/50 !my-3 !bg-[#2D3036] !p-2 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !border-none !text-white !text-md"
                  loading={isLoading}
                >
                  Approve Token
                </Button>
              </div>
            )}

            {isApproved === true && (
              <div className="flex flex-col w-full">
                <Button
                  onClick={() => swap()}
                  disabled={!token0Amount || !isConnected}
                  className="!flex !items-center hover:bg-[#2D3036]/50 !my-3 !bg-[#2D3036] !p-2 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !border-none !text-white !text-md"
                  loading={isLoading}
                >
                  Swap
                </Button>
                <div className="text-sm">
                  <div className="flex justify-between mb-2">
                    <div>Est. received</div>
                    <div>
                      {parseFloat(token1Est).toFixed(5).toString()} $
                      {tokenName1}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>Min. received</div>
                    <div>
                      {parseFloat(token1Min).toFixed(5).toString()} $
                      {tokenName1}
                    </div>
                  </div>
                  {/* <div className="flex justify-between mb-2">
                    <div>Network fee</div>
                    <div>~$0.01</div>
                  </div> */}
                  <div className="flex justify-between mb-2 font-semibold">
                    <div>Recipient</div>
                    <div>{truncateEthAddress(address as string)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
