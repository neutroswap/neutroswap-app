import { classNames } from "@/shared/helpers/classNames";
import { Text, Button, useTheme } from "@geist-ui/core";
import { Tab } from "@headlessui/react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { ScaleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";

import NoContentDark from "@/public/states/empty/dark.svg"
import NoContentLight from "@/public/states/empty/light.svg"
import { useContractReads } from "wagmi";
import { NEUTRO_POOL_ABI } from "@/shared/abi";

export default function PoolDetails() {
  return (
    <div className="flex py-10">
      <Tab.Group>
        <div className="w-full grid grid-cols-12 gap-14">
          <Tab.List className="w-full col-span-2">
            <div className="flex flex-col space-y-2">
              <Link href="/pool" className="group text-black dark:text-white">
                <div className="flex space-x-1 items-center mb-4">
                  <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-all" />
                  <span>Pool</span>
                </div>
              </Link>
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
              )}>
                <span className="text-sm px-3 py-2">Overview</span>
              </Tab>
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
              )}>
                <span className="text-sm px-3 py-2">Deposit</span>
              </Tab>
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
              )}>
                <span className="text-sm px-3 py-2">Withdraw</span>
              </Tab>
            </div>
          </Tab.List>
          <Tab.Panels className="w-full col-span-10">
            <Tab.Panel>
              <PoolOverviewPanel />
            </Tab.Panel>
            <Tab.Panel>Content 2</Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
}

const PoolOverviewPanel = () => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <div className="">
      <div className="flex items-center space-x-3">
        <ScaleIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
        <p className="m-0 text-2xl font-semibold">Pool Overview</p>
      </div>
      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">Contract: {router.query.id}</p>

      <div className="inline-flex space-x-2 px-3 py-2 bg-neutral-200/50 dark:bg-neutral-900 rounded-lg">
        <span className="text-sm font-semibold">1 USDT</span>
        <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">=</span>
        <span className="text-sm font-semibold">1 DONI</span>
      </div>

      <div className="w-full mt-4 border border-neutral-200/50 dark:border-neutral-800 rounded-lg">
        <div className="w-full flex flex-col items-center py-6">
          {theme.type === "light" && <NoContentLight className="w-40 h-40" />}
          {theme.type === "dark" && <NoContentDark className="w-40 h-40" />}
          <p className="text-neutral-500 text-center">You do not have any liquidity positions. Deposit some tokens to open a position.</p>
          <Button className="!mt-2">Deposit now</Button>
        </div>
      </div>
    </div>
  )
}
