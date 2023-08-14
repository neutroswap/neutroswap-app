// import { Inter } from 'next/font/google'
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import EpochLogo from "@/public/logo/epoch.svg";
import WalletLogo from "@/public/icons/wallet.svg";
import LockLogo from "@/public/logo/lock.svg";
import LockedLogo from "@/public/logo/locked.svg";
import DividendLogo from "@/public/logo/dividends.svg";
import YieldboosterLogo from "@/public/logo/speedometer.svg";
import LaunchpadLogo from "@/public/logo/rocket.svg";
import RedeemForm from "@/components/modules/Form/RedeemForm";
import ConvertForm from "@/components/modules/Form/ConvertForm";
import { Card, CardContent, CardFooter } from "@/components/elements/Card";
import { Tab } from "@headlessui/react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { formatEther } from "ethers/lib/utils.js";
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import { DIVIDENDS_ABI, XGRAIL_ABI } from "@/shared/abi";
import {
  NEXT_PUBLIC_DIVIDENDS_CONTRACT,
  NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT,
} from "@/shared/helpers/constants";
import { utils } from "ethers";
import VestingXgrail from "@/components/modules/Vesting";

const data = {
  totalAllocation: 1000,
  currentEpoch: 1000,
  APY: 24.57,
  deallocationFee: 0,
};

