// import { Inter } from 'next/font/google'
import { Button, Input, Loading, Modal, Page, Table, Tabs, Text, useModal } from "@geist-ui/core";
import WalletIcon from "@/public/icons/wallet.svg";
import { Disclosure, RadioGroup } from "@headlessui/react";
import {
  ChevronUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { ChangeEvent, Fragment, useEffect, useRef, useState } from "react";
import { BigNumber } from "ethers";
import { classNames } from "@/shared/helpers/classNamer";
import NumberInput from "@/components/elements/NumberInput";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import {
  NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_FARM_CONTRACT,
} from "@/shared/helpers/constants";
import { ERC20_ABI, NEUTRO_FARM_ABI } from "@/shared/abi";
import { formatEther, parseEther, parseUnits } from "ethers/lib/utils.js";
import debounce from "lodash/debounce";
import { parseBigNumber } from "@/shared/helpers/parseBigNumber";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import useFarmList, { AvailableFarm } from "@/shared/hooks/fetcher/farms/useFarmList";
import useUserFarms, { OwnedFarm } from "@/shared/hooks/fetcher/farms/useUserFarms";
import { Farm } from "@/shared/types/farm.types";
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import { TableColumnRender } from "@geist-ui/core/esm/table";
import OffloadedModal from "@/components/modules/OffloadedModal";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import JsonSearch from "search-array";

import LeafIcon from "@/public/icons/leaf.svg"

// const inter = Inter({ subsets: ['latin'] })

const TABS = ["All Farms", "My Farms"];

type MergedFarm = Farm & {
  details: {
    totalStaked?: string;
    totalStakedInUsd?: string;
    pendingTokens?: string;
    pendingTokensInUsd?: string;
    totalLiquidity: string;
    apr: string;
    rps: string;
  };
}

export default function FarmPage() {
  const { address } = useAccount();
  const searchRef = useRef<any>(null);

  // const [farms, setFarms] = useState<any>([]);
  // const [userFarms, setUserFarms] = useState<any>([]);
  // const [tvl, setTvl] = useState<string>("");
  // const [totalStaked, setTotalStaked] = useState<string>("");
  // const [pendingReward, setPendingReward] = useState<string>("");

  const [query, setQuery] = useState<string>('');
  const [data, setData] = useState<Array<MergedFarm>>([]);
  const [mergedData, setMergedData] = useState<Array<MergedFarm>>([]);
  const [selectedRow, setSelectedRow] = useState<MergedFarm>();

  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const { data: farms, isLoading: isFarmsLoading, error: isFarmsError } = useFarmList()
  const { data: userFarms, isLoading: isUserFarmsLoading, error: isUserFarmsError } = useUserFarms(address)

  // useEffect(() => {
  //   async function loadListFarm() {
  //     const response = await fetch("/api/getListFarm");
  //     const fetched = await response.json();
  //     const tvl = fetched.data.tvl as string;
  //     const data = fetched.data.farms.map((details: any) => ({
  //       name: details.name,
  //       totalLiq: details.details.totalLiquidity,
  //       totalLiqInUsd: details.valueOfLiquidity,
  //       rps: details.details.rps,
  //       apr: details.details.apr,
  //       pid: details.pid,
  //       logo0: details.token0Logo,
  //       logo1: details.token1Logo,
  //       lpToken: details.lpToken,
  //     }));
  //     setFarms(data);
  //     setTvl(tvl);
  //   }
  //   loadListFarm();
  // }, []);

  // useEffect(() => {
  //   async function loadUserFarm() {
  //     const response = await fetch(`/api/getUserFarm?userAddress=${address}`);
  //     // const response = await fetch(
  //     //   `/api/getUserFarm?userAddress=0x222Da5f13D800Ff94947C20e8714E103822Ff716`,
  //     //   {
  //     const fetched = await response.json();
  //     const totalStaked = fetched.data.holdings as string;
  //     const pendingReward = fetched.data.totalPendingTokenInUsd as string;
  //     const data = fetched.data.farms.map((details: any) => ({
  //       name: details.name,
  //       staked: details.details.totalStaked,
  //       reward: details.details.pendingTokens,
  //       stakedInUsd: details.details.totalStakedInUsd,
  //     }));
  //     setUserFarms(data);
  //     setTotalStaked(totalStaked);
  //     setPendingReward(pendingReward);
  //   }
  //   loadUserFarm();
  // }, [address]);

  useEffect(() => {
    function combineData() {
      if (!farms) return;
      if (!userFarms) return;
      // console.log('farms', farms);
      // console.log('userFarms', userFarms);
      const combinedData = farms.farms.map((farm: AvailableFarm) => {
        const userExactFarm = userFarms.farms.find((userFarm: any) => farm.name === userFarm.name)
        const temp = Object.assign({}, farm, userExactFarm);
        const farmDetails = { ...farm.details, ...userExactFarm?.details }
        return { ...temp, details: farmDetails }
      });
      // console.log('combinedData', combinedData);
      setMergedData(combinedData);
      setData(combinedData);
    }
    combineData();
  }, [farms, userFarms]);

  // Problem fetching all the farms PID
  const { config: harvestMany } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
    functionName: "harvestMany",
    args: [[BigNumber.from(0), BigNumber.from(2)]],
  });

  const { write: harvestAll } = useContractWrite(harvestMany);

  const resetMergedData = () => {
    setQuery('');
    setData(mergedData);
    searchRef.current.value = "";
  }

  const handleSearch = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true);

    if (!Boolean(e.target.value)) {
      resetMergedData();
      return setIsSearching(false);
    };

    setQuery(e.target.value);
    // farm data lookup based on e.target.value
    const fullTextSearch = new JsonSearch(mergedData);
    const results: MergedFarm[] = fullTextSearch.query(e.target.value)
    setData(results);
    return setIsSearching(false);
  })

  const farmNameColumnHandler: TableColumnRender<MergedFarm> = (value, rowData, index) => {
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
          <span>{rowData.name.split('-')[0]}</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span>{rowData.name.split('-')[1]}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-5xl mx-auto py-10">
      <div>
        <div className="flex items-center space-x-4 -ml-10">
          <LeafIcon className="w-10 h-10 text-neutral-700 dark:text-neutral-300 mt-1" />
          <p className="m-0 text-center text-4xl font-semibold">
            Yield Farming
          </p>
        </div>
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Earn yield by staking your LP Tokens
        </p>
      </div>

      <div className="flex w-full mt-5 mb-10 box-border">
        <div className="w-full px-10 py-7 rounded-l-xl border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-500">Total Value Locked</div>
          <div className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 font-bold">$ {currencyFormat(+farms?.tvl!)}</div>
        </div>
        <div className="w-full px-10 py-7 border-t border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-500">Your Staked Assets</div>
          <div className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 font-bold">$ {currencyFormat(+userFarms?.holdings!)}</div>
        </div>
        <div className="w-full px-10 py-7 rounded-r-xl border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-500">Unclaimed Rewards</div>
          <div className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 font-bold">$ {currencyFormat(+userFarms?.totalPendingTokenInUsd!)}</div>
        </div>
      </div>

      <div className="relative flex w-full justify-between mb-4">
        <Tabs
          initialValue="1"
          className="w-full"
          hideDivider
          hideBorder
          activeClassName="font-semibold"
        >
          <Tabs.Item label="All Farms" value="1">
            {!Boolean(data.length) && (
              <div className="my-5">
                <Loading spaceRatio={2.5} />
              </div>
            )}
            {Boolean(data.length) && (
              <Table
                data={data}
                rowClassName={() => "cursor-pointer"}
                emptyText="Loading..."
                onRow={(rowData) => {
                  setIsOpen(true);
                  setSelectedRow(rowData);
                }}
              >
                <Table.Column
                  prop="name"
                  label="farm"
                  render={farmNameColumnHandler}
                  width={280}
                />
                <Table.Column
                  prop="valueOfLiquidity"
                  label="TVL"
                  render={(value) => <span>$ {currencyFormat(+value)}</span>}
                />
                <Table.Column
                  prop="details"
                  label="Rewards 24h"
                  render={(value) => <span>{currencyFormat(Number(value.rps) * 86400)} NEUTRO</span>}
                />
                <Table.Column
                  prop="apr"
                  label="APR"
                  render={(_value, rowData: MergedFarm | any) => <span>{currencyFormat(+rowData.details.apr)} %</span>}
                />
                <Table.Column
                  prop="apr"
                  label="APR"
                  render={(value, rowData: MergedFarm | any) => <span>{currencyFormat(+rowData.details.apr)} %</span>}
                />
              </Table>
            )}
          </Tabs.Item>
          <Tabs.Item label="My Farms" value="2" disabled>
          </Tabs.Item>
        </Tabs>
        <div className="absolute top-0 right-0 flex items-center space-x-4">
          <div className="flex items-center bg-neutral-50 dark:bg-neutral-900/80 rounded-lg px-2 border border-neutral-200/80 dark:border-transparent">
            <input
              type="text"
              ref={searchRef}
              placeholder="Search by farm, name, symbol or address"
              className="bg-transparent p-2 rounded-md w-full placeholder-neutral-400 dark:placeholder-neutral-600 text-sm"
              onChange={handleSearch}
            />
            {!query && <MagnifyingGlassIcon className="flex inset-0 h-6 text-neutral-400" />}
            {query && (
              <button
                onClick={() => resetMergedData()}
                className="flex items-center inset-0 p-1 text-neutral-500 text-xs font-semibold uppercase hover:scale-105 transition"
              >
                clear
              </button>
            )}
          </div>
          <Button
            auto
            scale={0.8}
            onClick={() => harvestAll?.()}
            className={classNames(
              "!flex !items-center !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
              "text-white dark:text-amber-600",
              "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
              "!border !border-orange-600/50 dark:border-orange-400/[.12]"
            )}
          >
            Harvest All
          </Button>
        </div>
      </div>

      <OffloadedModal
        isOpen={isOpen}
        onClose={() => {
          setSelectedRow(undefined);
          setIsOpen(false)
        }}>
        {selectedRow && <FarmRow selectedRow={selectedRow} />}
      </OffloadedModal>
    </div>
  );
}

