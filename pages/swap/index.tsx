// import { Inter } from 'next/font/google'
import React, { useState, useEffect, Fragment, useRef, FC } from "react";
import Navbar from "@/components/modules/Navbar";
import { Button, Card, Divider, Page, Text } from "@geist-ui/core";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import SettingsPopover from "@/components/modules/swap/SettingsPopover";
import { SwitchTokensButton } from "@/components/modules/swap/SwitchTokensButton";
import { SwapButton } from "@/components/modules/swap/SwapButton";
import NumberInput from "@/components/elements/NumberInput";
import { classNames } from "@/shared/helpers/classNames";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { NEUTRO_ROUTER_ABI } from "@/shared/helpers/abi/index";
import { ROUTER_CONTRACT } from "@/shared/helpers/contract";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
} from "wagmi";

// const inter = Inter({ subsets: ['latin'] })

type SwapDetails = {
  tokenOne: string;
  tokenTwo: string;
  tokenOneAmount: string;
  tokenTwoAmount: string;
};

export default function Swap() {
  const { address, isConnected } = useAccount();
  const [tokenOneAmount, setTokenOneAmount] = useState("");
  const [tokenTwoAmount, setTokenTwoAmount] = useState("");
  const [prices, setPrices] = useState(null);
  const [tokenOne, setTokenOne] = useState("");
  const [tokenTwo, setTokenTwo] = useState("");

  // const { amountsOut, setAmountsOut } = useState();

  // useEffect(() => {
  //   const getAmountsOut = async () => {
  //     try {
  //       const amounts = await amountsOut?.toString();
  //       setAmountsOut(amounts!);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   getAmountsOut();
  // }, []);

  // const { dataAmountsOut } = useContractRead({
  //   address: "0xC397DAD720B0b1d38Ee5e5Ab5689F88866b9f107",
  //   abi: RouterABI,
  //   functionName: "getAmountsOut",
  //   args: [
  //     ethers.utils.parseEther("0.00000001"),
  //     [
  //       "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  //       "0x30Cf0E9f55Dc4Ce9C2c176D5baE85D25c0201569",
  //     ],
  //   ],
  // });
  // console.log(dataAmountsOut);

  const { config: swapExactETHForTokensConfig } = usePrepareContractWrite({
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: "swapExactETHForTokens",
    args: [9974701255, [tokenOne, tokenTwo], address, 1711818405],
    overrides: {
      value: ethers.utils.parseEther(tokenOneAmount),
    },
  });

  const { data: swapExactETHForTokensData, write: swapExactETHForTokensWrite } =
    useContractWrite(swapExactETHForTokensConfig);

  const { config: swapExactTokensForETHConfig } = usePrepareContractWrite({
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: "swapExactTokensForETH",
    args: [9974900500, 9950062996, [tokenOne, tokenTwo], address, 1711818405],
  });

  const { data: swapExactTokensForETHData, write: swapExactTokensForETHWrite } =
    useContractWrite(swapExactTokensForETHConfig);

  const { config: swapExactTokensForTokensConfig } = usePrepareContractWrite({
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: "swapExactTokensForTokens",
    args: [9974900500, 9950062996, [tokenOne, tokenTwo], address, 1711818405],
  });

  const {
    data: swapExactTokensForTokensData,
    write: swapExactTokensForTokensWrite,
  } = useContractWrite(swapExactTokensForTokensConfig);

  // const { isLoading, isSuccess } = useWaitForTransaction({
  //   hash: data?.hash,
  // });

  const handleClick = () => {
    if (tokenOne === "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6") {
      swapExactETHForTokensWrite?.();
    }
    if (tokenTwo === "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6") {
      swapExactTokensForETHWrite?.();
    } else {
      swapExactTokensForTokensWrite?.();
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
              <SettingsPopover />
            </div>
            <div className="p-4 bg-black/50 rounded-lg">
              <p className="text-sm text-neutral-400">You Sell</p>
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
            <SwitchTokensButton />
            <div className="p-4 bg-black/50 rounded-lg">
              <p className="text-sm text-neutral-400">You Buy</p>
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
                onClick={() => handleClick}
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
