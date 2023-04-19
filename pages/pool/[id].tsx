import Link from "next/link";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import { useRouter } from "next/router";
import { classNames } from "@/shared/helpers/classNamer";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

import { Token } from "@/shared/types/tokens.types";
import { formatEther } from "ethers/lib/utils.js";
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

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isNewPool, setIsNewPool] = useState<boolean>(false);
  const [priceRatio, setPriceRatio] = useState<[number, number]>([0, 0]);
  const [token0, setToken0] = useState<Token>();
  const [token1, setToken1] = useState<Token>();
  const [balances, setBalances] = useState<Currency[]>([
    {
      decimal: 18,
      raw: BigNumber.from(0),
      formatted: "0.00",
    },
    {
      decimal: 18,
      raw: BigNumber.from(0),
      formatted: "0.00",
    },
  ]);
  const [totalLPSupply, setTotalLPSupply] = useState<BigNumber>(BigNumber.from(0));
  const [userLPBalance, setUserLPBalance] = useState<Currency>({
    decimal: 18,
    raw: BigNumber.from(0),
    formatted: "0.00"
  })
  const [poolBalances, setPoolBalances] = useState<Currency[]>([
    {
      decimal: 18,
      raw: BigNumber.from(0),
      formatted: "0.00"
    },
    {
      decimal: 18,
      raw: BigNumber.from(0),
      formatted: "0.00"
    }
  ])

  const { data: pairs } = useContractReads({
    contracts: [
      { ...poolContract, functionName: "token0" },
      { ...poolContract, functionName: "token1" },
    ],
  });

  useContractRead({
    address: router.query.id as `0x${string}`,
    abi: NEUTRO_POOL_ABI,
    functionName: "getReserves",
    onSuccess(response) {
      if (response._reserve0.isZero() && response._reserve1.isZero()) {
        setIsNewPool(true);
        setSelectedIndex(1);
        return setPriceRatio([0, 0]);
      };
      setPriceRatio([
        +formatEther(response._reserve0) / +formatEther(response._reserve1), // amount0 * ratio0 = quote1
        +formatEther(response._reserve1) / +formatEther(response._reserve0) // amount1 * ratio1 = quote0
      ])
    }
  });

  const { refetch: refetchUserBalances } = useContractReads({
    enabled: Boolean(pairs && address),
    contracts: [
      {
        address: pairs?.[0],
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: pairs?.[1],
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      { address: pairs?.[0], abi: ERC20_ABI, functionName: "name" },
      { address: pairs?.[1], abi: ERC20_ABI, functionName: "name" },
      { address: pairs?.[0], abi: ERC20_ABI, functionName: "symbol" },
      { address: pairs?.[1], abi: ERC20_ABI, functionName: "symbol" },
      { address: pairs?.[0], abi: ERC20_ABI, functionName: "decimals" },
      { address: pairs?.[1], abi: ERC20_ABI, functionName: "decimals" },
    ],
    onSuccess(value) {
      setBalances([
        {
          decimal: value[7].toNumber(),
          raw: value[0],
          formatted: Number(formatEther(value[0])).toFixed(2),
        },
        {
          decimal: value[7].toNumber(),
          raw: value[1],
          formatted: Number(formatEther(value[1])).toFixed(2),
        },
      ]);
      setToken0({
        network_id: "15557",
        name: value[2],
        address: pairs?.[0]!,
        symbol: value[4],
        logo: `https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${value[4].toLowerCase()}.svg`,
        decimal: Number(formatEther(value[6])),
      });
      setToken1({
        network_id: "15557",
        address: pairs?.[1]!,
        name: value[3],
        symbol: value[5],
        logo: `https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${value[5].toLowerCase()}.svg`,
        decimal: Number(formatEther(value[7])),
      });
    },
  });

  const { refetch: refetchAllBalance } = useContractReads({
    enabled: Boolean(address && router.query.id && token0 && token1),
    contracts: [
      {
        address: router.query.id as `0x${string}`,
        abi: NEUTRO_POOL_ABI,
        functionName: 'balanceOf',
        args: [address!],
      },
      {
        address: router.query.id as `0x${string}`,
        abi: NEUTRO_POOL_ABI,
        functionName: 'totalSupply',
      },
      {
        address: token0?.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [router.query.id as `0x${string}`]
      },
      {
        address: token1?.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [router.query.id as `0x${string}`]
      },
    ],
    onSuccess: (value) => {
      setUserLPBalance({
        decimal: 18,
        raw: value[0],
        formatted: Number(formatEther(value[0])).toFixed(2)
      })
      setTotalLPSupply(value[1])
      setPoolBalances([
        {
          decimal: 18,
          raw: value[2],
          formatted: Number(formatEther(value[2])).toFixed(2)
        },
        {
          decimal: 18,
          raw: value[3],
          formatted: Number(formatEther(value[3])).toFixed(2)
        }
      ])
    }
  })

  return (
    <div className="flex py-4 sm:py-10">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14">
          <Tab.List className="w-full md:col-span-2">
            <Link href="/pool" className="group text-black dark:text-white">
              <div className="flex space-x-1 items-center mb-4">
                <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-all" />
                <span>Pool</span>
              </div>
            </Link>
            <div className="flex flex-row md:flex-col gap-y-2">
              <Tab disabled={isNewPool} className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              >
                <span className="text-sm w-full text-center md:text-left px-3 py-2">
                  Overview
                </span>
              </Tab>
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              >
                <span className="text-sm w-full text-center md:text-left px-3 py-2">
                  Deposit
                </span>
              </Tab>
              <Tab disabled={isNewPool} className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
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
