// import { Inter } from 'next/font/google'
import React, { useState, useEffect, Fragment } from "react";
import Navbar from "@/components/modules/Navbar";
import { Button, Card, Divider, Page, Text } from "@geist-ui/core";
import { Popover, Transition } from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import SettingsPopover from "@/components/modules/swap/SettingsPopover";
import { SwitchTokensButton } from "@/components/modules/swap/SwitchTokensButton";
import { SwapButton } from "@/components/modules/swap/SwapButton";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { writeContract } from "@wagmi/core";
import RouterABI from "../../shared/helpers/abis/router.json";
import { ethers } from "ethers";

// const inter = Inter({ subsets: ['latin'] })

export default function Swap() {
  const { address, isConnected } = useAccount();

  const { config } = usePrepareContractWrite({
    address: "0xC397DAD720B0b1d38Ee5e5Ab5689F88866b9f107",
    abi: RouterABI,
    functionName: "swapETHForExactTokens",
    args: [
      9974900500,
      [
        "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        "0x30Cf0E9f55Dc4Ce9C2c176D5baE85D25c0201569",
      ],
      "0x523b9D1Ae36c28d1e480c6a0494E306a250bEA26",
      1711818405,
    ],
    overrides: {
      value: ethers.utils.parseEther("0.00000001"),
    },
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

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
              <input
                className="text-2xl bg-transparent focus:outline-none"
                placeholder="0"
              />
              <TokenPicker />
            </div>
          </div>
          <SwitchTokensButton />
          <div className="p-4 bg-black/50 rounded-lg">
            <p className="text-sm text-neutral-400">You Buy</p>
            <div className="flex justify-between">
              <input
                className="text-2xl bg-transparent focus:outline-none"
                placeholder="0"
              />
              <TokenPicker />
            </div>
          </div>
        </div>

        <div className="left-0 right-0 my-3 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              write?.();
            }}
            type="button"
            className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer"
          >
            <span>Swap</span>
          </button>
        </div>
      </div>
    </>
  );
}
