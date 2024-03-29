// import { Inter } from 'next/font/google'
import {
  Button,
  Code,
  Input,
  Loading,
  Modal,
  Page,
  Spinner,
  Table,
  Tabs,
  Text,
  useModal,
  useTheme,
} from "@geist-ui/core";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { BigNumber } from "ethers";
import { classNames } from "@/shared/helpers/classNamer";
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
import { formatEther, parseUnits } from "viem";
import debounce from "lodash/debounce";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import useFarmList, {
  AvailableFarm,
} from "@/shared/hooks/fetcher/farms/useFarmList";
import useUserFarms, {
  OwnedFarm,
} from "@/shared/hooks/fetcher/farms/useUserFarms";
import { Farm } from "@/shared/types/farm.types";
import { currencyFormat } from "@/shared/utils";
import { TableColumnRender } from "@geist-ui/core/esm/table";
import OffloadedModal from "@/components/modules/OffloadedModal";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import JsonSearch from "search-array";

import LeafIcon from "@/public/icons/leaf.svg";
import NoContentDark from "@/public/states/empty/dark.svg";
import NoContentLight from "@/public/states/empty/light.svg";
import { ThemeType } from "@/shared/hooks/usePrefers";
import { waitForTransaction } from "@wagmi/core";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/elements/Alert";
import { Warning } from "@phosphor-icons/react";
import Link from "next/link";

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
};

