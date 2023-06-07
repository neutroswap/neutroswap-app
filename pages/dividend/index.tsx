// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import Logo from "@/public/logo.svg";

// const inter = Inter({ subsets: ['latin'] })

export default function Dividend() {
  return (
    <div className="flex flex-col items-start justify-between py-16">
      <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
        Dividends
      </span>
      <div>
        <div className="flex flex-col">
          <p className="m-0 text-center text-base text-neutral-400 mt-2">
            Allocate xGRAIL here to earn a share of protocol earnings in the
            form of real yield.
          </p>
        </div>
      </div>

      <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />
      <div className="flex box-border">
        <div className="grid grid-cols-12 w-full box-border space-x-3">
          <div className="col-span-3 md:grow w-72 h-20 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1 mt-2">
              <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                Total Allocations
              </span>
            </div>
          </div>

          <div className="col-span-3 md:grow w-72 h-20 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1 mt-2">
              <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                Current Epochs
              </span>
            </div>
          </div>

          <div className="col-span-3 md:grow w-72 h-20 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1 mt-2">
              <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                APY
              </span>
            </div>
          </div>

          <div className="col-span-3 md:grow w-72 h-20 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1 mt-2">
              <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                Deallocation Fee
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 w-full box-border space-x-3">
        <div className="col-span-7 w-full mt-8 py-30 flex flex-col rounded border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm md:dark:shadow-dark-lg">
          <div className="flex flex-row justify-between items-center w-full md:p-8">
            <p className="m-0 text-left font-semibold whitespace-nowrap">
              Current epoch
            </p>
          </div>
          <hr className="my-4 ml-8 w-11/12 border-neutral-200/80 dark:border-neutral-800/80" />
          <div className="flex flex-row justify-between items-center w-full md:p-8 md:pt-0">
            <p className="m-0 text-left font-semibold whitespace-nowrap">
              Next epoch
            </p>
          </div>
        </div>

        <div className="col-span-5 w-full mt-8 px-6 flex flex-col rounded border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg">
          <div className="flex flex-row items-center w-full md:p-8">
            <p className="m-0 text-left font-semibold whitespace-nowrap">
              Your allocation
            </p>
          </div>
          <hr className="my-4 border-neutral-200/80 dark:border-neutral-800/80" />
          <div className="flex flex-row items-center w-full md:p-8 md:pt-2">
            <p className="m-0 text-left font-semibold whitespace-nowrap">
              Your dividends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
