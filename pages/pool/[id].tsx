import { classNames } from "@/shared/helpers/classNames";
import { Text, Button, useTheme, Input } from "@geist-ui/core";
import { Tab } from "@headlessui/react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { ScaleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";

import NoContentDark from "@/public/states/empty/dark.svg"
import NoContentLight from "@/public/states/empty/light.svg"
import { useAccount, useContractRead, useContractReads } from "wagmi";
import { NEUTRO_POOL_ABI, NEUTRO_ROUTER_ABI } from "@/shared/abi";
import { UniswapPair, UniswapPairFactory, UniswapPairSettings, UniswapVersion } from "simple-uniswap-sdk";
import { FACTORY_CONTRACT, MULTICALL_CONTRACT, ROUTER_CONTRACT } from "@/shared/helpers/contract";
import { useEffect, useMemo, useState } from "react";
import { formatEther, parseEther } from "ethers/lib/utils.js";

export default function PoolDetails() {
  return (
    <div className="flex py-10">
      <Tab.Group>
        <div className="w-full grid grid-cols-12 gap-14">
          <Tab.List className="w-full col-span-2">
            <div className="flex flex-col space-y-2">
              <Link href="/pool" className="group text-black dark:text-white">
                <div className="flex space-x-1 items-center mb-4">
                  <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-all" />
                  <span>Pool</span>
                </div>
              </Link>
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
              )}>
                <span className="text-sm px-3 py-2">Overview</span>
              </Tab>
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
              )}>
                <span className="text-sm px-3 py-2">Deposit</span>
              </Tab>
              <Tab className={({ selected }) => classNames(
                selected && "bg-neutral-200/50 dark:bg-neutral-900",
                selected && "!text-neutral-800 dark:!text-neutral-300",
                "flex w-full rounded-lg text-neutral-500",
              )}>
                <span className="text-sm px-3 py-2">Withdraw</span>
              </Tab>
            </div>
          </Tab.List>
          <Tab.Panels className="w-full col-span-10">
            <Tab.Panel>
              <PoolOverviewPanel />
            </Tab.Panel>
            <Tab.Panel>
              <PoolDepositPanel />
            </Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
}

const PoolOverviewPanel = () => {
  const router = useRouter();
  const theme = useTheme();
  const { address } = useAccount();

  // const [uniswapPairFactory, setUniswapPairFactory] = useState<UniswapPairFactory>();

  // const poolContract = {
  //   address: router.query.id as `0x${string}`,
  //   abi: NEUTRO_POOL_ABI,
  // }

  // const { data, isError, isLoading } = useContractReads({
  //   contracts: [
  //     {
  //       ...poolContract,
  //       functionName: 'token0'
  //     },
  //     {
  //       ...poolContract,
  //       functionName: 'token1'
  //     }
  //   ]
  // })

  // let cloneUniswapContractDetailsV2 = useMemo(() => ({
  //   routerAddress: ROUTER_CONTRACT,
  //   factoryAddress: FACTORY_CONTRACT,
  //   pairAddress: router.query.id as `0x${string}`,
  // }), [router.query.id]);

  // let customNetworkData = useMemo(() => ({
  //   nameNetwork: "EOS EVM",
  //   multicallContractAddress: MULTICALL_CONTRACT,
  //   nativeCurrency: {
  //     name: "EOS",
  //     symbol: "EOS",
  //   },
  //   nativeWrappedTokenInfo: {
  //     chainId: 15557,
  //     contractAddress: "0x6cCC5AD199bF1C64b50f6E7DD530d71402402EB6",
  //     decimals: 18,
  //     symbol: "WEOS",
  //     name: "Wrapped EOS",
  //   },
  // }), []);

  // let customPairSettings = useMemo(() => new UniswapPairSettings({
  //   slippage: 0.0005,
  //   deadlineMinutes: 5,
  //   disableMultihops: true,
  //   cloneUniswapContractDetails: {
  //     v2Override: cloneUniswapContractDetailsV2,
  //   },
  //   uniswapVersions: [UniswapVersion.v2],
  //   customNetwork: customNetworkData,
  // }), [cloneUniswapContractDetailsV2, customNetworkData])

  // useEffect(() => {
  //   if (!data) return;
  //   (async () => {
  //     const uniswapPair = new UniswapPair({
  //       fromTokenContractAddress: data?.[0]!,
  //       toTokenContractAddress: data?.[1]!,
  //       ethereumAddress: address as string,
  //       chainId: 15557,
  //       providerUrl: "https://api-testnet2.trust.one/",
  //       settings: customPairSettings,
  //     })
  //     const pairFactory = await uniswapPair.createFactory();
  //     setUniswapPairFactory(pairFactory);
  //   })()
  // }, [data, address, customPairSettings])

  return (
    <div className="">
      <div className="flex items-center space-x-3">
        <ScaleIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
        <p className="m-0 text-2xl font-semibold">Pool Overview</p>
      </div>
      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">Contract: {router.query.id}</p>

      <div className="inline-flex space-x-2 px-3 py-2 bg-neutral-200/50 dark:bg-neutral-900 rounded-lg">
        <span className="text-sm font-semibold">1 USDT</span>
        <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">=</span>
        <span className="text-sm font-semibold">1 DONI</span>
      </div>

      <div className="w-full mt-4 border border-neutral-200/50 dark:border-neutral-800 rounded-lg">
        <div className="w-full flex flex-col items-center py-6">
          {theme.type === "light" && <NoContentLight className="w-40 h-40" />}
          {theme.type === "dark" && <NoContentDark className="w-40 h-40" />}
          <p className="text-neutral-500 text-center">You do not have any liquidity positions. Deposit some tokens to open a position.</p>
          <Button className="!mt-2">Deposit now</Button>
        </div>
      </div>
    </div>
  )
}


const PoolDepositPanel = () => {
  const router = useRouter();
  const theme = useTheme();
  const { address } = useAccount();

  const routerContract = {
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
  }

  const poolContract = {
    address: router.query.id as `0x${string}`,
    abi: NEUTRO_POOL_ABI,
  }

  const { data: reserveData } = useContractRead({
    ...poolContract,
    functionName: 'getReserves'
  });

  // const { data } = useContractRead({
  //   ...routerContract,
  //   functionName: 'quote',
  //   args: [parseEther("1"), reserveData?.[0]!, reserveData?.[1]!]
  // });

  const { data } = useContractRead({
    ...poolContract,
    functionName: 'name',
    // args: [parseEther("1"), reserveData?.[0]!, reserveData?.[1]!]
  });

  return (
    <div className="">
      <div className="flex items-center space-x-3">
        <ScaleIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
        <p className="m-0 text-2xl font-semibold">Deposit</p>
      </div>
      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">Contract: {router.query.id}</p>
      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">{reserveData ? formatEther(reserveData?.[0]) : 'error'}</p>
      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">Name: {data}</p>

      <div className="grid grid-cols-12">
        <div className="w-full mt-4 border border-neutral-200/50 dark:border-neutral-800 rounded-lg col-span-8">
          <div className="flex flex-col">
            <Input className="w-full" />
            <Button className="!mt-2">Deposit now</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
