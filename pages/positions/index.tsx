import Navbar from "@/components/modules/Navbar";
import { useState, useRef } from "react";
import { Button, Page, Text, Tabs, Card, Table } from "@geist-ui/core";
import ImportLogo from "@/public/logo/import.svg";
import CirclePlus from "@/public/logo/pluscircle.svg";
import Input from "@/components/elements/Input";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TableColumnRender } from "@geist-ui/core/esm/table";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import NewPositionsModal from "@/components/modules/Modal/NewPositionsModal";
import ImportTokenModal from "@/components/modules/Modal/ImportTokenModal";
import SpNftModal from "@/components/modules/Modal/SpNftModal";
import TransferPositionModal from "@/components/modules/Modal/TransferPositionModal";
import SplitPositionModal from "@/components/modules/Modal/SplitPositionModal";
// const inter = Inter({ subsets: ['latin'] })

export default function Dividend() {
  const searchRef = useRef<any>(null);

  const [allPositions, setAllPositions] = useState<Array<User>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<User>();

  // const { data: userPositions, isLoading: isUserPositionsLoading, error: isUserPositionsError } = useUserPositions(address)

  type User = {
    name: string;
    token0Logo: string;
    token1Logo: string;
    totalStaked?: string;
    totalStakedInUsd?: string;
    pendingTokens?: string;
    pendingTokensInUsd?: string;
  };

  const tokenNameColumnHandler: TableColumnRender<User> = (
    value,
    rowData,
    index
  ) => {
    return (
      <div className="flex space-x-3 items-center my-5">
        <div className="flex -space-x-2 relative z-0">
          <img
            src={rowData.token0Logo}
            className="w-7 h-7 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
            onError={(e) => {
              handleImageFallback(rowData.token0Logo, e);
            }}
          />
          <img
            src={rowData.token1Logo}
            className="w-7 h-7 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
            onError={(e) => {
              handleImageFallback(rowData.token1Logo, e);
            }}
          />
        </div>
        <div className="space-x-1 font-semibold text-neutral-800 dark:text-neutral-200">
          <span>{rowData.name.split("-")[0]}</span>
          <span className="text-neutral-400 dark:text-neutral-600">-</span>
          <span>{rowData.name.split("-")[1]}</span>
        </div>
      </div>
    );
  };

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
                <ImportTokenModal />
                <SpNftModal />
                <TransferPositionModal />
                <SplitPositionModal />
                <NewPositionsModal />
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
            {/* {Boolean(allPositions.length) && ( */}
            <div className="overflow-x-scroll mt-8 p-0">
              <Table
                data={allPositions}
                rowClassName={() => "cursor-pointer"}
                className="min-w-max"
                emptyText="Loading..."
                onRow={(rowData) => {
                  setIsOpen(true);
                  setSelectedRow(rowData);
                }}
              >
                <Table.Column
                  prop="name"
                  label="Token"
                  render={tokenNameColumnHandler}
                  width={380}
                />
                <Table.Column
                  prop="amount"
                  label="Amount"
                  render={(value) => <span>$ {currencyFormat(+value)}</span>}
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
                  render={(_value, rowData: User | any) => (
                    <span>{+rowData.details.apr} %</span>
                  )}
                />
                <Table.Column
                  prop="pending"
                  label="Pending Rewards"
                  // render={(value) => (
                  //   <span>
                  //     {currencyFormat(Number(value.rps) * 86400)} NEUTRO
                  //   </span>
                  // )}
                />
                <Table.Column prop="nothing" label="" />
              </Table>
            </div>
            {/* )} */}
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
