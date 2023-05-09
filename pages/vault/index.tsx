// import { Inter } from 'next/font/google'
import { Button, Code, Input, Loading, Modal, Page, Spinner, Table, Tabs, Text, useModal, useTheme } from "@geist-ui/core";
import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
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
  NEXT_PUBLIC_VAULT_CONTRACT,
  NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT
} from "@/shared/helpers/constants";
import { ERC20_ABI, NEUTRO_VAULT_ABI } from "@/shared/abi";
import { formatEther } from "ethers/lib/utils.js";
import debounce from "lodash/debounce";
import { parseBigNumber } from "@/shared/helpers/parseBigNumber";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import useVaultList, { AvailableVault } from "@/shared/hooks/fetcher/vaults/useVaultList";
import useUserVaults, { OwnedVault } from "@/shared/hooks/fetcher/vaults/useUserVaults";
import { Vault } from "@/shared/types/vault.types";
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import { TableColumnRender } from "@geist-ui/core/esm/table";
import OffloadedModal from "@/components/modules/OffloadedModal";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import JsonSearch from "search-array";
import dayjs from "dayjs";

import VaultIcon from "@/public/icons/vault.svg"
import NoContentDark from "@/public/states/empty/dark.svg";
import NoContentLight from "@/public/states/empty/light.svg";
import { ThemeType } from "@/shared/hooks/usePrefers";

type MergedVault = Vault & {
    totalDeposit?: string;
    totalDepositInUsd?: string;
    pendingTokens?: string;
    pendingTokensInUsd?: string;
    unlockAt?: string;
}


