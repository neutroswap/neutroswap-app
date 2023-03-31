// import { Inter } from 'next/font/google'
import React, { useState, useEffect, Fragment, useRef } from "react";
import Navbar from "@/components/modules/Navbar";
import { Button, Card, Divider, Page, Text } from "@geist-ui/core";
import { Popover, Transition } from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import SettingsPopover from "@/components/modules/swap/SettingsPopover";
import { SwitchTokensButton } from "@/components/modules/swap/SwitchTokensButton";
import { SwapButton } from "@/components/modules/swap/SwapButton";
import { useAccount } from "wagmi";
import NumberInput from "@/components/elements/NumberInput";

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
              <TokenPicker setToken={setTokenOne} />
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
              <TokenPicker setToken={setTokenTwo} />
            </div>
          </div>
        </div>
        <div className="left-0 right-0 my-3 flex items-center justify-center">
          {isConnected && <SwapButton />}
        </div>
      </div>
    </>
  );
}
