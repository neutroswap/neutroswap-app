// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import EthLogo from "@/public/logo/eth.svg";
import NeutroLogo from "@/public/logo/neutro_token.svg";
import EpochLogo from "@/public/logo/epoch.svg";
import DeallocationLogo from "@/public/logo/deallocation.svg";
import APYLogo from "@/public/logo/apy.svg";
import AllocationLogo from "@/public/logo/allocation.svg";
import AllocateDividendModal from "@/components/modules/Modal/AllocateDividendModal";
import DeallocateDividendModal from "@/components/modules/Modal/DeallocateDividendModal";
// const inter = Inter({ subsets: ['latin'] })

const data = {
  totalAllocation: 1000,
  currentEpoch: 1000,
  APY: 24.57,
  deallocationFee: 0,
};

export default function Dividend() {
  return (
    <div className="flex flex-col items-center sm:items-start justify-center sm:justify-between py-16">
      <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
        Dividends
      </span>
      <div className="flex flex-col">
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Allocate xGRAIL here to earn a share of protocol earnings in the form
          of real yield.
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
                    Total Allocation
                  </span>
                  <div className="flex space-x-1">
                    <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                      {data.totalAllocation}
                    </span>
                    <span className="text-sm text-neutral-500 mt-3">
                      xGRAIL
                    </span>
                  </div>
                </div>
                <AllocationLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Current Epochs
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    ${data.currentEpoch}
                  </span>
                </div>
                <EpochLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    APY
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    {data.APY}%
                  </span>
                </div>
                <APYLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-3 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Deallocation Fee
                  </span>
                  <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                    {data.deallocationFee}%
                  </span>
                </div>
                <DeallocationLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 w-full box-border space-x-3">
        <div className="col-span-7 w-full mt-8">
          <div className="flex flex-col rounded">
            <div className="border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm md:dark:shadow-dark-lg">
              <div className="flex flex-row justify-between items-start md:p-8 -mb-7">
                <p className="m-0 text-left font-semibold whitespace-nowrap">
                  Current epoch
                </p>
              </div>
              <div className="flex flex-col md:pl-8 m-0">
                <div className="flex">
                  <div className="w-1/2 flex items-center">
                    <div className="flex">
                      <EthLogo className="w-7 h-7 rounded-full" />
                      <NeutroLogo className="w-7 h-7 rounded-full" />
                    </div>
                    <div className="ml-2">
                      <span className="text-xs text-neutral-500">
                        ETH-USDC.e
                      </span>
                      <div className="mt-0 text-xs text-neutral-400">0</div>
                    </div>
                  </div>

                  <div className="w-1/2 flex items-center">
                    <div className="flex">
                      <EthLogo className="w-7 h-7 rounded-full" />
                    </div>
                    <div className="ml-2">
                      <span className="text-xs text-neutral-500">xGRAIL</span>
                      <div className="mt-0 text-xs text-neutral-400">0</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-col-2"></div>
              <hr className="my-4 ml-8 w-11/12 border-neutral-200/80 dark:border-neutral-800/80" />
              <div className="flex flex-col justify-between items-start md:p-8 md:pt-0">
                <div className="flex flex-col">
                  <p className="m-0 text-left font-semibold whitespace-nowrap">
                    Next epoch
                  </p>
                  <div className="flex flex-row justify-between space-x-40">
                    <span className="text-xs text-neutral-500">
                      Min. estimated value
                    </span>
                    <span className="text-xs text-neutral-500">APY</span>
                    <span className="text-xs text-neutral-500">
                      Remaining time
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-5 mt-8 flex flex-col rounded border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg">
          <div>
            <div className="flex flex-row items-center w-full md:p-8 justify-between">
              <p className="m-0 text-left font-semibold whitespace-nowrap">
                Your allocation
              </p>
              <div className="flex space-x-4">
                <DeallocateDividendModal />
                <AllocateDividendModal />
              </div>
            </div>
            <div className="flex flex-col md:pl-8 m-0">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-neutral-500">
                    Total Allocation
                  </span>
                  <div className="mt-1 text-xs text-neutral-400">0</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Total Share</span>
                  <div className="mt-1 text-xs text-neutral-400">0</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">
                    Manual Allocation
                  </span>
                  <div className="mt-1 text-xs text-neutral-400">0</div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">
                    Redeem Allocation
                  </span>
                  <div className="mt-1 text-xs text-neutral-400">0</div>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-7 border-neutral-200/80 dark:border-neutral-800/80" />
          <div className="-space-y-12">
            <div className="flex flex-row items-center justify-between w-full md:p-8 md:pt-0">
              <p className="m-0 text-left font-semibold whitespace-nowrap">
                Your dividends
              </p>
              <div className="flex space-x-4">
                <button className="px-4 py-2 border bg-amber-500 border-orange-600/50 text-xs font-semibold hover:bg-amber-600 rounded">
                  Claim all
                </button>
              </div>
            </div>
            <div className="flex flex-row items-center justify-between w-full md:p-8 md:mt-0">
              <div className="flex items-center">
                <div className="flex">
                  <EthLogo className="w-7 h-7 rounded-full" />
                  <NeutroLogo className="w-7 h-7 rounded-full" />
                </div>
                <div className="ml-2">
                  <span className="text-xs text-neutral-500">ETH-USDC.e</span>
                  <br />
                  <span className="text-xs text-neutral-500">0</span>
                </div>
              </div>
              <div>
                <button className="px-5 py-2 border bg-grey-500 text-xs font-semibold rounded">
                  Claim
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center justify-between w-full md:p-8 md:mt-0">
              <div className="flex items-center">
                <EthLogo className="w-7 h-7 rounded-full" />
                <div className="w-7 h-7"></div>
                <div className="ml-2">
                  <span className="text-xs text-neutral-500">xGRAIL</span>
                  <br />
                  <span className="text-xs text-neutral-500">0</span>
                </div>
              </div>
              <div>
                <button className="px-5 py-2 border bg-grey-500 text-xs font-semibold rounded">
                  Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