export default function FarmPage() {
  const theme = useTheme();
  const { address } = useAccount();
  const searchRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState("2");
  const [query, setQuery] = useState<string>("");
  const [allFarm, setAllFarm] = useState<Array<MergedFarm>>([]);
  const [ownedFarm, setOwnedFarm] = useState<Array<OwnedFarm>>([]);
  const [mergedData, setMergedData] = useState<Array<MergedFarm>>([]);
  const [selectedRow, setSelectedRow] = useState<MergedFarm>();

  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const {
    data: farms,
    isLoading: isFarmsLoading,
    error: isFarmsError,
  } = useFarmList();
  const {
    data: userFarms,
    isLoading: isUserFarmsLoading,
    error: isUserFarmsError,
  } = useUserFarms(address);

  useEffect(() => {
    function combineData() {
      if (!farms) return;
      if (!userFarms) return;
      const combinedData = farms.farms.map((farm: AvailableFarm) => {
        const userExactFarm = userFarms.farms.find(
          (userFarm: any) => farm.name === userFarm.name
        );
        const temp = Object.assign({}, farm, userExactFarm);
        const farmDetails = { ...farm.details, ...userExactFarm?.details };
        return { ...temp, details: farmDetails };
      });
      setMergedData(combinedData);
      // Sort the pools array
      combinedData.sort((a, b) => {
        // Check if name contains 'Deprecated'
        const aIsDeprecated = a.name.includes("Deprecated");
        const bIsDeprecated = b.name.includes("Deprecated");

        if (!aIsDeprecated && bIsDeprecated) {
          // a should come before b
          return -1;
        } else if (aIsDeprecated && !bIsDeprecated) {
          // a should come after b
          return 1;
        }

        // If both have 'Deprecated' or neither, maintain original order
        return 0;
      });
      setAllFarm(combinedData);
      setOwnedFarm(userFarms.farms);
    }
    combineData();
  }, [farms, userFarms]);

  // Problem fetching all the farms PID
  const { config: harvestMany } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
    functionName: "harvestMany",
    args: [mergedData.map((item) => BigInt(item.pid))],
  });

  const { write: harvestAll, isLoading: isHarvestingAll } = useContractWrite({
    ...harvestMany,
    onSuccess: async (result) => {
      await waitForTransaction({ hash: result.hash });
    },
  });

  const resetAllFarm = () => {
    setQuery("");
    setAllFarm(mergedData);
    searchRef.current.value = "";
  };

  const resetOwnedFarm = () => {
    if (!userFarms) throw new Error("No user farms data");
    setQuery("");
    setOwnedFarm(userFarms.farms);
    searchRef.current.value = "";
  };

  const handleSearchAll = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true);
    if (!Boolean(e.target.value)) {
      resetAllFarm();
      return setIsSearching(false);
    }
    setQuery(e.target.value);
    // farm data lookup based on e.target.value
    const fullTextSearch = new JsonSearch(mergedData);
    const results: MergedFarm[] = fullTextSearch.query(e.target.value);
    setAllFarm(results);
    return setIsSearching(false);
  });

  const handleSearchOwnedFarm = debounce(
    async (e: ChangeEvent<HTMLInputElement>) => {
      setIsSearching(true);
      if (!Boolean(e.target.value)) {
        resetOwnedFarm();
        return setIsSearching(false);
      }
      setQuery(e.target.value);
      // farm data lookup based on e.target.value
      const fullTextSearch = new JsonSearch(userFarms?.farms);
      const results: OwnedFarm[] = fullTextSearch.query(e.target.value);
      setOwnedFarm(results);
      return setIsSearching(false);
    }
  );

  const farmNameColumnHandler: TableColumnRender<MergedFarm> = (
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
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span>{rowData.name.split("-")[1]}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-5xl mx-auto py-16">
      <div>
        <div className="flex justify-center items-center space-x-3">
          <LeafIcon className="w-7 h-7 md:w-8 md:h-8 text-primary mt-1" />
          <p className="m-0 text-center text-3xl md:text-4xl font-semibold">
            Yield Farming
          </p>
        </div>
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Earn yield by staking your LP Tokens
        </p>
        <Alert variant="warning" className="mt-5 max-w-xl">
          <Warning className="h-5 w-5" />
          <AlertTitle>V1 Farm has been deprecated.</AlertTitle>
          <AlertDescription>
            Please harvest all of your rewards, withdraw your deposited LP
            Tokens, and wrap it into an spNFT to continue farming.{" "}
            <Link
              href="https://docs.neutroswap.io/neutroswap-v2/staked-positions-spnfts"
              target="_blank"
              className=" hover:text-blue-700 active:text-blue-500"
            >
              Learn more
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 my-10 box-border">
        <div className="w-full px-1 py-3 md:px-10 md:py-7 rounded-l-xl md:border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-500">
            Farm Total Value Locked
          </div>
          {!isUserFarmsLoading && !isFarmsLoading && (
            <div className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-semibold">
              ${currencyFormat(+farms?.tvl!)}
            </div>
          )}
          {isUserFarmsLoading && isFarmsLoading && <Spinner className="mt-5" />}
        </div>
        <div className="w-full px-1 py-3 md:px-10 md:py-7 md:border-t md:border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-500">
            Your Staked Assets
          </div>
          {!isUserFarmsLoading && !isFarmsLoading && (
            <div className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-semibold">
              ${currencyFormat(+userFarms?.holdings!)}
            </div>
          )}
          {isUserFarmsLoading && isFarmsLoading && <Spinner className="mt-5" />}
        </div>
        <div className="w-full px-1 py-3 md:px-10 md:py-7 rounded-r-xl md:border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-500">
            Unclaimed Rewards
          </div>
          {!isUserFarmsLoading && !isFarmsLoading && (
            <div className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-semibold">
              ${currencyFormat(+userFarms?.totalPendingTokenInUsd!)}
            </div>
          )}
          {isUserFarmsLoading && isFarmsLoading && <Spinner className="mt-5" />}
        </div>
      </div>

      <div className="relative flex w-full justify-between mb-4">
        <Tabs
          initialValue={activeTab}
          className="w-full"
          hideDivider
          hideBorder
          activeClassName="font-semibold"
          onChange={(value) => {
            setActiveTab(value);
            resetOwnedFarm();
            resetAllFarm();
          }}
        >
          <div className="flex items-center justify-between md:justify-end space-x-4 w-full mt-0 md:-mt-14 mb-4">
            <div className="flex w-full md:max-w-max items-center bg-neutral-50 dark:bg-neutral-900/80 rounded-lg px-2 border border-neutral-200/80 dark:border-transparent">
              {activeTab === "1" && (
                <input
                  type="text"
                  ref={searchRef}
                  placeholder="Search by farm, name, symbol or address"
                  className="bg-transparent p-2 rounded-md w-full placeholder-neutral-400 dark:placeholder-neutral-600 text-sm"
                  onChange={handleSearchAll}
                />
              )}

              {activeTab === "2" && (
                <input
                  type="text"
                  ref={searchRef}
                  placeholder="Search by farm, name, symbol or address"
                  className="bg-transparent p-2 rounded-md w-full placeholder-neutral-400 dark:placeholder-neutral-600 text-sm"
                  onChange={handleSearchOwnedFarm}
                />
              )}

              {!query && (
                <MagnifyingGlassIcon className="flex inset-0 h-6 text-neutral-400" />
              )}
              {query && (
                <button
                  onClick={() => resetAllFarm()}
                  className="flex items-center inset-0 p-1 text-neutral-500 text-xs font-semibold uppercase hover:scale-105 transition"
                >
                  clear
                </button>
              )}
            </div>
            <Button
              auto
              scale={0.8}
              disabled={!harvestAll}
              loading={isHarvestingAll}
              onClick={() => harvestAll?.()}
              className={classNames(
                "!flex !items-center !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                "text-white dark:text-primary",
                "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50"
              )}
            >
              Harvest All
            </Button>
          </div>
          <Tabs.Item label="All Farms" value="1" disabled={true}>
            {!Boolean(allFarm.length) &&
              !(isFarmsLoading || isUserFarmsLoading || isSearching) && (
                <div className="flex flex-col items-center w-full p-8 border-2 border-dashed border-neutral-200/60 dark:border-neutral-900 rounded-xl box-border">
                  {(theme.type as ThemeType) === "nlight" && (
                    <NoContentLight className="w-40 h-40 opacity-75" />
                  )}
                  {(theme.type as ThemeType) === "ndark" && (
                    <NoContentDark className="w-40 h-40 opacity-75" />
                  )}
                  <p className="text-neutral-500 w-3/4 text-center">
                    No farms with <Code>{query}</Code> found. Try to use search
                    with contract address instead of token name.
                  </p>
                </div>
              )}
            {(isFarmsLoading || isUserFarmsLoading || isSearching) && (
              <div className="my-5">
                <Loading spaceRatio={2.5} />
              </div>
            )}
            {Boolean(allFarm.length) && (
              <div className="overflow-x-scroll">
                <Table
                  data={allFarm}
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
                    render={(value) => (
                      <span>
                        {currencyFormat(Number(value.rps) * 86400)} NEUTRO
                      </span>
                    )}
                  />
                  <Table.Column
                    prop="apr"
                    label="APR"
                    render={(_value, rowData: MergedFarm | any) => (
                      <span>{+rowData.details.apr} %</span>
                    )}
                  />
                </Table>
              </div>
            )}
          </Tabs.Item>
          <Tabs.Item label="My Farms" value="2">
            {!Boolean(ownedFarm.length) &&
              !(isUserFarmsLoading || isSearching) && (
                <div className="flex flex-col items-center w-full p-8 border-2 border-dashed border-neutral-200/60 dark:border-neutral-900 rounded-xl box-border">
                  {(theme.type as ThemeType) === "nlight" && (
                    <NoContentLight className="w-40 h-40 opacity-75" />
                  )}
                  {(theme.type as ThemeType) === "ndark" && (
                    <NoContentDark className="w-40 h-40 opacity-75" />
                  )}
                  <p className="text-neutral-500 w-3/4 text-center">
                    {!!query && (
                      <span>
                        No farms with <Code>{query}</Code> found. Try to use
                        search with contract address instead of token name.
                      </span>
                    )}
                    {!query && (
                      <span>No owned farm found, add LP to start farming.</span>
                    )}
                  </p>
                </div>
              )}
            {(isUserFarmsLoading || isSearching) && (
              <div className="my-5">
                <Loading spaceRatio={2.5} />
              </div>
            )}
            {!!Boolean(ownedFarm.length) && (
              <div className="overflow-x-scroll">
                <Table
                  data={ownedFarm}
                  rowClassName={() => "cursor-pointer"}
                  className="min-w-max"
                  emptyText="Loading..."
                  onRow={(rowData) => {
                    setIsOpen(true);
                    setSelectedRow(rowData as any);
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
                    prop="pending"
                    label="Total Staked"
                    render={(_value, rowData: any) => (
                      <span>
                        {Number(rowData.details.totalStaked).toFixed(8)} LP
                      </span>
                    )}
                  />
                  <Table.Column
                    prop="details"
                    label="Pending Reward"
                    render={(_value, rowData) => (
                      <span>
                        {currencyFormat(Number(rowData.details.pendingTokens))}{" "}
                        NEUTRO
                      </span>
                    )}
                  />
                </Table>
              </div>
            )}
          </Tabs.Item>
        </Tabs>
      </div>

      <OffloadedModal
        isOpen={isOpen}
        onClose={() => {
          setSelectedRow(undefined);
          setIsOpen(false);
        }}
      >
        {selectedRow && <FarmRow selectedRow={selectedRow} />}
      </OffloadedModal>
    </div>
  );
}

const FarmRow = ({ selectedRow }: { selectedRow: MergedFarm }) => {
  const { address, isConnected } = useAccount();

  const [isLpTokenApproved, setIsLpTokenApproved] = useState(false);

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

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
  };

  const { refetch: refetchAllowance } = useContractRead({
    enabled: Boolean(lpTokenBalance),
    address: selectedRow.lpToken,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address!, NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`],
    onSuccess(value) {
      setIsLpTokenApproved(
        +formatEther(value) >= +formatEther(lpTokenBalance!)
      );
    },
  });

  const { config: approveLpTokenConfig } = usePrepareContractWrite({
    address: selectedRow.lpToken,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { isLoading: isApprovingLpToken, write: approveLpToken } =
    useContractWrite({
      ...approveLpTokenConfig,
      onSuccess: async (result) => {
        await waitForTransaction({ hash: result.hash });
        await refetchAllowance();
      },
    });

  const { config: stakeConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
    functionName: "deposit",
    args: [BigInt(selectedRow.pid), parseUnits(stakeAmount!, 18)],
    onError(error) {
      console.log("Error", error);
    },
  });

  const { write: stake, isLoading: isStaking } = useContractWrite({
    ...stakeConfig,
    onSuccess: async (result) => {
      await waitForTransaction({ hash: result.hash });
    },
  });

  const { config: unstakeConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    functionName: "withdraw",
    args: [BigInt(selectedRow.pid), parseUnits(unstakeAmount!, 18)],
  });

  const { write: unstake, isLoading: isUnstaking } = useContractWrite({
    ...unstakeConfig,
    onSuccess: async (result) => {
      await waitForTransaction({ hash: result.hash, confirmations: 8 });
    },
  });

  const { config: harvestConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    functionName: "deposit",
    args: [BigInt(selectedRow.pid), BigInt(0)],
  });
  const { write: harvest, isLoading: isHarvesting } = useContractWrite({
    ...harvestConfig,
    onSuccess: async (result) => {
      await waitForTransaction({ hash: result.hash, confirmations: 8 });
    },
  });

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
          <span>{selectedRow.name.split("-")[0]}</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span>{selectedRow.name.split("-")[1]}</span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full mt-10">
        <div className="space-y-1 mb-5 text-left">
          <span className="text-xs font-bold uppercase text-neutral-500">
            Earned Rewards
          </span>
          <div className="flex space-x-2 items-end justify-center text-3xl">
            <span className="font-bold text-black dark:text-white">
              {parseFloat(selectedRow.details.pendingTokens ?? "0").toFixed(2)}
            </span>
            <span className="text-base text-neutral-500">$NEUTRO</span>
          </div>
        </div>
        <Button
          auto
          disabled={!harvest}
          onClick={() => harvest?.()}
          loading={isHarvesting}
          iconRight={
            <BanknotesIcon className="w-4 h-4 opacity-90 text-white dark:text-primary " />
          }
          className={classNames(
            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
            "text-white dark:text-primary",
            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
            "disabled:opacity-50"
          )}
        >
          Harvest
        </Button>
      </div>

      <Tabs
        initialValue="2"
        className="w-full mt-6"
        activeClassName="font-semibold"
      >
        <Tabs.Item label="Add" value="1" disabled={true}>
          <div className="flex flex-col justify-between w-full space-y-2.5 mt-1">
            <div className="flex justify-between items-center bg-neutral-200/50 dark:bg-neutral-900/50 rounded-lg">
              <input
                value={stakeAmount}
                onChange={handleStakeAmountChange}
                placeholder="0.0"
                className="bg-transparent text-black dark:text-white !px-4 !py-3 !rounded-lg !box-border"
              ></input>
              <div
                className="mr-3 text-sm text-primary cursor-pointer font-semibold"
                onClick={() => setStakeAmount(formatEther(lpTokenBalance!))}
              >
                MAX
              </div>
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <div className="text-xs font-bold uppercase">Available:</div>
              <div className="text-sm space-x-2">
                <span>
                  {!!lpTokenBalance &&
                    Number(formatEther(lpTokenBalance)).toFixed(10)}{" "}
                  LP
                </span>
              </div>
            </div>
            {!isLpTokenApproved && (
              <Button
                disabled={!approveLpToken}
                loading={isApprovingLpToken}
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
                loading={isStaking}
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
            <div className="flex justify-between items-center bg-neutral-200/50 dark:bg-neutral-900/50 rounded-lg">
              <input
                value={unstakeAmount}
                onChange={handleUnstakeAmountChange}
                placeholder="0.0"
                className="bg-transparent text-black dark:text-white !px-4 !py-3 !rounded-lg !box-border"
              ></input>
              <div
                className="mr-3 text-sm text-primary cursor-pointer font-semibold"
                onClick={() =>
                  setUnstakeAmount(selectedRow.details.totalStaked ?? "0")
                }
              >
                MAX
              </div>
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <div className="text-xs font-bold uppercase">Deposited:</div>
              <div className="text-sm space-x-2">
                <span>
                  {!selectedRow.details.totalStaked
                    ? "0.00"
                    : parseFloat(selectedRow.details.totalStaked!).toFixed(
                        10
                      )}{" "}
                  LP
                </span>
                <span className="font-semibold">
                  ~ $
                  {!selectedRow.details.totalStakedInUsd
                    ? "0.00"
                    : Number(selectedRow.details.totalStakedInUsd).toFixed(2)}
                </span>
              </div>
            </div>
            <Button
              disabled={!unstake}
              loading={isUnstaking}
              onClick={() => unstake?.()}
              className={classNames(
                "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                "text-white dark:text-primary",
                "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50"
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
