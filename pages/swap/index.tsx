import React, { useState, useEffect, Fragment } from "react";
import { Button, Text } from "@geist-ui/core";
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
} from "simple-uniswap-sdk";
import { useAccount, useBalance, useSigner } from "wagmi";
import { NEUTRO_FACTORY_ABI, NEUTRO_ROUTER_ABI } from "@/shared/abi";
import { useContractRead } from "wagmi";
import { classNames } from "@/shared/helpers/classNames";
import { parseEther } from "ethers/lib/utils.js";
import { ethers } from "ethers";
import { bronos } from "wagmi/dist/chains";

const TABS = ["0.1", "0.5", "1.0"];

export default function Swap() {
  const { address, isConnected } = useAccount();
  const [slippage, setSlippage] = useState("0.5");
  const [token0Amount, setToken0Amount] = useState("0");
  const [token1Amount, setToken1Amount] = useState("0");
  const [token1Min, setToken1Min] = useState("0");
  const [token1Est, setToken1Est] = useState("0");
  const [tradeContext, setTradeContext] = useState<TradeContext>();
  const [uniswapFactory, setUniswapFactory] = useState<UniswapPairFactory>();
  const [token0, setToken0] = useState<`0x${string}`>(
    "0x6ccc5ad199bf1c64b50f6e7dd530d71402402eb6"
  );
  const [token1, setToken1] = useState<`0x${string}`>(
    "0x0000000000000000000000000000000000000000"
  );

  useEffect(() => {
    console.log("Trade Info", tradeContext);
    console.log(tradeContext);
  }, []);

  useEffect(() => {
    console.log("latest =", uniswapFactory, "| getPair =", getPair);
    console.log(tradeContext);
  }, [uniswapFactory, tradeContext]);

  const { data: getPair } = useContractRead({
    address: "0xA5d8c59Fbd225eAb42D41164281c1e9Cee57415a", //Use Factory
    abi: NEUTRO_FACTORY_ABI,
    functionName: "getPair",
    chainId: 15557,
    args: [token0, token1],
  });

  useEffect(() => {
    let customNetworkData = {
      nameNetwork: "EOS EVM",
      multicallContractAddress: "0x294bb4c48F762DC0AFfe9DA653E9C6E1A4011452",
      nativeCurrency: {
        name: "EOS",
        symbol: "EOS",
      },
      nativeWrappedTokenInfo: {
        chainId: 15557,
        contractAddress: "0x6cCC5AD199bF1C64b50f6E7DD530d71402402EB6",
        decimals: 18,
        symbol: "WEOS",
        name: "Wrapped EOS",
      },
    };

    let cloneUniswapContractDetailsV2 = {
      routerAddress: "0xa3F17F5BC296674415205D50Fa5081834411d65e",
      factoryAddress: "0xA5d8c59Fbd225eAb42D41164281c1e9Cee57415a",
      pairAddress: getPair as string,
    };

    if (
      token0 !== "0x0000000000000000000000000000000000000000" &&
      token1 !== "0x0000000000000000000000000000000000000000"
    ) {
      const uniswapPair = new UniswapPair({
        fromTokenContractAddress: token0,
        toTokenContractAddress: token1,
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
    }
  }, [token0, token1]);

  const { data: signer } = useSigner({
    chainId: 15557,
  });

  useEffect(() => {
    if (!uniswapFactory) return;
    const tradeInfo = async () => {
      const trade = await uniswapFactory.trade(token0Amount);
      setTradeContext(trade);
      setToken1Min(trade.minAmountConvertQuote as string);
      setToken1Est(trade.expectedConvertQuote as string);
    };
    tradeInfo();
  }, [token0Amount]);

  // const tokenOneBalance = useBalance({
  //   address: address,
  //   token: tokenOne,
  //   chainId: 15557,
  //   watch: true,
  // });

  // const tokenTwoBalance = useBalance({
  //   address: address,
  //   token: tokenTwo,
  //   chainId: 15557,
  //   watch: true,
  // });

  // const estimatedAmount = () => {
  //   ethers.utils.parseEther(trade?.expectedConvertQuote);
  // };

  // const minimalAmount = () => {
  //   ethers.utils.parseEther(trade?.minAmountConvertQuote);
  // };

  const swap = async () => {
    if (!uniswapFactory) return;
    const trade = await uniswapFactory.trade(token0Amount);
    setTradeContext(trade);
    console.log("Trade info", tradeContext);

    if (!signer) {
      throw new Error("No signer");
    }
    if (trade.approvalTransaction) {
      const approved = await signer.sendTransaction(trade.approvalTransaction);
      console.log("approved txHash", approved.hash);
      const approvedReceipt = await approved.wait();
      console.log("approved receipt", approvedReceipt);
    }

    const tradeTransaction = await signer.sendTransaction(trade.transaction);
    console.log("trade txHash", tradeTransaction.hash);
    const tradeReceipt = await tradeTransaction.wait();
    console.log("trade receipt", tradeReceipt);
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
                    <AdjustmentsHorizontalIcon className="h-5 cursor-pointer" />
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

                                {/* <div className="h-[28px] w-0.5 bg-gray-900/5 dark:bg-slate-200/5" /> */}
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
                <p className="text-sm text-neutral-400">You Sell</p>
                {/* <p className="text-sm text-neutral-400">{tokenOneBalance}</p> */}
              </div>
              <div className="flex justify-between">
                <NumberInput
                  className="text-2xl bg-transparent focus:outline-none"
                  placeholder="0.0"
                  value={token0Amount}
                  onChange={setToken0Amount}
                />
                <TokenPicker setToken={setToken0}>
                  {({ selectedToken }) => (
                    <button
                      placeholder="Select a token"
                      type="button"
                      className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center">
                        <img
                          src={selectedToken.img}
                          alt="Selected Token 0"
                          className="h-6 mr-2"
                        />
                        <span className="text-md">{selectedToken.ticker}</span>
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
                <p className="text-sm text-neutral-400">You Buy</p>
                {/* <p className="text-sm text-neutral-400">{tokenTwoBalance}</p> */}
              </div>
              <div className="flex justify-between">
                <NumberInput
                  className="text-2xl bg-transparent focus:outline-none"
                  placeholder="0.0"
                  value={token1Est}
                  // onChange={setToken1Amount}
                />
                <TokenPicker setToken={setToken1}>
                  {({ selectedToken }) => (
                    <button
                      placeholder="Select a token"
                      type="button"
                      className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center">
                        <img
                          src={selectedToken.img}
                          alt="Selected Token 1"
                          className="h-6 mr-2"
                        />
                        <span className="text-md">{selectedToken.ticker}</span>
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
            {isConnected && (
              <div className="flex flex-col w-full">
                <Button
                  onClick={() => swap()}
                  disabled={!token0Amount || !isConnected}
                  className="!flex !items-center hover:bg-[#2D3036]/50 !my-3 !bg-[#2D3036] !p-2 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !border-none !text-white !text-md"
                >
                  Swap
                </Button>
                <div className="text-sm">
                  <div className="flex justify-between mb-2">
                    <div>Est. received</div>
                    <div>{parseFloat(token1Est).toFixed(2).toString()}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>Min. received</div>
                    <div>{parseFloat(token1Min).toFixed(2).toString()}</div>
                  </div>
                  {/* <div className="flex justify-between mb-2">
                    <div>Network fee</div>
                    <div>~$0.01</div>
                  </div> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
