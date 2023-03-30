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

// const inter = Inter({ subsets: ['latin'] })

export default function Swap() {
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

        <SwapButton />
      </div>
    </>
  );
}
