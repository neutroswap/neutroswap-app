import { classNames } from "@/shared/helpers/classNames";
import { Text, Button, useTheme, Input, Spinner } from "@geist-ui/core";
import { Tab } from "@headlessui/react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { ArrowDownTrayIcon, ScaleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";

import NoContentDark from "@/public/states/empty/dark.svg"
import NoContentLight from "@/public/states/empty/light.svg"
import { useAccount, useContractRead, useContractReads, useContractWrite, usePrepareContractWrite } from "wagmi";
import { ERC20_ABI, NEUTRO_POOL_ABI, NEUTRO_ROUTER_ABI } from "@/shared/abi";
import { UniswapPair, UniswapPairFactory, UniswapPairSettings, UniswapVersion } from "simple-uniswap-sdk";
import { FACTORY_CONTRACT, MULTICALL_CONTRACT, ROUTER_CONTRACT } from "@/shared/helpers/contract";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import debounce from "lodash/debounce";
import { BigNumber } from "ethers";
import { CloneUniswapContractDetailsV2 } from "simple-uniswap-sdk/dist/esm/factories/pair/models/clone-uniswap-contract-details";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { Token } from "@/shared/types/tokens.types";

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

  useEffect(() => {
    if (!address) return;
    (async () => {
      const req = await fetch(`/api/getUserLP?userAddress=${address}`)
      const response = await req.json()
      console.log('userLP', response);
    })()
  }, [address])

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

type PoolDepositPanelProps = {
  balances: number[],
  token0: Token,
  token1: Token,
}

