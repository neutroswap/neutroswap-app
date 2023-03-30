// import { Inter } from 'next/font/google'
import React, { useState, useEffect, Fragment } from "react";
import Navbar from "@/components/modules/Navbar";
import { Button, Card, Divider, Page, Text } from "@geist-ui/core";
import { Popover, Transition } from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import {
  CheckIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/20/solid";
import { SwitchTokenButton } from "@/components/swap/SwitchTokenButton";
import SettingsPopover from "@/components/swap/SettingsPopover";

// const inter = Inter({ subsets: ['latin'] })

export default function Swap() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[80%] py-10">
        <div className="">
          <Text h2 height={3} className="text-center">
            Trade
          </Text>
          <Text type="secondary" p className="text-center !mt-0">
            Trade your token
          </Text>
        </div>
        <div className="mt-8 rounded-lg border border-neutral-800/50 shadow-dark-lg p-4 space-y-2">
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
                value={10}
              />
              <SwitchTokenButton />
            </div>
          </div>
          <div className="p-4 bg-black/50 rounded-lg">
            <p className="text-sm text-neutral-400">You Buy</p>
            <div className="flex justify-between">
              <input
                className="text-2xl bg-transparent focus:outline-none"
                value={10}
              />
              <SwitchTokenButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function IconOne() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="8" fill="#FFEDD5" />
      <path
        d="M24 11L35.2583 17.5V30.5L24 37L12.7417 30.5V17.5L24 11Z"
        stroke="#FB923C"
        strokeWidth="2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.7417 19.8094V28.1906L24 32.3812L31.2584 28.1906V19.8094L24 15.6188L16.7417 19.8094Z"
        stroke="#FDBA74"
        strokeWidth="2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.7417 22.1196V25.882L24 27.7632L27.2584 25.882V22.1196L24 20.2384L20.7417 22.1196Z"
        stroke="#FDBA74"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconTwo() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="8" fill="#FFEDD5" />
      <path
        d="M28.0413 20L23.9998 13L19.9585 20M32.0828 27.0001L36.1242 34H28.0415M19.9585 34H11.8755L15.9171 27"
        stroke="#FB923C"
        strokeWidth="2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.804 30H29.1963L24.0001 21L18.804 30Z"
        stroke="#FDBA74"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconThree() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="8" fill="#FFEDD5" />
      <rect x="13" y="32" width="2" height="4" fill="#FDBA74" />
      <rect x="17" y="28" width="2" height="8" fill="#FDBA74" />
      <rect x="21" y="24" width="2" height="12" fill="#FDBA74" />
      <rect x="25" y="20" width="2" height="16" fill="#FDBA74" />
      <rect x="29" y="16" width="2" height="20" fill="#FB923C" />
      <rect x="33" y="12" width="2" height="24" fill="#FB923C" />
    </svg>
  );
}
