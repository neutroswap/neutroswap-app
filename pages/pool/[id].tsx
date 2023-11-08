import Link from "next/link";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import { useRouter } from "next/router";
import { classNames } from "@/shared/helpers/classNamer";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

import { Token } from "@/shared/types/tokens.types";
import { formatEther, formatUnits } from "viem";
import { useAccount, useContractRead, useContractReads } from "wagmi";
import { ERC20_ABI, NEUTRO_POOL_ABI } from "@/shared/abi";
import PoolDepositPanel from "@/components/templates/TabPanels/PoolDeposit";
import PoolOverviewPanel from "@/components/templates/TabPanels/PoolOverview";
import PoolWithdrawalPanel from "@/components/templates/TabPanels/PoolWithdrawal";
import { Currency } from "@/shared/types/currency.types";
import { BigNumber } from "ethers";

// TODO: use getServerSideProps so it will not redirected to unknown pool
export default function PoolDetails() {
  const router = useRouter();
  const { address } = useAccount();

  const poolContract = {
    address: router.query.id as `0x${string}`,
    abi: NEUTRO_POOL_ABI,
  };

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isNewPool, setIsNewPool] = useState<boolean>(false);
  const [priceRatio, setPriceRatio] = useState<[number, number]>([0, 0]);
  const [token0, setToken0] = useState<Token>();
  const [token1, setToken1] = useState<Token>();
  const [balances, setBalances] = useState<Currency[]>([
    {
      decimal: 18,
      raw: BigInt(0),
      formatted: "0.00",
    },
    {
      decimal: 18,
      raw: BigInt(0),
      formatted: "0.00",
    },
  ]);
  const [totalLPSupply, setTotalLPSupply] = useState<bigint>(BigInt(0));
  const [userLPBalance, setUserLPBalance] = useState<Currency>({
    decimal: 18,
    raw: BigInt(0),
    formatted: "0.00",
  });
  const [poolBalances, setPoolBalances] = useState<Currency[]>([
    {
      decimal: 18,
      raw: BigInt(0),
      formatted: "0.00",
    },
    {
      decimal: 18,
      raw: BigInt(0),
      formatted: "0.00",
    },
  ]);

  const { data: pairs } = useContractReads({
    contracts: [
      { ...poolContract, functionName: "token0" },
      { ...poolContract, functionName: "token1" },
    ],
  });

  const { data: reserves, refetch: refetchReserves } = useContractRead({
    enabled: Boolean(token0 && token1),
    address: router.query.id as `0x${string}`,
    abi: NEUTRO_POOL_ABI,
    functionName: "getReserves",
    onSuccess(response) {
      console.log("Res", response);
      console.log(response[0] !== BigInt(0), response[1] !== BigInt(0));
      if (response[0] == BigInt(0) && response[1] == BigInt(0)) {
        setIsNewPool(true);
        setSelectedIndex(1);
        return setPriceRatio([0, 0]);
      }
      setIsNewPool(false);
      setPriceRatio([
        +formatUnits(response[0], Number(token0?.decimal)) /
          +formatUnits(response[1], Number(token1?.decimal)), // amount0 * ratio0 = quote1
        +formatUnits(response[1], Number(token1?.decimal)) /
          +formatUnits(response[0], Number(token0?.decimal)), // amount1 * ratio1 = quote0
      ]);
    },
  });
  console.log("PR", priceRatio);

  const { refetch: refetchUserBalances } = useContractReads({
    enabled: Boolean(pairs && address),
    contracts: [
      {
        address: pairs?.[0].result,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: pairs?.[1].result,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      { address: pairs?.[0].result, abi: ERC20_ABI, functionName: "name" },
      { address: pairs?.[1].result, abi: ERC20_ABI, functionName: "name" },
      { address: pairs?.[0].result, abi: ERC20_ABI, functionName: "symbol" },
      { address: pairs?.[1].result, abi: ERC20_ABI, functionName: "symbol" },
      { address: pairs?.[0].result, abi: ERC20_ABI, functionName: "decimals" },
      { address: pairs?.[1].result, abi: ERC20_ABI, functionName: "decimals" },
    ],
    onSuccess(value) {
      const [
        balance0,
        balance1,
        name0,
        name1,
        symbol0,
        symbol1,
        decimal0,
        decimal1,
      ] = value;
      if (isNaN(Number(balance0.result))) return;
      if (isNaN(Number(balance1.result))) return;
      setBalances([
        {
          decimal: Number(balance0.result),
          raw: balance0.result as bigint,
          formatted: parseFloat(
            formatUnits(
              BigInt(Number(balance0.result)),
              Number(decimal0.result)
            )
          ).toFixed(2),
        },
        {
          decimal: Number(balance1.result),
          raw: balance1.result as bigint,
          formatted: parseFloat(
            formatUnits(
              BigInt(Number(balance1.result)),
              Number(decimal1.result)
            )
          ).toFixed(2),
        },
      ]);
      setToken0({
        // network_id: "15557",
        name: name0.result as string,
        address: pairs?.[0].result as `0x${string}`,
        symbol: symbol0.result as string,
        logo: `https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${symbol0
          .result!.toString()
          .toLowerCase()}.svg`,
        decimal: Number(decimal0.result),
      });
      setToken1({
        // network_id: "15557",
        address: pairs?.[1].result as `0x${string}`,
        name: name1.result as string,
        symbol: symbol1.result as string,
        logo: `https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${symbol1
          .result!.toString()
          .toLowerCase()}.svg`,
        decimal: Number(decimal1.result),
      });
    },
  });

  const { refetch: refetchAllBalance } = useContractReads({
    enabled: Boolean(address && router.query.id && token0 && token1),
    contracts: [
      {
        address: router.query.id as `0x${string}`,
        abi: NEUTRO_POOL_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: router.query.id as `0x${string}`,
        abi: NEUTRO_POOL_ABI,
        functionName: "totalSupply",
      },
      {
        address: token0?.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [router.query.id as `0x${string}`],
      },
      {
        address: token1?.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [router.query.id as `0x${string}`],
      },
      {
        address: token0?.address,
        abi: ERC20_ABI,
        functionName: "decimals",
      },
      {
        address: token1?.address,
        abi: ERC20_ABI,
        functionName: "decimals",
      },
    ],
    onSuccess: (value) => {
      setUserLPBalance({
        decimal: 18,
        raw: value[0].result as bigint,
        formatted: Number(formatEther(value[0].result as bigint)).toFixed(2),
      });
      setTotalLPSupply(value[1].result as bigint);
      setPoolBalances([
        {
          decimal: Number(value[4]),
          raw: value[2].result as bigint,
          formatted: parseFloat(
            formatUnits(
              BigInt(Number(value[2].result)),
              Number(value[4].result)
            )
          ).toFixed(2),
        },
        {
          decimal: Number(value[5]),
          raw: value[3].result as bigint,
          formatted: parseFloat(
            formatUnits(
              BigInt(Number(value[3].result)),
              Number(value[5].result)
            )
          ).toFixed(2),
        },
      ]);
    },
  });

  return (
    <div className="flex py-16">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14">
          <Tab.List
            className={classNames(
              "w-full md:col-span-2 rounded-lg p-0.5",
              "bg-neutral-100 dark:bg-neutral-900/50 md:bg-transparent md:dark:bg-transparent"
            )}
          >
            <Link
              href="/pool"
              className="hidden md:block group text-black dark:text-white mb-6"
            >
              <div className="flex space-x-1 items-center">
                <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-all" />
                <span>Pool</span>
              </div>
            </Link>
            <div className="flex flex-row md:flex-col gap-y-2">
              <Tab
                disabled={isNewPool}
                className={({ selected }) =>
                  classNames(
                    selected && "bg-white dark:bg-neutral-900 shadow-sm",
                    selected &&
                      "!text-neutral-900 dark:!text-neutral-300 font-medium",
                    "flex w-full rounded-lg text-neutral-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )
                }
              >
                <span className="text-sm w-full text-center md:text-left px-3 py-2">
                  Overview
                </span>
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected && "bg-neutral-200/50 dark:bg-neutral-900",
                    selected &&
                      "!text-neutral-900 dark:!text-neutral-300 font-medium",
                    "flex w-full rounded-lg text-neutral-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )
                }
              >
                <span className="text-sm w-full text-center md:text-left px-3 py-2">
                  Deposit
                </span>
              </Tab>
              <Tab
                disabled={isNewPool}
                className={({ selected }) =>
                  classNames(
                    selected && "bg-neutral-200/50 dark:bg-neutral-900",
                    selected &&
                      "!text-neutral-900 dark:!text-neutral-300 font-medium",
                    "flex w-full rounded-lg text-neutral-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )
                }
              >
                <span className="text-sm w-full text-center md:text-left px-3 py-2">
                  Withdraw
                </span>
              </Tab>
            </div>
          </Tab.List>
          <Tab.Panels className="w-full md:col-span-10">
            <Tab.Panel>
              {token0 && token1 && (
                <PoolOverviewPanel
                  token0={token0}
                  token1={token1}
                  priceRatio={priceRatio}
                  totalLPSupply={totalLPSupply}
                  userLPBalance={userLPBalance}
                  poolBalances={poolBalances}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              {token0 && token1 && (
                <PoolDepositPanel
                  balances={balances}
                  token0={token0}
                  token1={token1}
                  priceRatio={priceRatio}
                  isNewPool={isNewPool}
                  reserves={reserves}
                  refetchReserves={refetchReserves}
                  refetchAllBalance={refetchAllBalance}
                  refetchUserBalances={refetchUserBalances}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              {token0 && token1 && (
                <PoolWithdrawalPanel
                  balances={balances}
                  token0={token0}
                  token1={token1}
                  totalLPSupply={totalLPSupply}
                  userLPBalance={userLPBalance}
                  poolBalances={poolBalances}
                  refetchAllBalance={refetchAllBalance}
                  refetchUserBalances={refetchUserBalances}
                />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
}
