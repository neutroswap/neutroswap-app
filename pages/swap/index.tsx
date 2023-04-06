import React, { useState, useEffect, Fragment, useRef, FC } from "react";
import Navbar from "@/components/modules/Navbar";
import { Button, Card, Divider, Page, Text } from "@geist-ui/core";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import SettingsPopover from "@/components/modules/swap/SettingsPopover";
import NumberInput from "@/components/elements/NumberInput";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  UniswapPair,
  UniswapVersion,
  UniswapPairSettings,
} from "simple-uniswap-sdk";
import { useAccount } from "wagmi";
import NEUTRO_ROUTER_ABI from "@/shared/abi/NEUTRO_ROUTER_ABI.json";
import { useContractRead } from "wagmi";

// type SwapDetails = {
//   tokenOne: string;
//   tokenTwo: string;
//   tokenOneAmount: string;
//   tokenTwoAmount: string;
//   amountsOut: number;
//   setAmountsOut: React.Dispatch<React.SetStateAction<number>>;
// };

export default function Swap() {
  const { address, isConnected } = useAccount();
  const [tokenOneAmount, setTokenOneAmount] = useState("0");
  const [tokenTwoAmount, setTokenTwoAmount] = useState("0");
  // const [prices, setPrices] = useState(null);
  const [amountsOut, setAmountsOut] = useState(0);
  const [tokenOne, setTokenOne] = useState<`0x${string}`>(
    "0x0000000000000000000000000000000000000000"
  );
  const [tokenTwo, setTokenTwo] = useState<`0x${string}`>(
    "0x0000000000000000000000000000000000000000"
  );
  const [uniswapFactory, setUniswapFactory] = useState();
  const [pair, setPair] = useState("");

  const { data: getPair } = useContractRead({
    address: "0xa3F17F5BC296674415205D50Fa5081834411d65e",
    abi: NEUTRO_ROUTER_ABI,
    functionName: "getPair",
    args: [tokenOne, tokenTwo],
  });
  setPair(getPair);

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
      pairAddress: pair,
      // routerAbi: NEUTRO_ROUTER_ABI,
      // routerMethods: "",
    };
    const fac = async (uni: any) => {
      console.log("owowow");
      let x = await uni.createFactory();
      setUniswapFactory(x);
    };
    if (tokenOne && tokenTwo) {
      const uniswapPair = new UniswapPair({
        fromTokenContractAddress: tokenOne,
        toTokenContractAddress: tokenTwo,
        ethereumAddress: address as string,
        chainId: 15557,
        providerUrl: "https://api-testnet2.trust.one/",
        settings: new UniswapPairSettings({
          slippage: 0.0005,
          deadlineMinutes: 5,
          disableMultihops: true,
          cloneUniswapContractDetails: {
            v2Override: cloneUniswapContractDetailsV2,
          },
          uniswapVersions: [UniswapVersion.v2],
          customNetwork: customNetworkData,
        }),
      });
      fac(uniswapPair);
      const uniswapPairFactory: any = uniswapPair.createFactory();
      setUniswapFactory(uniswapPairFactory);
      console.log("doneee ", uniswapPairFactory.provider, uniswapPairFactory);
    }
  }, []);

  useEffect(() => {
    const swap = async () => {
      const uniswapPair = new UniswapPair({
        fromTokenContractAddress: tokenOne,
        toTokenContractAddress: tokenTwo,
        ethereumAddress: address as string,
        chainId: 15557,
      });
    };

    return () => {
      second;
    };
  }, [third]);

  // function switchTokens() {
  //   setTokenOne(tokenTwo);
  //   setTokenTwo(tokenOne);
  // }

  // const { config: swapExactETHForTokensConfig } = usePrepareContractWrite({
  //   address: ROUTER_CONTRACT,
  //   abi: NEUTRO_ROUTER_ABI,
  //   functionName: "swapExactETHForTokens",
  //   args: [amountsOut, [tokenOne, tokenTwo], address, getTimestamp()],
  //   overrides: {
  //     value: ethers.utils.parseEther(tokenOneAmount),
  //   },
  // });

  // const { data: swapExactETHForTokensData, write: swapExactETHForTokensWrite } =
  //   useContractWrite(swapExactETHForTokensConfig);

  // const { config: swapExactTokensForETHConfig } = usePrepareContractWrite({
  //   address: ROUTER_CONTRACT,
  //   abi: NEUTRO_ROUTER_ABI,
  //   functionName: "swapExactTokensForETH",
  //   args: [
  //     9974900500,
  //     9950062996,
  //     [tokenOne, tokenTwo],
  //     address,
  //     getTimestamp(),
  //   ],
  // });

  // const { data: swapExactTokensForETHData, write: swapExactTokensForETHWrite } =
  //   useContractWrite(swapExactTokensForETHConfig);

  // const { config: swapExactTokensForTokensConfig } = usePrepareContractWrite({
  //   address: ROUTER_CONTRACT,
  //   abi: NEUTRO_ROUTER_ABI,
  //   functionName: "swapExactTokensForTokens",
  //   args: [
  //     9974900500,
  //     9950062996,
  //     [tokenOne, tokenTwo],
  //     address,
  //     getTimestamp(),
  //   ],
  // });

  // const {
  //   data: swapExactTokensForTokensData,
  //   write: swapExactTokensForTokensWrite,
  // } = useContractWrite(swapExactTokensForTokensConfig);

  // const { isLoading, isSuccess } = useWaitForTransaction({
  //   hash: data?.hash,
  // });

  // const handleClick = () => {
  //   if (tokenOne === "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6") {
  //     swapExactETHForTokensWrite?.();
  //   }
  //   if (tokenTwo === "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6") {
  //     swapExactTokensForETHWrite?.();
  //   } else {
  //     swapExactTokensForTokensWrite?.();
  //   }
  // };

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
              <SettingsPopover />
            </div>
            <div className="p-4 bg-black/50 rounded-lg">
              <div className="flex justify-between">
                <p className="text-sm text-neutral-400">You Sell</p>
                {/* <p className="text-sm text-neutral-400">{tokenBalance}</p> */}
              </div>
              <div className="flex justify-between">
                <NumberInput
                  className="text-2xl bg-transparent focus:outline-none"
                  placeholder="0.0"
                  value={tokenOneAmount}
                  onChange={setTokenOneAmount}
                />
                <TokenPicker setToken={setTokenOne}>
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
                {/* <p className="text-sm text-neutral-400">{tokensBalance}</p> */}
              </div>
              <div className="flex justify-between">
                <NumberInput
                  className="text-2xl bg-transparent focus:outline-none"
                  placeholder="0.0"
                  value={tokenTwoAmount}
                  onChange={setTokenTwoAmount}
                />
                <TokenPicker setToken={setTokenTwo}>
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
              <Button
                // onClick={() => handleClick}
                disabled={!tokenOneAmount || !isConnected}
                className="!flex !items-center hover:bg-[#2D3036]/50 !my-3 !bg-[#2D3036] !p-2 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !border-none !text-white !text-md"
              >
                Swap
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