export default function VaultPage() {
  const theme = useTheme();
  const { address } = useAccount();
  const searchRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState("1");
  const [query, setQuery] = useState<string>('');
  const [allVault, setAllVault] = useState<Array<MergedVault>>([]);
  const [ownedVault, setOwnedVault] = useState<Array<OwnedVault>>([]);
  const [mergedData, setMergedData] = useState<Array<MergedVault>>([]);
  const [selectedRow, setSelectedRow] = useState<MergedVault>();
  // console.log("sr", selectedRow)
  // console.log("md", mergedData)

  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const { data: vaults, isLoading: isVaultsLoading, error: isVaultsError } = useVaultList()
  const { data: userVaults, isLoading: isUserVaultsLoading, error: isUserVaultsError } = useUserVaults(address)

  useEffect(() => {
    function combineData() {
      if (!vaults) return;
      if (!userVaults) return;
      const combinedData = vaults.vaults.map((vault: AvailableVault) => {
        const userExactVault = userVaults.vaults.find((userVault: any) => vault.pid === userVault.pid)
        console.log("userexactvault", userExactVault)
        const temp = Object.assign({}, vault, userExactVault);
        console.log("vault", vault)
        const vaultDetails = { ...vault.details, ...userExactVault}
        return { ...temp, details: vaultDetails }
      });
      setMergedData(combinedData);
      setAllVault(combinedData);
    }
    combineData();
  }, [vaults, userVaults]);

  // Problem fetching all the vaults PID
  const { config: harvestMany } = usePrepareContractWrite({
    address: NEXT_PUBLIC_VAULT_CONTRACT as `0x${string}`,
    abi: NEUTRO_VAULT_ABI,
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
    functionName: "harvestMany",
    args: [mergedData.map((item) => BigNumber.from(item.pid))],
  });

  const { write: harvestAll, isLoading: isHarvestingAll } = useContractWrite({
    ...harvestMany,
    onSuccess: async (result) => {
      await result.wait();
    },
  });

  const resetAllVault = () => {
    setQuery('');
    setAllVault(mergedData);
    searchRef.current.value = "";
  }

  const resetOwnedVault = () => {
    if (!userVaults) throw new Error("No user vaults data");
    setQuery('');
    setOwnedVault(userVaults.vaults);
    searchRef.current.value = "";
  }

  const handleSearchAll = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true);
    if (!Boolean(e.target.value)) {
      resetAllVault();
      return setIsSearching(false);
    };
    setQuery(e.target.value);
    // vault data lookup based on e.target.value
    const fullTextSearch = new JsonSearch(mergedData);
    const results: MergedVault[] = fullTextSearch.query(e.target.value)
    setAllVault(results);
    return setIsSearching(false);
  })

  const handleSearchOwnedVault = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true);
    if (!Boolean(e.target.value)) {
      resetOwnedVault();
      return setIsSearching(false);
    };
    setQuery(e.target.value);
    // vault data lookup based on e.target.value
    const fullTextSearch = new JsonSearch(userVaults?.vaults);
    const results: OwnedVault[] = fullTextSearch.query(e.target.value)
    setOwnedVault(results);
    return setIsSearching(false);
  })

  const vaultNameColumnHandler: TableColumnRender<MergedVault> = (value, rowData, index) => {
    return (
      <div className="flex space-x-3 items-center my-5">
        <div className="flex -space-x-2 relative z-0">
          <img
            src={rowData.tokenLogo}
            className="w-7 h-7 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
            onError={(e) => {
              handleImageFallback(rowData.tokenLogo, e);
            }}
          />
        </div>
        <div className="space-x-1 font-semibold text-neutral-800 dark:text-neutral-200">
          <span>NEUTRO</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-5xl mx-auto py-16">
      <div>
        <div className="flex items-center justify-center space-x-3">
          <VaultIcon className="w-7 h-7 md:w-8 md:h-8 text-neutral-700 dark:text-neutral-300 mt-1" />
          <p className="m-0 text-center text-3xl md:text-4xl font-semibold">
            Vault
          </p>
        </div>
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Lock $NEUTRO for extra rewards
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 my-10 box-border">
        <div className="w-full px-1 py-3 md:px-10 md:py-7 rounded-l-xl md:border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-500">Total Value Locked</div>
          {(!isUserVaultsLoading && !isVaultsLoading) && (
            <div className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">${currencyFormat(+vaults?.totalVaultValue!)}</div>
          )}
          {(isUserVaultsLoading && isVaultsLoading) && (
            <Spinner className="mt-5" />
          )}
        </div>
        <div className="w-full px-1 py-3 md:px-10 md:py-7 md:border-t md:border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-500">Your Staked Assets</div>
          {(!isUserVaultsLoading && !isVaultsLoading) && (
            <div className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">${currencyFormat(+userVaults?.totalHoldingsInUsd!)}</div>
          )}
          {(isUserVaultsLoading && isVaultsLoading) && (
            <Spinner className="mt-5" />
          )}
        </div>
        <div className="w-full px-1 py-3 md:px-10 md:py-7 rounded-r-xl md:border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-500">Unclaimed Rewards</div>
          {(!isUserVaultsLoading && !isVaultsLoading) && (
            <div className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-semibold">${currencyFormat(+userVaults?.totalPendingTokensInUsd!)}</div>
          )}
          {(isUserVaultsLoading && isVaultsLoading) && (
            <Spinner className="mt-5" />
          )}
        </div>
      </div>

      <div className="relative flex flex-col w-full justify-between mb-4">
        <div className="flex items-center justify-between space-x-4 w-full mt-0 mb-4">
          <div className="flex w-full items-center bg-neutral-50 dark:bg-neutral-900/80 rounded-lg px-2 border border-neutral-200/80 dark:border-transparent">
            {activeTab === "1" && (
              <input
                type="text"
                ref={searchRef}
                placeholder="Search by vault, name, symbol or address"
                className="bg-transparent p-2 rounded-md w-full placeholder-neutral-400 dark:placeholder-neutral-600 text-sm"
                onChange={handleSearchAll}
              />
            )}

            {activeTab === "2" && (
              <input
                type="text"
                ref={searchRef}
                placeholder="Search by vault, name, symbol or address"
                className="bg-transparent p-2 rounded-md w-full placeholder-neutral-400 dark:placeholder-neutral-600 text-sm"
                onChange={handleSearchOwnedVault}
              />
            )}

            {!query && <MagnifyingGlassIcon className="flex inset-0 h-6 text-neutral-400" />}
            {query && (
              <button
                onClick={() => resetAllVault()}
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
              "text-white dark:text-amber-600",
              "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
              "!border !border-orange-600/50 dark:border-orange-400/[.12]"
            )}
          >
            Harvest All
          </Button>
        </div>
        {/* {(!Boolean(allVault.length) && !(isVaultsLoading || isUserVaultsLoading || isSearching)) && (
            <div className="flex flex-col items-center w-full p-8 border-2 border-dashed border-neutral-200/60 dark:border-neutral-900 rounded-xl box-border">
              {theme.type as ThemeType === "nlight" && (
                <NoContentLight className="w-40 h-40 opacity-75" />
              )}
              {theme.type as ThemeType === "ndark" && (
                <NoContentDark className="w-40 h-40 opacity-75" />
              )}
              <p className="text-neutral-500 w-3/4 text-center">
                No vaults with <Code>{query}</Code> found. Try to use search with contract address instead of token name.
              </p>
            </div>
        )} */}
        {(isVaultsLoading || isUserVaultsLoading || isSearching) && (
          <div className="my-5">
            <Loading spaceRatio={2.5} />
          </div>
        )}
        {Boolean(vaults?.vaults.length) && (
          <div className="overflow-x-scroll">
            <Table
              data={allVault}
              rowClassName={() => "cursor-pointer"}
              className="min-w-max"
              emptyText="Loading..."
              onRow={(rowData) => {
                setIsOpen(true);
                setSelectedRow(rowData);
              }}
            >
              <Table.Column
                prop="tokenLogo"
                label="Stake"
                render={vaultNameColumnHandler}
              />
              <Table.Column
                prop="lockup"
                label="Lockup"
                render={(value) => <span>{currencyFormat(+value)} days</span>}
              />
              <Table.Column
                prop="valueOfVault"
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
                render={(_value, rowData: MergedVault | any) => <span>{+rowData.details.apr} %</span>}
              />
            </Table>
          </div>
        )}
      </div>

      <OffloadedModal
        isOpen={isOpen}
        onClose={() => {
          setSelectedRow(undefined);
          setIsOpen(false)
        }}>
        {selectedRow && <VaultRow selectedRow={selectedRow} />}
      </OffloadedModal>
    </div>
  );
}