const PoolDepositPanel: React.FC<PoolDepositPanelProps> = (props) => {
  const { balances, token0, token1 } = props;

  const router = useRouter();
  const { address } = useAccount();

  const [token0Amount, setToken0Amount] = useState<string>();
  const [token1Amount, setToken1Amount] = useState<string>();
  const [token1Min, setToken1Min] = useState("0");
  const [deadline, setDeadline] = useState(0);

  const [isToken0Approved, setIsToken0Approved] = useState(false);
  const [isToken1Approved, setIsToken1Approved] = useState(false);
  const [isFetchingToken0Price, setIsFetchingToken0Price] = useState(false);
  const [isFetchingToken1Price, setIsFetchingToken1Price] = useState(false);

  const [uniswapPairFactory, setUniswapPairFactory] = useState<UniswapPairFactory>();
  // TODO: move slippage to state or store
  const SLIPPAGE = 0.0005;

  const { data: token0Min } = useContractRead({
    enabled: Boolean(token1Amount),
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [
      !!token1Amount && parseEther(token1Amount),
      [token1.address, token0.address]
    ] as any
  })

  const { refetch: refetchAllowance } = useContractReads({
    enabled: Boolean(address),
    contracts: [
      { address: token0.address, abi: ERC20_ABI, functionName: 'allowance', args: [address!, ROUTER_CONTRACT] },
      { address: token1.address, abi: ERC20_ABI, functionName: 'allowance', args: [address!, ROUTER_CONTRACT] },
    ],
    onSuccess(value) {
      setIsToken0Approved(+formatEther(value[0]) > 0);
      setIsToken1Approved(+formatEther(value[1]) > 0);
    },
  })

  const { config: approveConfig0 } = usePrepareContractWrite({
    address: token0.address,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [
      ROUTER_CONTRACT,
      BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935")
    ]
  })
  const { isLoading: isApprovingToken0, write: approveToken0 } = useContractWrite({
    ...approveConfig0,
    onSuccess(result) {
      result.wait().then(() => refetchAllowance())
    }
  })

  const { config: approveConfig1 } = usePrepareContractWrite({
    address: token1.address,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [
      ROUTER_CONTRACT,
      BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935")
    ]
  })
  const { isLoading: isApprovingToken1, write: approveToken1 } = useContractWrite({
    ...approveConfig1,
    address: token1.address,
    onSuccess(result) {
      result.wait().then(() => refetchAllowance())
    }
  })

  const addLiquidityArgs: any = useMemo(() => [
    token0.address,
    token1.address,
    !!token0Amount && parseEther(token0Amount),
    !!token1Amount && parseEther(token1Amount),
    !!token0Min && token0Min[1],
    parseEther(token1Min),
    address!,
    BigNumber.from(deadline)
  ], [token0, token1, token0Amount, token1Amount, token1Min, address, deadline, token0Min]);

  const { config: addLiquidityConfig } = usePrepareContractWrite({
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: 'addLiquidity',
    args: addLiquidityArgs
  })
  const {
    isLoading: isAddingLiquidity,
    write: addLiquidity
  } = useContractWrite(addLiquidityConfig)

  let cloneUniswapContractDetailsV2: CloneUniswapContractDetailsV2 = useMemo(() => ({
    routerAddress: ROUTER_CONTRACT,
    routerAbi: NEUTRO_ROUTER_ABI as any,
    factoryAddress: FACTORY_CONTRACT,
    pairAddress: router.query.id as `0x${string}`,
  }), [router.query.id]);

  let customNetworkData = useMemo(() => ({
    nameNetwork: "EOS EVM Testnet",
    multicallContractAddress: MULTICALL_CONTRACT,
    nativeCurrency: {
      name: "EOS",
      symbol: "EOS",
    },
    nativeWrappedTokenInfo: {
      chainId: 15557,
      contractAddress: "0x6cCC5AD199bF1C64b50f6E7DD530d71402402EB6",
      decimals: 18,
      symbol: "WEOS",
      name: "Wrapped EOS",
    },
  }), []);

  let customPairSettings = useMemo(() => new UniswapPairSettings({
    slippage: SLIPPAGE,
    deadlineMinutes: 5,
    disableMultihops: true,
    cloneUniswapContractDetails: {
      v2Override: cloneUniswapContractDetailsV2,
    },
    uniswapVersions: [UniswapVersion.v2],
    customNetwork: customNetworkData,
  }), [cloneUniswapContractDetailsV2, customNetworkData])

  useEffect(() => {
    if (!address) return;
    (async () => {
      const uniswapPair = new UniswapPair({
        fromTokenContractAddress: token0.address,
        toTokenContractAddress: token1.address,
        ethereumAddress: address as string,
        chainId: 15557,
        providerUrl: "https://api-testnet2.trust.one/",
        settings: customPairSettings,
      });
      const pairFactory = await uniswapPair.createFactory();
      setUniswapPairFactory(pairFactory);
    })()
  }, [token0, token1, address, customPairSettings])

  const handleToken0Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setToken0Amount(value);
    if (+value) debouncedToken0(value)
  }

  const debouncedToken0 = debounce(async (nextValue) => {
    if (!uniswapPairFactory) return new Error('No Uniswap Pair Factory');
    setIsFetchingToken1Price(true);
    const trade = await uniswapPairFactory.trade(nextValue);
    setToken1Amount(trade.expectedConvertQuote);
    if (!trade.minAmountConvertQuote) return;
    setToken1Min(trade.minAmountConvertQuote)
    setDeadline(trade.tradeExpires);
    setIsFetchingToken1Price(false);
  }, 500)

  const handleToken1Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value) || !+value) return;
    setToken1Amount(value);
    if (+value) debouncedToken1(value);
  }

  const debouncedToken1 = debounce(async (nextValue) => {
    if (!uniswapPairFactory) return new Error('No Uniswap Pair Factory');
    setIsFetchingToken0Price(true);
    const trade = await uniswapPairFactory.trade(nextValue);
    setToken0Amount(trade.expectedConvertQuote);
    if (!trade.minAmountConvertQuote) return;
    setToken1Min(nextValue);
    setDeadline(trade.tradeExpires);
    setIsFetchingToken0Price(false);
  }, 500)

  // NOTE: Enable for debugging only
  // useEffect(() => {
  //   console.log([
  //     pairs?.[0],
  //     pairs?.[1],
  //     !!token0Amount && parseEther(token0Amount).toString(),
  //     !!token1Amount && parseEther(token1Amount).toString(),
  //     !!token0Min && token0Min[1].toString(),
  //     parseEther(token1Min).toString(),
  //     address!,
  //     BigNumber.from(deadline).toString()
  //   ])
  // }, [pairs, token0Amount, token1Amount, token0Min, token1Min, address, deadline])

  return (
    <div className="">
      <div>
        <div className="flex items-center space-x-3">
          <ArrowDownTrayIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
          <p className="m-0 text-2xl font-semibold">Deposit</p>
        </div>
        <p className="mt-2 mb-0 text-sm text-neutral-400 dark:text-neutral-600">
          Deposit tokens to the pool to start earning trading fees
        </p>
      </div>
      {/* <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">Contract: {router.query.id}</p> */}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-8">
        <div className="w-full mt-4 col-span-7">
          <div className="flex flex-col py-5 px-7 border border-neutral-200/50 dark:border-neutral-800 rounded-lg ">
            <p className="mt-0 mb-8 text-xl font-semibold">Select amount to deposit</p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 items-center">
                <img
                  alt={`${token0.symbol} Icon`}
                  src={token0.logo}
                  className="h-6 rounded-full"
                  onError={(e) => {
                    handleImageFallback(token0.symbol, e);
                  }}
                />
                <p className="m-0 font-bold">{token0.symbol}</p>
              </div>
              <div className="flex space-x-2 items-center">
                <p className="m-0 text-neutral-500 text-sm">Balance: {balances[0]}</p>
                <Button
                  auto
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    setToken0Amount(formatEther(parseEther(balances[0].toString())))
                    debouncedToken0(formatEther(parseEther(balances[0].toString())))
                  }}
                >
                  MAX
                </Button>
              </div>
            </div>
            <Input
              scale={1.5}
              className="w-full rounded-lg mt-3"
              placeholder="0.00"
              value={token0Amount}
              onChange={handleToken0Change}
              iconRight={isFetchingToken0Price ? <Spinner /> : <></>}
            />

            <div className="flex items-center justify-between mt-6">
              <div className="flex space-x-2 items-center">
                <img
                  alt={`${token1.symbol} Icon`}
                  src={token1.logo}
                  className="h-6 rounded-full"
                  onError={(e) => {
                    handleImageFallback(token1.symbol, e);
                  }}
                />
                <p className="m-0 font-bold">{token1.symbol}</p>
              </div>
              <div className="flex space-x-2 items-center">
                <p className="m-0 text-neutral-500 text-sm">Balance: {balances[1]}</p>
                <Button
                  auto
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    setToken1Amount(formatEther(parseEther(balances[1].toString())))
                    debouncedToken1(formatEther(parseEther(balances[1].toString())))
                  }}
                >
                  MAX
                </Button>
              </div>
            </div>
            <Input
              scale={1.5}
              className="w-full rounded-lg mt-3"
              placeholder="0.00"
              value={token1Amount}
              onChange={handleToken1Change}
              iconRight={isFetchingToken1Price ? <Spinner /> : <></>}
            />

            <div className="flex flex-col w-full mt-4">
              {(!isToken0Approved || !isToken1Approved) && (
                <Button
                  scale={1.25}
                  className="!mt-2"
                  loading={isApprovingToken0 || isApprovingToken1}
                  onClick={() => {
                    if (!isToken0Approved) return approveToken0?.();
                    if (!isToken1Approved) return approveToken1?.();
                  }}
                >
                  {!isToken0Approved
                    ? `Approve ${token0.symbol}`
                    : !isToken1Approved && `Approve ${token1.symbol}`
                  }
                </Button>
              )}
              {(isToken0Approved && isToken1Approved) && (
                <Button
                  scale={1.25}
                  className="!mt-2"
                  loading={isAddingLiquidity}
                  disabled={!addLiquidity}
                  onClick={() => addLiquidity?.()}
                >
                  Deposit Now
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="hidden w-full mt-4 col-span-5">
          <div className="flex flex-col space-y-2 p-7 border border-neutral-200/50 dark:border-neutral-800 rounded-lg ">
          </div>
        </div>
      </div>
    </div >
  )
}
