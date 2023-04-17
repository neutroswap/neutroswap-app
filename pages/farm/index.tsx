// import { Inter } from 'next/font/google'
import { Button, Input, Page, Text } from "@geist-ui/core";
import WalletIcon from "@/public/icons/wallet.svg";
import { Disclosure, RadioGroup } from "@headlessui/react";
import {
  ChevronUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Fragment, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { classNames } from "@/shared/helpers/classNamer";
import NumberInput from "@/components/elements/NumberInput";
import { useAccount } from "wagmi";

// const inter = Inter({ subsets: ['latin'] })

const TABS = ["All Farms", "My Farms"];

export default function Farm() {
  const { address } = useAccount();
  const [farmList, setFarmList] = useState<any>([]);

  useEffect(() => {
    async function loadListFarm() {
      const response = await fetch("/api/getListFarm", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const fetched = await response.json();
      console.log("data", fetched.data);
      const data = fetched.data.farms.map((details: any) => ({
        name: details.name,
        totalLiq: details.details.totalLiquidity,
        rps: details.details.rps,
        apr: details.details.apr,
        pid: details.pid,
      }));
      setFarmList(data);
    }
    loadListFarm();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80%] py-10">
      <div>
        <Text h2 height={3} className="text-center">
          Yield Farming
        </Text>
        <Text type="secondary" p className="text-center !mt-0">
          Earn yield by staking your LP Tokens
        </Text>
      </div>

      <div className="flex justify-between items-center min-w-[80%] mt-5 mb-10">
        <div className="flex flex-col px-10 py-7 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg shadow">
          <div className="mb-2 text-lg font-medium">Total Value Locked</div>
          <div className="text-center text-amber-600">$100,000,000</div>
        </div>
        <div className="flex flex-col px-10 py-7 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg shadow">
          <div className="mb-2 text-lg font-medium">Your Staked Assets</div>
          <div className="text-center text-amber-600">$100,000,000</div>
        </div>
        <div className="flex flex-col px-10 py-7 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg shadow">
          <div className="mb-2 text-lg font-medium">Unclaimed Rewards</div>
          <div className="text-center text-amber-600">$100,000,000</div>
        </div>
        <Button
          className={classNames(
            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm !text-base",
            "text-white dark:text-amber-600",
            "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]"
          )}
        >
          Harvest All
        </Button>
      </div>

      <div className="flex min-w-[80%] justify-between mb-10">
        <RadioGroup>
          <div className="flex w-full relative space-x-3">
            <>
              {TABS.map((tab, i) => (
                <RadioGroup.Option as={Fragment} key={i} value={tab}>
                  {({ checked }) => (
                    <div
                      className={classNames(
                        checked
                          ? "text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 shadow"
                          : "text-black dark:text-neutral-400 hover:bg-neutral-100 hover:dark:bg-white/[0.04]",
                        "z-[1] relative rounded-lg text-md h-8 px-3 py-1 text-center font-medium flex flex-grow items-center justify-center cursor-pointer"
                      )}
                    >
                      {tab}
                    </div>
                  )}
                </RadioGroup.Option>
              ))}
            </>
          </div>
        </RadioGroup>
        <div className="flex items-center w-1/3 bg-white dark:bg-neutral-800 shadow rounded-lg px-2">
          <input
            type="text"
            placeholder="Search by farm, name, symbol or address"
            className="bg-transparent p-2 rounded-md w-full placeholder-black dark:placeholder-neutral-600"
          />
          <MagnifyingGlassIcon className="flex inset-0 h-6 text-neutral-400" />
        </div>
      </div>

      {farmList.map((farm: any) => (
        <Disclosure key={farm}>
          {({ open }) => (
            <div className="mb-4 min-w-[80%]">
              <Disclosure.Button
                className={classNames(
                  "flex justify-between items-center py-2 w-full bg-neutral-200 dark:bg-neutral-900 rounded-lg",
                  open && "rounded-b-none"
                )}
              >
                <div className="flex justify-between w-full ml-4">
                  <div className="flex -space-x-1 relative z-0 overflow-hidden"></div>
                  <span className="text-left font-semibold text-lg">
                    {farmList[0].name}
                    {farmList[0].totalLiq}
                    {farmList[0].rps}
                    {farmList[0].apr}
                    {/* {farmList.} */}
                  </span>
                </div>
                <ChevronUpIcon
                  className={`${
                    open ? "rotate-180 transform" : ""
                  } h-5 w-5 text-orange-400 mr-4`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="p-4 pt-6  rounded-md rounded-t-none border border-neutral-200 dark:border-neutral-900">
                <div className="flex w-full space-x-5">
                  <div className="flex flex-col justify-between w-full space-y-3">
                    <div className="flex justify-between">
                      <div>Available:</div>
                      <div>0 LP ($0)</div>
                    </div>
                    <div className="flex bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
                      <NumberInput
                        placeholder="0.0"
                        className="bg-transparent !px-3 !py-2 !rounded-lg"
                      ></NumberInput>
                    </div>
                    <Button
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-amber-600",
                        "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                      )}
                    >
                      Stake LP Tokens
                    </Button>
                  </div>

                  <div className="flex flex-col justify-between w-full ">
                    <div className="flex justify-between">
                      <div>Deposited:</div>
                      <div>0 LP ($0)</div>
                    </div>
                    <div className="flex bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
                      <NumberInput
                        placeholder="0.0"
                        className="bg-transparent !px-3 !py-2 !rounded-lg"
                      ></NumberInput>
                    </div>
                    <Button
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-amber-600",
                        "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                      )}
                    >
                      Unstake LP Tokens
                    </Button>
                  </div>

                  <div className="flex flex-col justify-between w-full">
                    <div>Earned rewards:</div>
                    <div className="flex justify-center">1,000 $NEUTRO</div>
                    <Button
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-amber-600",
                        "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                      )}
                    >
                      Harvest
                    </Button>
                  </div>
                </div>
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
