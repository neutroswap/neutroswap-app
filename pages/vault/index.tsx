// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import Logo from "@/public/logo.svg";
import { classNames } from "@/shared/helpers/classNamer";

// const inter = Inter({ subsets: ['latin'] })

export default function Vault() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80%] py-10">
      <div>
        <Text h2 height={3} className="text-center">
          Neutro Vault
        </Text>
        <Text type="secondary" p className="text-center !mt-0">
          Earn more NEUTRO by locking your NEUTRO
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
    </div>
  );
}
