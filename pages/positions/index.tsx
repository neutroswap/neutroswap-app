import Navbar from "@/components/modules/Navbar";
import { useState, useRef } from "react";
import { Button, Page, Text, Tabs, Card, Table } from "@geist-ui/core";
import ImportLogo from "@/public/logo/import.svg";
import CirclePlus from "@/public/logo/pluscircle.svg";
import Input from "@/components/elements/Input";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// const inter = Inter({ subsets: ['latin'] })

export default function Dividend() {
  const searchRef = useRef<any>(null);

  return (
    <div className="flex flex-col items-center sm:items-start justify-center sm:justify-between py-16">
      <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
        Positions
      </span>
      <div className="flex flex-col">
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Create and manage all your staking positions.
        </p>
      </div>
      <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />

      <Tabs initialValue="1" className="w-full">
        <Tabs.Item label="spNFTs" value="1">
          <Card className="-mt-3 overflow-x-auto w-full">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">spNFTs</span>
              <div className="flex">
                <button className="px-3 py-1 border rounded border-neutral-200 dark:border-neutral-800 mr-6 flex space-x-2">
                  <ImportLogo className="w-4 h-4 mt-[0.20rem]" />
                  <span className="text-black dark:text-white text-sm font-semibold">
                    Import token
                  </span>
                </button>
                <button className="px-3 py-2 border rounded bg-amber-500 border-neutral-200 dark:border-neutral-800 mr-6 flex space-x-2">
                  <CirclePlus className="w-4 h-4 mt-[0.15rem]" />
                  <span className="text-black dark:text-white text-sm font-semibold">
                    New position
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between space-x-4 w-full mt-7">
              <div className="flex flex-grow items-center">
                <Input
                  type="text"
                  //   ref={searchRef}
                  placeholder="Search"
                  // onChange={handleSearchAll}
                />
              </div>
            </div>
            <div className="overflow-x-scroll mt-8 p-0">
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
                  label="APR"
                  // render={(_value, rowData: MergedFarm | any) => (
                  //   <span>{+rowData.details.apr} %</span>
                  // )}
                />
                <Table.Column
                  prop="pending"
                  label="Pending Rewards"
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
          </Card>
        </Tabs.Item>

        <Tabs.Item label="LP v1" value="2">
          <Card className="-mt-3 overflow-x-auto w-full">
            <div className="flex items-center">
              <span className="text-2xl font-semibold">LP V1</span>
            </div>
          </Card>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}
