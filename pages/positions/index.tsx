import Navbar from "@/components/modules/Navbar";
import { useState, useRef, useMemo } from "react";
import { Button, Page, Text, Tabs, Card, Table } from "@geist-ui/core";
import ImportLogo from "@/public/logo/import.svg";
import CirclePlus from "@/public/logo/pluscircle.svg";
import Input from "@/components/elements/Input";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TableColumnRender } from "@geist-ui/core/esm/table";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import NewPositionModal from "@/components/modules/Modal/NewPositionModal";
import ImportTokenModal from "@/components/modules/Modal/ImportTokenModal";
import SpNftModal from "@/components/modules/Modal/SpNftModal";
import {
  useQuery as useTanstackQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Client, cacheExchange, fetchExchange } from "urql";
import { useRouter } from "next/router";
import {
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { tokens } from "@/shared/statics/tokenList";
import {
  DEFAULT_CHAIN_ID,
  SupportedChainID,
  supportedChainID,
} from "@/shared/types/chain.types";
import { Token } from "@/shared/types/tokens.types";
import { FACTORY_CONTRACT } from "@/shared/helpers/contract";
import { NEUTRO_FACTORY_ABI } from "@/shared/abi";
import { ethers } from "ethers";
import { classNames } from "@/shared/helpers/classNamer";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";

export default function Positions() {
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
    <div className="flex flex-col items-center sm:items-start justify-between py-16">
      <div className="flex justify-between items-center w-full">
        <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
          Positions
        </span>
        <Modal>
          <ModalOpenButton>
            <Button className="!mt-2">Add Liquidity</Button>
          </ModalOpenButton>
          <ModalContents>
            {({ close }) => <AddLiquidityModal handleClose={close} />}
          </ModalContents>
        </Modal>
      </div>
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
                {/* <NewPositionModal /> */}
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

const AddLiquidityModal: React.FC<{ handleClose: () => void }> = ({
  handleClose,
}) => {
  const router = useRouter();
  const { chain } = useNetwork();

  // TODO: MOVE THIS HOOKS
  const chainSpecificTokens = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID];
    if (!supportedChainID.includes(chain.id.toString() as any))
      return tokens[DEFAULT_CHAIN_ID];
    return tokens[chain.id.toString() as SupportedChainID];
  }, [chain]);

  const [token0, setToken0] = useState<Token>(chainSpecificTokens[0]);
  const [token1, setToken1] = useState<Token>(chainSpecificTokens[1]);

  const {
    data: existingPool,
    isError,
    isLoading: isFetchingGetPair,
  } = useContractRead({
    address: FACTORY_CONTRACT,
    abi: NEUTRO_FACTORY_ABI,
    functionName: "getPair",
    args: [token0.address, token1.address],
  });

  const { config: createPairConfig } = usePrepareContractWrite({
    address: FACTORY_CONTRACT,
    abi: NEUTRO_FACTORY_ABI,
    functionName: "createPair",
    args: [token0.address, token1.address],
  });
  const { isLoading: isCreatingPair, write: createPair } = useContractWrite({
    ...createPairConfig,
    address: token1.address,
    onSuccess: async (result) => {
      const tx = await result.wait();
      const decodedResult = ethers.utils.defaultAbiCoder.decode(
        ["address", "uint256"],
        tx.logs[0].data
      );
      router.push(`/pool/${decodedResult[0]}`);
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-black dark:text-white mb-8">
        <div>
          <p className="text-left text-xl font-semibold m-0">Add Liquidity</p>
          <p className="text-sm m-0 opacity-50">
            Select token pair to add liquidty
          </p>
        </div>
        <button type="button" onClick={handleClose}>
          <XCircleIcon className="h-6 w-6 text-cool-gray-500 hover:text-cool-gray-400 opacity-30" />
        </button>
      </div>

      <TokenPicker
        selectedToken={token0}
        setSelectedToken={setToken0}
        disabledToken={token1}
      >
        {({ selectedToken }) => (
          <div
            className={classNames(
              "py-1 px-4 rounded-2xl rounded-b-none cursor-pointer transition-colors group",
              "bg-neutral-100 dark:bg-neutral-900",
              "hover:bg-neutral-200/75 hover:dark:bg-neutral-800/60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-600">
                  1
                </p>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={selectedToken.logo}
                  className="h-7 mr-2 rounded-full"
                  onError={(event) => {
                    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${selectedToken.symbol}`;
                  }}
                />
                <span className="text-sm font-semibold text-black dark:text-white">
                  {selectedToken.symbol}
                </span>
              </div>
              <ChevronRightIcon className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-all text-black dark:text-white" />
            </div>
          </div>
        )}
      </TokenPicker>
      <TokenPicker
        selectedToken={token1}
        setSelectedToken={setToken1}
        disabledToken={token0}
      >
        {({ selectedToken }) => (
          <div
            className={classNames(
              "py-1 px-4 rounded-2xl rounded-t-none cursor-pointer transition-colors group",
              "bg-neutral-100 dark:bg-neutral-900",
              "hover:bg-neutral-200/75 hover:dark:bg-neutral-800/60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-600">
                  2
                </p>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={selectedToken.logo}
                  className="h-7 mr-2 rounded-full"
                  onError={(event) => {
                    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${selectedToken.symbol}`;
                  }}
                />
                <span className="text-sm font-semibold text-black dark:text-white">
                  {selectedToken.symbol}
                </span>
              </div>
              <ChevronRightIcon className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-all text-black dark:text-white" />
            </div>
          </div>
        )}
      </TokenPicker>
      {(!existingPool ||
        existingPool !== "0x0000000000000000000000000000000000000000") && (
        <Button
          scale={1.25}
          className={classNames(
            "!w-full !mt-4 !bg-transparent !rounded-lg",
            "!border-neutral-300 dark:!border-neutral-700",
            "hover:!border-neutral-400 dark:hover:!border-neutral-600",
            "focus:!border-neutral-400 dark:focus:!border-neutral-600",
            "focus:hover:!border-neutral-400 dark:focus:hover:!border-neutral-600",
            "disabled:opacity-50 disabled:hover:!border-neutral-300 disabled:dark:hover:!border-neutral-700"
          )}
          disabled={isError}
          loading={isFetchingGetPair}
          onClick={() => router.push(`/pool/${existingPool}`)}
        >
          <span>Enter pool</span>
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Button>
      )}
      {existingPool === "0x0000000000000000000000000000000000000000" && (
        <div>
          <Button
            scale={1.25}
            className={classNames(
              "!w-full !mt-4 !bg-transparent !rounded-lg",
              "!border-neutral-300 dark:!border-neutral-700",
              "hover:!border-neutral-400 dark:hover:!border-neutral-600",
              "focus:!border-neutral-400 dark:focus:!border-neutral-600",
              "focus:hover:!border-neutral-400 dark:focus:hover:!border-neutral-600",
              "disabled:opacity-50 disabled:hover:!border-neutral-300 disabled:dark:hover:!border-neutral-700"
            )}
            disabled={!createPair}
            loading={isCreatingPair}
            onClick={() => createPair?.()}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>Start adding liquidity</span>
          </Button>
          <p className="max-w-3xl mx-auto text-sm text-neutral-400 dark:text-neutral-600 text-center">
            No pool found! But, you can create it now and start providing
            liquidity.
          </p>
        </div>
      )}
    </div>
  );
};