export default function Xgrail() {
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  const { data: balanceData } = useContractRead({
    enabled: Boolean(address),
    watch: true,
    address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
    abi: XGRAIL_ABI,
    functionName: "balanceOf",
    args: [address!],
  });

  const { data: xgrailBalance } = useContractRead({
    enabled: Boolean(address),
    watch: true,
    address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
    abi: XGRAIL_ABI,
    functionName: "getXGrailBalance",
    args: [address!],
  });

  const availableXgrail = useMemo(() => {
    if (!balanceData) return "0";
    return `${Number(formatEther(balanceData)).toFixed(2)}`;
  }, [balanceData]);

  const redeemingAmount = useMemo(() => {
    if (!xgrailBalance) return "0";
    return `${Number(formatEther(xgrailBalance.redeemingAmount)).toFixed(2)}`;
  }, [xgrailBalance]);

  const allocatedAmount = useMemo(() => {
    if (!xgrailBalance) return "0";
    return `${Number(formatEther(xgrailBalance.allocatedAmount)).toFixed(2)}`;
  }, [xgrailBalance]);

  const totalXgrail = useMemo(() => {
    const availableXgrailValue = Number(availableXgrail);
    const allocatedAmountValue = Number(allocatedAmount);
    return (availableXgrailValue + allocatedAmountValue).toFixed(2);
  }, [availableXgrail, allocatedAmount]);

  const { data: totalAllocation } = useContractRead({
    watch: true,
    address: NEXT_PUBLIC_DIVIDENDS_CONTRACT as `0x${string}`,
    abi: DIVIDENDS_ABI,
    functionName: "totalAllocation",
  });

  const dividendTotalAllocation = useMemo(() => {
    if (!totalAllocation) return "0";
    return `${Number(formatEther(totalAllocation)).toFixed(2)}`;
  }, [totalAllocation]);

  return (
    <div className="flex flex-col items-center sm:items-start justify-center sm:justify-between py-16">
      <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
        Dashboard
      </span>
      <div className="flex flex-col">
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Convert your GRAIL, redeem your xGRAIL and manage your xGRAIL plugins
          allocations.
        </p>
      </div>

      <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />
      <div className="flex w-full box-border">
        <div className="grid grid-cols-12 w-full box-border space-x-3">
          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Total xGRAIL
                  </span>
                  <div className="flex space-x-1">
                    <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                      {totalXgrail}
                    </span>
                  </div>
                </div>
                <WalletLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Available xGRAIL
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    {availableXgrail}
                  </span>
                </div>
                <LockLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Allocated xGRAIL
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    {allocatedAmount}
                  </span>
                </div>
                <LockedLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Redeeming xGRAIL
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    {redeemingAmount}
                  </span>
                </div>
                <EpochLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 w-full box-border space-x-3">
        <div className="col-span-4 mt-8 flex flex-col ">
          <Card className="flex flex-col gap-4">
            <CardContent>
              <Tab.Group>
                <Tab.List className="flex items-center gap-4 border-b border-neutral-300 dark:border-neutral-700">
                  <Tab className="px-1 pb-3 text-sm font-semibold leading-6 text-neutral-500 focus:outline-none ui-selected:border-b-2 ui-selected:border-amber-500 ui-selected:text-amber-500 sm:text-base">
                    Convert
                  </Tab>
                  <Tab className="px-1 pb-3 text-sm font-semibold leading-6 text-neutral-500 focus:outline-none ui-selected:border-b-2 ui-selected:border-amber-500 ui-selected:text-amber-500 sm:text-base">
                    Redeem
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <ConvertForm />
                  </Tab.Panel>
                  <Tab.Panel>
                    <RedeemForm />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </CardContent>
          </Card>
          <VestingXgrail />

          {/* <Card className="p-4 mt-4">
            <div className="text-xl font-bold m-3 flex flex-col">Vesting</div>

            <div className=" uppercase font-thin m-3 mt-5">Claimable</div>
            <div className="flex flex-row gap-1 justify-between -mt-3 items-center">
              <span className="text-sm font-semibold m-3 sm:text-s">
                <span className="text-gray-900 dark:text-white"> 0.00001 </span>
                <span className="text-gray-600"> xGRAIL </span>
                <span className="text-gray-600 "> &gt; </span>
                <span className="text-gray-900 dark:text-white"> 0.00001 </span>
                <span className="text-gray-600 "> GRAIL </span>
              </span>
              <button className="border border-neutral-200 dark:border-neutral-800 mr-6">
                <span className="px-3 py-1 text-amber-500 text-sm font-semibold">
                  Claim
                </span>
              </button>
            </div>

            <div className=" uppercase font-thin m-3 mt-5">Pending</div>
            <div className="flex flex-row space-x-10 justify-between -mt-3">
              <span className="text-sm font-semibold m-3 sm:text-s">
                <span className="text-gray-900 dark:text-white">0.000001</span>
                <span className="text-gray-600"> xGRAIL</span>
                <span className="text-gray-600">&nbsp; &gt; &nbsp;</span>
                <span className="text-gray-900 dark:text-white">14d20h</span>
                <span className="text-gray-600">&nbsp; &gt; &nbsp;</span>
                <span className="text-gray-900 dark:text-white">0.000001</span>
                <span className="text-gray-600"> GRAIL</span>
              </span>
            </div>
          </Card> */}
        </div>

        {/* The other column */}
        <div className="col-span-8 mt-8 flex flex-col">
          {/* Dividends */}
          <Card>
            <a href="/dividend">
              <div className="flex justify-between items-center mt-2">
                <DividendLogo className="w-7 h-7 m-4 mx-10 text-amber-500" />
                <div className="px-3 py-1 border border-neutral-200 dark:border-neutral-800 mr-6">
                  <span className="text-amber-500 text-sm font-semibold">
                    Stake →
                  </span>
                </div>
              </div>
              <div className="text-xl font-bold ml-9 mt-2 text-black dark:text-white">
                Dividends
              </div>
              <span className="text-sm text-neutral-500 ml-9 mt-1">
                Earn yield from protocol earnings by staking your xGRAIL here.
              </span>
              <div className="border border-neutral-200 dark:border-neutral-800 mt-4 px-4 py-2 m-9 flex">
                <div className="flex- grow flex flex-col">
                  <span className="text-xs text-neutral-500">
                    Your Allocation
                  </span>
                  <div className="mt-1 text-sm text-neutral-400">0</div>
                </div>
                <div className="flex-grow flex flex-col">
                  <span className="text-xs text-neutral-500">
                    Total Allocations
                  </span>
                  <div className="mt-1 text-sm text-neutral-400">
                    {dividendTotalAllocation}
                  </div>
                </div>
                <div className="flex-grow flex flex-col">
                  <span className="text-xs text-neutral-500">
                    Deallocation Fee
                  </span>
                  <div className="mt-1 text-sm text-neutral-400">0</div>
                </div>
              </div>
            </a>
          </Card>
          {/* Yield Booster */}
          <Card className="mt-5">
            <a href="/yieldbooster">
              <div className="flex justify-between items-center mt-2">
                <YieldboosterLogo className="w-7 h-7 m-4 mx-10 text-amber-500" />
                <div className="px-3 py-1 border border-neutral-200 dark:border-neutral-800 mr-6">
                  <span className="text-amber-500 text-sm font-semibold">
                    Stake →
                  </span>
                </div>
              </div>
              <div className="text-xl font-bold ml-9 mt-2 text-black dark:text-white">
                Yield Booster
              </div>
              <span className="text-sm text-neutral-500 ml-9 mt-1">
                Boost your staking yields by up to +100% by adding xGRAIL to any
                eligible position.
              </span>
              <div className="border border-neutral-200 dark:border-neutral-800 mt-4 px-4 py-2 m-9 flex">
                <div className="flex- grow flex flex-col">
                  <span className="text-xs text-neutral-500">
                    Your Allocation
                  </span>
                  <div className="mt-1 text-sm text-neutral-400">0</div>
                </div>
                <div className="flex-grow flex flex-col">
                  <span className="text-xs text-neutral-500">
                    Total Allocations
                  </span>
                  <div className="mt-1 text-sm text-neutral-400">0</div>
                </div>
                <div className="flex-grow flex flex-col">
                  <span className="text-xs text-neutral-500">
                    Deallocation Fee
                  </span>
                  <div className="mt-1 text-sm text-neutral-400">0</div>
                </div>
              </div>
            </a>
          </Card>
          {/* Launchpad */}
          <Card className="mt-5">
            <a href="/launchpad">
              <div className="flex justify-between items-center mt-2">
                <LaunchpadLogo className="w-7 h-7 m-4 mx-10 text-amber-500" />
                <div className="px-3 py-1 border border-neutral-200 dark:border-neutral-800 mr-6">
                  <span className="text-amber-500 text-sm font-semibold">
                    Stake →
                  </span>
                </div>
              </div>
              <div className="text-xl font-bold ml-9 mt-2 text-black dark:text-white">
                Launchpad
              </div>
              <span className="text-sm text-neutral-500 ml-9 mt-1">
                Get perks and benefits from every project on Camelot's launchpad
                by staking your xGRAIL here.
              </span>
              <div className="border border-neutral-200 dark:border-neutral-800 mt-4 px-4 py-2 m-9 flex">
                <div className="flex- grow flex flex-col">
                  <span className="text-xs text-neutral-500">
                    Your Allocation
                  </span>
                  <div className="mt-1 text-sm text-neutral-400">0</div>
                </div>
                <div className="flex-grow flex flex-col">
                  <span className="text-xs text-neutral-500">
                    Total Allocations
                  </span>
                  <div className="mt-1 text-sm text-neutral-400">0</div>
                </div>
                <div className="flex-grow flex flex-col">
                  <span className="text-xs text-neutral-500">
                    Deallocation Fee
                  </span>
                  <div className="mt-1 text-sm text-neutral-400">0</div>
                </div>
              </div>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
