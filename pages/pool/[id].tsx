import Link from "next/link";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import { useRouter } from "next/router";
import { classNames } from "@/shared/helpers/classNames";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

import { Token } from "@/shared/types/tokens.types";
import { formatEther, } from "ethers/lib/utils.js";
import { useAccount, useContractReads, } from "wagmi";
import { ERC20_ABI, NEUTRO_POOL_ABI, } from "@/shared/abi";

import PoolDepositPanel from "@/components/templates/TabPanels/PoolDeposit";
import PoolOverviewPanel from "@/components/templates/TabPanels/PoolOverview";
import PoolWithdrawalPanel from "@/components/templates/TabPanels/PoolWithdrawal";

// TODO: use getServerSideProps so it will not redirected to unknown pool
export default function PoolDetails() {
  const router = useRouter();
  const { address } = useAccount();

  const poolContract = {
    address: router.query.id as `0x${string}`,
    abi: NEUTRO_POOL_ABI,
  }

  const [balances, setBalances] = useState<number[]>([0, 0]);
  const [token0, setToken0] = useState<Token>()
  const [token1, setToken1] = useState<Token>()

  const { data: pairs } = useContractReads({
    contracts: [
      { ...poolContract, functionName: 'token0' },
      { ...poolContract, functionName: 'token1' }
    ]
  })

  useContractReads({
    enabled: Boolean(pairs && address),
    contracts: [
      { address: pairs?.[0], abi: ERC20_ABI, functionName: 'balanceOf', args: [address!] },
      { address: pairs?.[1], abi: ERC20_ABI, functionName: 'balanceOf', args: [address!] },
      { address: pairs?.[0], abi: ERC20_ABI, functionName: 'name' },
      { address: pairs?.[1], abi: ERC20_ABI, functionName: 'name' },
      { address: pairs?.[0], abi: ERC20_ABI, functionName: 'symbol' },
      { address: pairs?.[1], abi: ERC20_ABI, functionName: 'symbol' },
      { address: pairs?.[0], abi: ERC20_ABI, functionName: 'decimals' },
      { address: pairs?.[1], abi: ERC20_ABI, functionName: 'decimals' },
    ],
    onSuccess(value) {
      setBalances([
        Number(Number(formatEther(value[0])).toFixed(2)),
        Number(Number(formatEther(value[1])).toFixed(2).toString())
      ])
      setToken0({
        network_id: "15557",
        name: value[2],
        address: pairs?.[0]!,
        symbol: value[4],
        logo: `https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${value[4].toLowerCase()}.svg`,
        decimal: Number(formatEther(value[6]))
      })
      setToken1({
        network_id: "15557",
        address: pairs?.[1]!,
        name: value[3],
        symbol: value[5],
        logo: `https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${value[5].toLowerCase()}.svg`,
        decimal: Number(formatEther(value[7]))
      })
    },
  })

  return (
    <div className="flex py-4 sm:py-10">
      <Tab.Group>
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14">
          <Tab.List className="w-full md:col-span-2">
            <Link href="/pool" className="group text-black dark:text-white">
              <div className="flex space-x-1 items-center mb-4">
                <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-all" />
                <span>Pool</span>
              </div>
            </Link>
            <div className="flex flex-row sm:flex-col gap-y-2">
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
              )}>
                <span className="text-sm w-full text-center md:text-left px-3 py-2">Overview</span>
              </Tab>
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
              )}>
                <span className="text-sm w-full text-center md:text-left px-3 py-2">Deposit</span>
              </Tab>
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
              )}>
                <span className="text-sm w-full text-center md:text-left px-3 py-2">Withdraw</span>
              </Tab>
            </div>
          </Tab.List>
          <Tab.Panels className="w-full md:col-span-10">
            <Tab.Panel unmount={true}>
              <PoolOverviewPanel />
            </Tab.Panel>
            <Tab.Panel unmount={true}>
              {(token0 && token1) && (
                <PoolDepositPanel
                  balances={balances}
                  token0={token0}
                  token1={token1}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              {(token0 && token1) && (
                <PoolWithdrawalPanel
                  balances={balances}
                  token0={token0}
                  token1={token1}
                />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
}