const VaultRow = ({ selectedRow }: { selectedRow: MergedVault }) => {
  const { address, isConnected } = useAccount();

  const [isNeutroTokenApproved, setIsNeutroTokenApproved] = useState(false);

  const [stakeAmount, setStakeAmount] = useState<string>();
  const [unstakeAmount, setUnstakeAmount] = useState<string>();

  const { data: neutroTokenBalance } = useContractRead({
    address: NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT as `0x${string}`,
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
    enabled: Boolean(neutroTokenBalance),
    address: NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address!, NEXT_PUBLIC_VAULT_CONTRACT as `0x${string}`],
    onSuccess(value) {
      setIsNeutroTokenApproved(+formatEther(value) >= +formatEther(neutroTokenBalance!));
    },
  });

  const { config: approveNeutroTokenConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      NEXT_PUBLIC_VAULT_CONTRACT as `0x${string}`,
      BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { isLoading: isApprovingNeutroToken, write: approveNeutroToken } =
    useContractWrite({
      ...approveNeutroTokenConfig,
      onSuccess: async (result) => {
        await result.wait();
        await refetchAllowance();
      },
    });

  const { config: stakeConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_VAULT_CONTRACT as `0x${string}`,
    abi: NEUTRO_VAULT_ABI,
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
    functionName: "deposit",
    args: [BigNumber.from(selectedRow.pid), parseBigNumber(stakeAmount!)],
    onError(error) {
      console.log("Error", error);
    },
  });

  const { write: stake, isLoading: isStaking } = useContractWrite({
    ...stakeConfig,
    onSuccess: async (result) => {
      await result.wait();
    },
  });

  const { config: unstakeConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_VAULT_CONTRACT as `0x${string}`,
    abi: NEUTRO_VAULT_ABI,
    functionName: "withdraw",
    args: [BigNumber.from(selectedRow.pid), parseBigNumber(unstakeAmount!)],
  });

  const { write: unstake, isLoading: isUnstaking } = useContractWrite({
    ...unstakeConfig,
    onSuccess: async (result) => {
      await result.wait();
    },
  });

  const { config: harvestConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_VAULT_CONTRACT as `0x${string}`,
    abi: NEUTRO_VAULT_ABI,
    functionName: "deposit",
    args: [BigNumber.from(selectedRow.pid), BigNumber.from(0)],
  });
  const { write: harvest, isLoading: isHarvesting } = useContractWrite({
    ...harvestConfig,
    onSuccess: async (result) => {
      await result.wait();
    },
  });

  return (
    <div className="flex flex-col w-full">
      <div className="flex space-x-3 items-center">
        <div className="flex -space-x-2 relative z-0">
          <img
            src={selectedRow.tokenLogo}
            className="w-7 h-7 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
            onError={(e) => {
              handleImageFallback(selectedRow.tokenLogo, e);
            }}
          />
        </div>
        <div className="space-x-1 font-semibold text-neutral-800 dark:text-neutral-200 text-lg">
          <span>NEUTRO</span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full mt-10">
        <div className="space-y-1 mb-5 text-left">
          <span className="text-xs font-bold uppercase text-neutral-500">Earned Rewards</span>
          <div className="flex space-x-2 items-end justify-center text-3xl">
          <span className="font-bold text-black dark:text-white">{parseFloat(selectedRow.pendingTokens ?? "0").toFixed(2)}</span>
            <span className="text-base text-neutral-500">$NEUTRO</span>
          </div>
        </div>
        <Button
          auto
          disabled={!harvest}
          onClick={() => harvest?.()}
          loading={isHarvesting}
          iconRight={<BanknotesIcon className="w-4 h-4 opacity-90" />}
          className={classNames(
            "border-neutral-300 dark:border-neutral-800 hover:border-neutral-700 bg-transparent text-black dark:text-neutral-200 disabled:opacity-50",
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
        <Tabs.Item label="Stake" value="1">
          <div className="flex flex-col justify-between w-full space-y-2.5 mt-1">
            <div className="flex justify-between items-center bg-neutral-200/50 dark:bg-neutral-900/50 rounded-lg">
              <input
                value={stakeAmount}
                onChange={handleStakeAmountChange}
                placeholder="0.0"
                className="bg-transparent text-black dark:text-white !px-4 !py-3 !rounded-lg !box-border"
              ></input>
              <div
                className="mr-3 text-sm text-amber-600 cursor-pointer font-semibold"
                onClick={() => setStakeAmount(formatEther(neutroTokenBalance!))}
              >
                MAX
              </div>
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <div className="text-xs font-bold uppercase">Available:</div>
              <div className="text-sm space-x-2">
                <span>{!!neutroTokenBalance && Number(formatEther(neutroTokenBalance)).toFixed(2)}{" "} NEUTRO</span>
              </div>
            </div>
            {!isNeutroTokenApproved && (
              <Button
                disabled={!approveNeutroToken}
                loading={isApprovingNeutroToken}
                onClick={() => approveNeutroToken?.()}
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                  "text-white dark:text-amber-600",
                  "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Approve NEUTRO
              </Button>
            )}
            {isNeutroTokenApproved && (
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
                Stake NEUTRO
              </Button>
            )}
          </div>
        </Tabs.Item>
        <Tabs.Item label="Unstake" value="2">
          <div className="flex flex-col justify-between w-full space-y-2.5 mt-1">
            <div className="flex justify-between items-center bg-neutral-200/50 dark:bg-neutral-900/50 rounded-lg">
              <input
                value={unstakeAmount}
                onChange={handleUnstakeAmountChange}
                placeholder="0.0"
                className="bg-transparent text-black dark:text-white !px-4 !py-3 !rounded-lg !box-border"
              ></input>
              <div
                className="mr-3 text-sm text-amber-600 cursor-pointer font-semibold"
                onClick={() => setUnstakeAmount(selectedRow.totalDeposit)}
              >
                MAX
              </div>
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <div className="text-xs font-bold uppercase">Deposited:</div>
              <div className="text-sm space-x-2">
                <span>{parseFloat(selectedRow.totalDeposit!).toFixed(2)} NEUTRO</span>
                <span className="font-semibold">~ ${Number(selectedRow.totalDepositInUsd).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <div className="text-xs font-bold uppercase">Unlock At:</div>
              <div className="text-sm space-x-2">
              <span>{selectedRow.unlockAt && dayjs(parseFloat(selectedRow.unlockAt) * 1000).format('DD/MM/YYYY HH:mm')}</span>
              </div>
            </div>
            <Button
              disabled={!unstake}
              loading={isUnstaking}
              onClick={() => unstake?.()}
              className={classNames(
                "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                "text-white dark:text-amber-600",
                "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Unstake NEUTRO
            </Button>
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
};
