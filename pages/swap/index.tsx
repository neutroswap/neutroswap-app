// import { Inter } from 'next/font/google'
import React, { useState, useEffect, Fragment, useRef, FC } from "react";
import Navbar from "@/components/modules/Navbar";
import { Button, Card, Divider, Page, Text } from "@geist-ui/core";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import SettingsPopover from "@/components/modules/swap/SettingsPopover";
import { SwitchTokensButton } from "@/components/modules/swap/SwitchTokensButton";
import { SwapButton } from "@/components/modules/swap/SwapButton";
import { useAccount } from "wagmi";
import NumberInput from "@/components/elements/NumberInput";
import { classNames } from "@/shared/helpers/classNames";

// const inter = Inter({ subsets: ['latin'] })

export default function Swap() {
  const { isConnected } = useAccount();
  const [tokenOneAmount, setTokenOneAmount] = useState("");
  const [tokenTwoAmount, setTokenTwoAmount] = useState("");
  const [prices, setPrices] = useState(null);
  const [tokenOne, setTokenOne] = useState("");
  const [tokenTwo, setTokenTwo] = useState("");

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
          <div className="left-0 right-0 my-3 flex items-center justify-center w-full">
            {isConnected && <SwapButton />}
          </div>
        </div>
      </div>
    </>
  );
}
