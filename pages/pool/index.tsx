export const revalidate = 30; // in seconds

import { Button } from "@geist-ui/core";
import { useEffect, useMemo, useState } from "react";
import { ChevronRightIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { BigNumberish } from "ethers";
import { classNames } from "@/shared/helpers/classNamer";
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/24/solid";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import {
  NEUTRO_FACTORY_ABI,
  NEUTRO_HELPER_ABI,
  NFTPOOLFACTORY_ABI,
} from "@/shared/abi";
import {
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { FACTORY_CONTRACT } from "@/shared/helpers/contract";
import { useRouter } from "next/router";
import { Token } from "@/shared/types/tokens.types";
import { tokens } from "@/shared/statics/tokenList";
import {
  DEFAULT_CHAIN_ID,
  SupportedChainID,
  supportedChainID,
} from "@/shared/types/chain.types";

import PoolIcon from "@/public/icons/pool.svg";
import { waitForTransaction } from "@wagmi/core";
import { decodeAbiParameters, formatEther, parseAbiParameters } from "viem";
import { urls } from "@/shared/config/urls";
import { Client, cacheExchange, fetchExchange } from "urql";
import { getPoolListQuery } from "@/shared/gql/queries/factory";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { cn, currencyCompactFormat } from "@/shared/utils";
dayjs.extend(utc);
import { currencyFormat } from "@/shared/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/elements/Table";
import { getTokenImageUrl } from "@/shared/getters/getTokenInfo";
import TokenLogo from "@/components/modules/TokenLogo";
import { ChevronRight } from "lucide-react";
import {
  NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT,
  NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT,
} from "@/shared/helpers/constants";

type PositionsResponse = {
  network_id: string;
  address: `0x${string}`;
  decimal: number;
  name: string;
  symbol: Array<string>;
  logo: Array<string>;
  userBalance: BigNumberish;
  token0: Token;
  token1: Token;
  poolShare: string;
};

export default function Pool() {
  const [dataWithApr, setDataWithApr] = useState<
    {
      id: string;
      token0: {
        id: string;
        symbol: string;
        name: string;
      };
      token1: {
        id: string;
        symbol: string;
        name: string;
      };
      reserve0: any;
      reserve1: any;
      reserveUSD: any;
      reserveEOS: any;
      trackedReserveEOS: any;
      untrackedVolumeUSD: any;
      token0Price: any;
      token1Price: any;
      txCount: any;
      pairDayData: any[];
      apr: number;
      volume7Days: any;
    }[]
  >([]);
  const [totalLiquidityUSD, setTotalLiquidityUSD] = useState<number>(0);

  type Urls = {
    pair1_address: string;
    pair2_address: string;
  };

  const getLpTokenAddress: Record<SupportedChainID, Urls> = {
    "17777": {
      pair1_address: "0xc7f5264ee4b832e5ac55fb8b9028f414ca164218",
      pair2_address: "0xb3fb2548287bcadd5a045270b3182c1fc6318684",
    },
    "15557": {
      pair1_address: "0xafd8de90c836af0cf449614d8bc7a1521c6a638d",
      pair2_address: "0xf67f0d0d0c99f0eab675c1b25538e9f5faaa4021",
    },
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const url = urls[DEFAULT_CHAIN_ID.id].FACTORY_GRAPH_URL;
        const client = new Client({
          url: url,
          exchanges: [cacheExchange, fetchExchange],
        });

        const res = await client
          .query(getPoolListQuery, {
            start_date: dayjs().utc().subtract(7, "days").startOf("day").unix(),
          })
          .toPromise();

        let pools = res.data;
        if (!pools) throw new Error("Failed to fetch data");

        const dataWithApr = pools.pairs.map((item) => {
          const sevenDaysVolume = item.pairDayData.reduce((prev, curr) => {
            return prev + parseFloat(curr.dailyVolumeUSD);
          }, 0);

          const sevenDaysFeeUsd = sevenDaysVolume * 0.003;
          return {
            ...item,
            volume7Days: currencyFormat(sevenDaysVolume),
            apr: ((sevenDaysFeeUsd * 54) / +item.reserveUSD) * 100,
          };
        });

        // Filter pools for "USDT/NEUTRO" and "NEUTRO/WEOS"
        const lpAddresses = getLpTokenAddress[DEFAULT_CHAIN_ID.id];
        const filteredPools = dataWithApr.filter((pool) => {
          return (
            pool.id == lpAddresses.pair1_address ||
            pool.id == lpAddresses.pair2_address
          );
        });

        // Sort the filtered dataWithApr array based on reserveUSD in descending order
        const sortedData = filteredPools
          .slice()
          .sort((a, b) => b.reserveUSD - a.reserveUSD);

        const totalLiquidityUsd = pools.neutroFactories.map((item) =>
          parseFloat(item.totalLiquidityUSD)
        );

        // const formattedTotalLiquidityUsd = totalLiquidityUsd
        //   .filter((value) => !isNaN(value))
        //   .map((value) => Math.floor(value));

        setTotalLiquidityUSD(totalLiquidityUsd[0] || 0);
        setDataWithApr(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="py-16">
      <div className="mb-8">
        <div className="flex justify-center items-center space-x-3">
          <PoolIcon className="w-7 h-7 md:w-8 md:h-8 text-primary mt-1" />{" "}
          <p className="m-0 text-center text-3xl md:text-4xl font-semibold">
            Liquidity Pool
          </p>
        </div>
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Add or Remove liquidity to Neutroswap pool
        </p>
        <div className="my-5 box-border">
          <div className="flex flex-col justify-center items-center px-1 py-3 md:px-10 md:py-7 rounded-xl md:border border-neutral-200/80 dark:border-neutral-800/80">
            <div className="mb-2 text-xs font-bold uppercase text-neutral-500">
              Pool Total Value Locked
            </div>
            <div className="text-4xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-semibold">
              ${currencyFormat(totalLiquidityUSD)}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Modal>
            <ModalOpenButton>
              <Button
                auto
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                  "text-white dark:text-primary",
                  "!bg-primary/80 hover:bg-primary dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                iconRight={
                  <PlusIcon className="text-white dark:text-primary" />
                }
              >
                Add Liquidity
              </Button>
            </ModalOpenButton>
            <ModalContents>
              {({ close }) => <AddLiquidityModal handleClose={close} />}
            </ModalContents>
          </Modal>
        </div>
      </div>

      <div
        className={cn(
          "relative flex flex-col w-full border rounded-lg bg-white dark:bg-neutral-900/50 shadow-lg shadow-slate-200 dark:shadow-black/50 overflow-hidden"
        )}
      >
        <Table>
          <TableHeader className="border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-60">Asset</TableHead>
              <TableHead className="text-right">Liquidity</TableHead>
              <TableHead className="text-right">Volume (7d)</TableHead>
              <TableHead className="text-right">APR</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataWithApr.map((pool) => (
              <TableRow
                key={pool.id}
                className="cursor-pointer group"
                href={`/pool/${pool.id}`}
              >
                <TableCell className="flex items-center space-x-4">
                  <div className="flex -space-x-2.5 flex-shrink-0">
                    <TokenLogo
                      className="w-7 h-7 ring-2 ring-background"
                      src={getTokenImageUrl(pool.token0.id as `0x${string}`)}
                    />
                    <TokenLogo
                      className="w-7 h-7 ring-2 ring-background"
                      src={getTokenImageUrl(pool.token1.id as `0x${string}`)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-left font-medium">
                      {pool.token0.symbol}
                    </span>
                    <span className="text-left font-medium text-muted-foreground opacity-25">
                      /
                    </span>
                    <span className="text-left font-medium">
                      {pool.token1.symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-right">
                  ${currencyCompactFormat(pool.reserveUSD)}
                </TableCell>
                <TableCell className="text-right">
                  {/* ${currencyFormat(pool.pairDayData[5].dailyVolumeUSD)} */}$
                  {pool.volume7Days}
                </TableCell>
                <TableCell className="text-right">
                  <AprTable pool={pool.id} />
                </TableCell>
                <TableCell className="flex justify-end text-right">
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
    if (!chain) return tokens[DEFAULT_CHAIN_ID.id];
    if (!supportedChainID.includes(chain.id as any))
      return tokens[DEFAULT_CHAIN_ID.id];
    return tokens[chain.id as SupportedChainID];
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
    // address: token1.address,
    onSuccess: async (result) => {
      const tx = await waitForTransaction({
        hash: result.hash,
        confirmations: 8,
      });
      const decodedResult = decodeAbiParameters(
        parseAbiParameters("address , uint256"),
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
            <div className="flex items-center justify-between p-2">
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
            <div className="flex items-center justify-between p-2">
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
            "!flex !items-center !mt-4 !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
            "text-white dark:text-primary",
            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
            "disabled:opacity-50"
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

type AprTableProps = {
  pool: string;
};

const AprTable = (props: AprTableProps) => {
  const { data: nftPool } = useContractRead({
    address: NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT as `0x${string}`,
    abi: NFTPOOLFACTORY_ABI,
    functionName: "getPool",
    args: [props.pool as `0x${string}`],
  });

  const { data: apr } = useContractRead({
    address: NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT as `0x${string}`,
    abi: NEUTRO_HELPER_ABI,
    functionName: "nftPoolApr",
    args: [nftPool!],
  });

  const formattedApr = apr ? parseFloat(formatEther(apr)) : 0;

  return <div> {currencyFormat(formattedApr, 2, 0.01)}%</div>;
};
