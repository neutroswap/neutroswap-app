// import { Inter } from 'next/font/google'
import { useState, useEffect } from "react";
import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import EthLogo from "@/public/logo/eth.svg";
import NeutroLogo from "@/public/logo/neutro_token.svg";
import EpochLogo from "@/public/logo/epoch.svg";
import DeallocationLogo from "@/public/logo/deallocation.svg";
import APYLogo from "@/public/logo/apy.svg";
import AllocationLogo from "@/public/logo/allocation.svg";
import WalletLogo from "@/public/icons/wallet.svg";
import LockLogo from "@/public/logo/lock.svg";
import LockedLogo from "@/public/logo/locked.svg";
import DividendLogo from "@/public/logo/dividends.svg";
import YieldboosterLogo from "@/public/logo/speedometer.svg";
import LaunchpadLogo from "@/public/logo/rocket.svg";
// const inter = Inter({ subsets: ['latin'] })

const data = {
  totalAllocation: 1000,
  currentEpoch: 1000,
  APY: 24.57,
  deallocationFee: 0,
};

export default function Dividend() {
  const [activeTab, setActiveTab] = useState("Convert");
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(15);
  const [error, setError] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleDecrement = () => {
    if (months === 0 && days === 0) {
      // Don't decrement further as it will go below 15 days
      setError(true); // Show the error message
      return;
    }

    if (days === 0) {
      setMonths((prevMonths) => prevMonths - 1);
      setDays(29);
    } else {
      setDays((prevDays) => prevDays - 1);
    }

    setError(false); // Reset the error state on decrement
  };

  const handleIncrement = () => {
    if (months < 6 || (months === 6 && days < 30)) {
      if (days === 29) {
        setDays(0);
        setMonths((prevMonths) => prevMonths + 1);
      } else {
        setDays((prevDays) => prevDays + 1);
      }
    }

    if (months > 6 || (months === 6 && days >= 30)) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleSetMax = () => {
    setMonths(6);
    setDays(0);
    setError(false);
  };

  useEffect(() => {
    if (months === 6 && days > 0) {
      setError(true);
    } else if (months === 0 && days < 15) {
      setError(true);
    } else {
      setError(false);
    }
  }, [months, days]);

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
                      {data.totalAllocation}
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
                    {data.currentEpoch}
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
                    {data.APY}
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
                    {data.deallocationFee}
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
          <div className="rounded border p-4 border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg">
            <div className="flex justify-center items-center border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4 mt-2">
              <button
                className={`w-1/2 text-neutral-600 dark:text-neutral-400 font-medium focus:outline-none px-4 py-2 border-b-2 border-transparent hover:text-neutral-900 dark:hover:text-neutral-300 hover:border-neutral-600 dark:hover:border-neutral-300 ${
                  activeTab === "Convert"
                    ? "border-neutral-600 dark:border-neutral-300"
                    : ""
                }`}
                onClick={() => handleTabClick("Convert")}
              >
                Convert
              </button>
              <button
                className={`w-1/2 text-neutral-600 dark:text-neutral-400 font-medium focus:outline-none px-4 py-2 border-b-2 border-transparent hover:text-neutral-900 dark:hover:text-neutral-300 hover:border-neutral-600 dark:hover:border-neutral-300 ${
                  activeTab === "Redeem"
                    ? "border-neutral-600 dark:border-neutral-300"
                    : ""
                }`}
                onClick={() => handleTabClick("Redeem")}
              >
                Redeem
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "Convert" && (
              <div
                className={`tabcontent ${
                  activeTab === "Convert" ? "active" : ""
                }`}
              >
                <div className="text-xl font-bold m-7 flex flex-col">
                  Get xGRAIL
                  <span className="text-xs font-normal text-neutral-500 mt-1">
                    Unlock bonus rewards and exclusive benefits by converting
                    your GRAIL to xGRAIL.
                  </span>
                </div>
                <div className="flex items-center mt-4 m-7">
                  <input
                    type="text"
                    className="px-4 py-2 border bg-transparent border-neutral-300 dark:border-neutral-700 focus:border-primary focus:ring-1 ring-primary focus:ring-opacity-50 w-full"
                    placeholder="0"
                  />
                  <button
                    className="px-4 py-2 ml-2 bg-primary text-neutral-500 rounded"
                    onClick={() => console.log("Max clicked")}
                  >
                    Max
                  </button>
                </div>
                <div className="flex justify-end text-xs text-neutral-500 -mt-5 mr-4">
                  <div>
                    <span className="mr-2">balance:</span>
                    <span>0 GRAIL</span>
                  </div>
                </div>
                <Button
                  className="items-center mt-8 px-4 py-2 w-11/12 m-1 bg-primary text-neutral-500 rounded border border-neutral-200 dark:border-neutral-800 justify-center flex mx-auto"
                  onClick={() => console.log("Approve clicked")}
                >
                  Approve
                </Button>
              </div>
            )}

            {activeTab === "Redeem" && (
              <div
                className={`tabcontent ${
                  activeTab === "Redeem" ? "active" : ""
                }`}
              >
                {/* Your Redeem content goes here */}
                <div className="text-xl font-bold m-7 flex flex-col">
                  Redeem xGRAIL
                  <span className="text-xs font-normal text-neutral-500 mt-1">
                    Redeem your xGRAIL back into GRAIL over a vesting period of
                    15 days (1 → 0.5 ratio) to 6 months (1 → 1 ratio).
                  </span>
                </div>
                <div className="flex items-center mt-4 m-7">
                  <input
                    type="text"
                    className="px-4 py-2 border bg-transparent border-neutral-300 dark:border-neutral-700 focus:border-primary focus:ring-1 ring-primary focus:ring-opacity-50 w-full"
                    placeholder="0"
                  />
                  <button
                    className="px-4 py-2 ml-2 bg-primary text-neutral-500 rounded"
                    onClick={() => console.log("Max clicked")}
                  >
                    Max
                  </button>
                </div>
                <div className="flex justify-end text-xs text-neutral-500 -mt-5 mr-4">
                  <div>
                    <span className="mr-2">wallet balance:</span>
                    <span>0 GRAIL</span>
                  </div>
                </div>
                <div className="flex justify-between m-4">
                  <div className="flex flex-col m-4">
                    <div className="font-xs font-semibold">Redeem duration</div>
                    <a
                      className="text-xs text-amber-500 items-start"
                      onClick={handleSetMax}
                    >
                      Set max
                    </a>
                  </div>
                  <div className="flex flex-row items-center space-x-4">
                    <button
                      className="border w-8 h-8 font-semibold"
                      onClick={handleDecrement}
                    >
                      -
                    </button>
                    <div className="text-xs text-neutral-500 mb-0">
                      Months
                      <br />
                      <input
                        type="number"
                        value={months}
                        onChange={(e) => setMonths(parseInt(e.target.value))}
                        className="w-6 h-6 mt-1 bg-transparent text-neutral-500 font-bold"
                        placeholder="0"
                      ></input>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Days
                      <br />
                      <input
                        type="number"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="w-6 h-6 mt-1 bg-transparent text-neutral-500 font-bold"
                        placeholder="15"
                        min="15"
                        max="30"
                      ></input>
                    </div>
                    <button
                      className="border w-8 h-8 border-amber-500 text-amber-500 font-semibold"
                      onClick={handleIncrement}
                    >
                      +
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="border border-red-500 bg-red-100 text-xs text-red-500 p-2 mt-4 mx-7">
                    {months === 6
                      ? "Error: redeem duration can't exceed 180 days."
                      : "Error: redeem duration can't be set to less than 15 days."}
                  </div>
                )}
                <Button
                  className="items-center mt-8 px-4 py-2 w-11/12 m-1 bg-primary text-neutral-500 rounded border border-neutral-200 dark:border-neutral-800 justify-center flex mx-auto"
                  onClick={() => console.log("Approve clicked")}
                >
                  Redeem
                </Button>
              </div>
            )}
          </div>
          <div className="rounded border p-4 mt-4 border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg">
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
          </div>
        </div>

        {/* The other column */}
        <div className="col-span-8 mt-8 flex flex-col">
          {/* Dividends */}
          <a
            href="/dividend"
            className="border rounded h-60 border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg"
          >
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
          {/* Yield Booster */}
          <a
            href="/yieldbooster"
            className="border rounded h-60 mt-5 border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg"
          >
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
          {/* Launchpad */}
          <a
            href="/launchpad"
            className="border rounded h-60 mt-5 border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg"
          >
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
        </div>
      </div>
    </div>
  );
}
