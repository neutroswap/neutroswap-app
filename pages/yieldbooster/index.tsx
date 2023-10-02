// import { Inter } from 'next/font/google'
import React from "react";
import { useState, useRef } from "react";
import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import EthLogo from "@/public/logo/eth.svg";
import NeutroLogo from "@/public/logo/neutro_token.svg";
import EpochLogo from "@/public/logo/epoch.svg";
import DeallocationLogo from "@/public/logo/deallocation.svg";
import APYLogo from "@/public/logo/apy.svg";
import AllocationLogo from "@/public/logo/allocation.svg";
import WarningLogo from "@/public/logo/warning.svg";
import { Table, Toggle, Spacer, Select } from "@geist-ui/core";
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/elements/DropdownMenu";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import Input from "@/components/elements/Input";
// const inter = Inter({ subsets: ['latin'] })

const data = {
  totalAllocation: 1000,
  yourAllocation: 500,
  deallocationFee: 0.5,
};

export default function Dividend() {
  const [isChecked, setIsChecked] = useState(false);
  const searchRef = useRef<any>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const columnLabel = isChecked ? "Active allocation → New allocation" : "APR";
  const columnLabel1 = isChecked ? "Active mul. → New mul." : "Boost";

  const [yieldBearingChecked, setYieldBearingChecked] = React.useState(false);
  const [lockedChecked, setLockedChecked] = React.useState(false);
  const [boostedChecked, setBoostedChecked] = React.useState(false);
  const [nitroChecked, setNitroChecked] = React.useState(false);

  const toggleFilter = () => {
    setShowFilter((prevShowFilter) => !prevShowFilter);
  };

  const handleFilterClick = (filter: any) => {
    setSelectedFilter(filter);
    setShowFilter(false);
  };

  const handler = (val: any) => console.log(val);

  return (
    <div className="flex flex-col items-center sm:items-start justify-center sm:justify-between py-16">
      <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
        Yield Booster
      </span>
      <div className="flex flex-col">
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Allocate xNEUTRO here to increase the yield of your staking positions
          up to +100%.
        </p>
      </div>
      <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />
      <div className="flex w-full box-border">
        <div className="grid grid-cols-12 w-full box-border space-x-3">
          <div className="col-span-4 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
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
                      xNEUTRO
                    </span>
                  </div>
                </div>
                <AllocationLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-4 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
            <div className="px-2 py-1">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-left text-neutral-500 whitespace-nowrap">
                    Your Allocation
                  </span>
                  <div className="flex space-x-1">
                    <span className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">
                      {data.yourAllocation}
                    </span>
                    <span className="text-sm text-neutral-500 mt-3">
                      xNEUTRO
                    </span>
                  </div>
                </div>
                <EpochLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>

          <div className="col-span-4 p-2 border border-neutral-200/80 dark:border-neutral-800/80 rounded">
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
                <APYLogo className="w-7 h-7 text-amber-500 rounded-full mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 w-full border border-neutral-200/80 dark:border-neutral-800/80 rounded mt-8">
        <div className="flex flex-row justify-between p-4 m-3">
          <div className="text-black dark:text-white text-xl font-semibold">
            Positions
          </div>
          <label className="relative space-x-3 inline-flex items-center cursor-pointer">
            <span className="ml-3 text-neutral-500 text-xs">Advanced View</span>
            {/* <input
              type="checkbox"
              className="hidden"
              checked={isChecked}
              onChange={handleToggle}
            />
            <span
              className={`h-5 w-12 rounded-full p-1 ${
                isChecked
                  ? "bg-amber-500"
                  : "bg-neutral-200 dark:bg-neutral-800"
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transform transition-transform ease-in-out ${
                  isChecked ? "translate-x-6" : ""
                }`}
              ></span>
            </span> */}
            <Toggle
              type="warning"
              initialChecked={isChecked}
              onChange={() => setIsChecked((prev) => !prev)}
            />
          </label>
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-grow items-center px-6 space-x-4">
            <Input
              type="text"
              // ref={searchRef}
              placeholder="Search"
              // onChange={handleSearchAll}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="border border-neutral-200/80 dark:border-neutral-800/80 py-2 px-2 rounded-md flex space-x-2">
                  <span className="text-sm text-neutral-500">Filters</span>
                  <ChevronDownIcon className="w-4 h-4 mt-1 text-neutral-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent
                  className="DropdownMenuContent"
                  sideOffset={5}
                >
                  <DropdownMenuCheckboxItem
                    className="DropdownMenuCheckboxItem"
                    checked={yieldBearingChecked}
                    onCheckedChange={setYieldBearingChecked}
                  >
                    Yield-bearing only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="DropdownMenuCheckboxItem"
                    checked={lockedChecked}
                    onCheckedChange={setLockedChecked}
                  >
                    Locked only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="DropdownMenuCheckboxItem"
                    checked={boostedChecked}
                    onCheckedChange={setBoostedChecked}
                  >
                    Boosted only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="DropdownMenuCheckboxItem"
                    checked={nitroChecked}
                    onCheckedChange={setNitroChecked}
                  >
                    Nitro-staking only
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex space-x-3 p-4 m-3">
          <span className="text-neutral-500">Remaining available balance</span>
          <div className="flex flex-row space-x-1">
            <span className="dark:text-white">0</span>
            <span className="dark:text-white">xNEUTRO</span>
          </div>
        </div>

        <div className="border items-center py-2 px-3 border-neutral-200/80 dark:border-neutral-900/80 dark:bg-neutral-900/80 flex m-4">
          <div className="flex flex-row space-x-2">
            <WarningLogo className="w-5 h-5 text-amber-500 mt-0.5" />
            <span className="text-xs text-neutral-500 mt-1">
              Only yield farming rewards can be boosted. Nitro pools, Genesis
              pools, and swap fees APRs won&apos;t be affected by any
              YieldBooster allocation.
            </span>
          </div>
        </div>

        <div className="overflow-x-scroll m-4 mt-4 p-0">
          <Table
            //   data={allFarm}
            rowClassName={() => "cursor-pointer"}
            className="min-w-max"
            emptyText="Loading..."
            onRow={(rowData) => {
              // setIsOpen(true);
              // setSelectedRow(rowData);
            }}
          >
            <Table.Column
              prop="token"
              label="Token"
              // render={farmNameColumnHandler}
              width={280}
            />
            <Table.Column
              prop="amount"
              label="Amount"
              // render={(value) => <span>$ {currencyFormat(+value)}</span>}
            />
            <Table.Column
              prop="setttings"
              label="Settings"
              // render={(value) => (
              //   <span>{currencyFormat(Number(value.rps) * 86400)} NEUTRO</span>
              // )}
            />
            <Table.Column
              prop="apr"
              label={columnLabel}
              // render={(_value, rowData: MergedFarm | any) => (
              //   <span>{+rowData.details.apr} %</span>
              // )}
            />
            <Table.Column
              prop="boost"
              label={columnLabel1}
              // render={(value) => (
              //   <span>{currencyFormat(Number(value.rps) * 86400)} NEUTRO</span>
              // )}
            />
            <Table.Column
              prop="nothing"
              label=""
              // render={(value) => (
              //   <span>{currencyFormat(Number(value.rps) * 86400)} NEUTRO</span>
              // )}
            />
          </Table>
        </div>
      </div>
    </div>
  );
}