const FarmRow = ({ selectedRow }: { selectedRow: MergedFarm }) => {
  const { address, isConnected } = useAccount();

  const [isLpTokenApproved, setIsLpTokenApproved] = useState(false);

  const [stakeAmount, setStakeAmount] = useState<string>();
  const [unstakeAmount, setUnstakeAmount] = useState<string>();

  const { data: lpTokenBalance } = useContractRead({
    address: selectedRow.lpToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const handleStakeAmountChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setStakeAmount(value);
    // debouncedStakeAmount(value);
  };

  // const debouncedStakeAmount = debounce(async (nextValue) => {
  // }, 500);

  const handleUnstakeAmountChange = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setUnstakeAmount(value);
    // debouncedUnstakeAmount(value);
  };

  // const debouncedUnstakeAmount = debounce(async (nextValue) => {
  //   console.log("Called");
  // }, 500);

  const { refetch: refetchAllowance } = useContractRead({
    address: selectedRow.lpToken,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address!, NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`],
    onSuccess(value) {
      setIsLpTokenApproved(+formatEther(value) > 0);
    },
  });

  const { config: approveLpTokenConfig } = usePrepareContractWrite({
    address: selectedRow.lpToken,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
      BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { isLoading: isApprovingLpToken, write: approveLpToken } =
    useContractWrite({
      ...approveLpTokenConfig,
      onSuccess: async (result) => {
        result.wait().then((receipt) => console.log(receipt));
        await refetchAllowance();
      },
    });

  const { config: stakeConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
    functionName: "deposit",
    args: [BigNumber.from(selectedRow.pid), parseBigNumber(stakeAmount!)],
    onError(error) {
      console.log("Error", error);
    },
  });

  const { write: stake } = useContractWrite({
    ...stakeConfig,
    onError(error) {
      console.log("Error", error);
    },
  });

  const { config: withdraw } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    functionName: "withdraw",
    args: [BigNumber.from(selectedRow.pid), parseBigNumber(unstakeAmount!)],
  });

  const { write: unstake } = useContractWrite(withdraw);

  const { config: harvestConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
    functionName: "deposit",
    args: [BigNumber.from(selectedRow.pid), BigNumber.from(0)],
  });
  const { write: harvest } = useContractWrite(harvestConfig);

  return (
    <div className="flex flex-col w-full">
      <div className="flex space-x-3 items-center">
        <div className="flex -space-x-2 relative z-0">
          <img
            src={selectedRow.token0Logo}
            className="w-7 h-7 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
            onError={(e) => {
              handleImageFallback(selectedRow.token0Logo, e);
            }}
          />
          <img
            src={selectedRow.token1Logo}
            className="w-7 h-7 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
            onError={(e) => {
              handleImageFallback(selectedRow.token1Logo, e);
            }}
          />
        </div>
        <div className="space-x-1 font-semibold text-neutral-800 dark:text-neutral-200 text-lg">
          <span>{selectedRow.name.split('-')[0]}</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span>{selectedRow.name.split('-')[1]}</span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full mt-10">
        <div className="space-y-1 mb-5">
          <span className="text-xs font-bold uppercase text-neutral-500">Earned Rewards</span>
          <div className="flex space-x-2 items-end justify-center text-3xl">
            <span className="font-bold text-black dark:text-white">{parseFloat(selectedRow.reward).toFixed(6)}</span>
            <span className="text-base text-neutral-500">$NEUTRO</span>
          </div>
        </div>
        <Button
          auto
          disabled={!harvest}
          onClick={() => {
            harvest?.();
          }}
          iconRight={<BanknotesIcon className="w-4 h-4 opacity-90" />}
          className={classNames(
            "border-neutral-300 dark:border-neutral-800 hover:border-neutral-700 bg-transparent",
          )}
        >
          Harvest
        </Button>
      </div>

      <Tabs
        initialValue="1"
        className="w-full mt-6"
        activeClassName="font-semibold"
      >
        <Tabs.Item label="Add" value="1">
          <div className="flex flex-col justify-between w-full space-y-2.5 mt-1">
            <div className="flex justify-between items-center bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
              <input
                value={stakeAmount}
                onChange={handleStakeAmountChange}
                placeholder="0.0"
                className="bg-transparent !px-4 !py-3 !rounded-lg !box-border"
              ></input>
              <div
                className="mr-3 text-sm text-amber-600 cursor-pointer"
                onClick={() => setStakeAmount(formatEther(lpTokenBalance!))}
              >
                MAX
              </div>
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <div className="text-xs font-bold uppercase">Available:</div>
              <div className="text-sm space-x-2">
                <span>{!!lpTokenBalance && Number(formatEther(lpTokenBalance)).toFixed(10)}{" "} LP</span>
              </div>
            </div>
            {!isLpTokenApproved && (
              <Button
                disabled={!approveLpToken}
                onClick={() => approveLpToken?.()}
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                  "text-white dark:text-amber-600",
                  "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Approve LP Tokens
              </Button>
            )}
            {isLpTokenApproved && (
              <Button
                disabled={!stake}
                onClick={() => stake?.()}
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                  "text-white dark:text-amber-600",
                  "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Stake LP Tokens
              </Button>
            )}
          </div>
        </Tabs.Item>
        <Tabs.Item label="Remove" value="2">
          <div className="flex flex-col justify-between w-full space-y-2.5 mt-1">
            <div className="flex justify-between items-center bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
              <input
                value={unstakeAmount}
                onChange={handleUnstakeAmountChange}
                placeholder="0.0"
                className="bg-transparent !px-4 !py-3 !rounded-lg !box-border"
              ></input>
              <div
                className="mr-3 text-sm text-amber-600 cursor-pointer"
                onClick={() => setUnstakeAmount(selectedRow.details.totalStaked)}
              >
                MAX
              </div>
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <div className="text-xs font-bold uppercase">Deposited</div>
              <div className="text-sm space-x-2">
                <span>{parseFloat(selectedRow.details.totalStaked!).toFixed(10)} LP</span>
                <span className="font-semibold">~ ${Number(selectedRow.details.totalStakedInUsd).toFixed(2)}</span>
              </div>
            </div>
            <Button
              disabled={!unstake}
              onClick={() => {
                unstake?.();
              }}
              className={classNames(
                "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                "text-white dark:text-amber-600",
                "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Unstake LP Tokens
            </Button>
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
};
