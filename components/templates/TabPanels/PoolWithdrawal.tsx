import { ERC20_ABI, NEUTRO_POOL_ABI, NEUTRO_ROUTER_ABI } from "@/shared/abi";
import { FACTORY_CONTRACT, MULTICALL_CONTRACT, ROUTER_CONTRACT } from "@/shared/helpers/contract";
import { Token } from "@/shared/types/tokens.types";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { UniswapPair, UniswapPairFactory, UniswapPairSettings, UniswapVersion } from "simple-uniswap-sdk";
import { CloneUniswapContractDetailsV2 } from "simple-uniswap-sdk/dist/esm/factories/pair/models/clone-uniswap-contract-details";
import { useAccount, useContractRead, useContractReads, useContractWrite, usePrepareContractWrite } from "wagmi";
import debounce from "lodash/debounce";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { Button, Input, Spinner } from "@geist-ui/core";
import { Slider } from "@/components/elements/Slider";
import { Currency } from "@/shared/types/currency.types";
import dayjs from "dayjs";

type PoolWithdrawalPanelProps = {
  balances: Currency[],
  token0: Token,
  token1: Token,
}

const PoolWithdrawalPanel: React.FC<PoolWithdrawalPanelProps> = (props) => {
  const { balances, token0, token1 } = props;

  const router = useRouter();
  const { address } = useAccount();

  const [token0Amount, setToken0Amount] = useState<string>();
  const [token1Amount, setToken1Amount] = useState<string>();
  const [token1Min, setToken1Min] = useState("0");
  const [deadline, setDeadline] = useState(0);
  const [percentage, setPercentage] = useState(33);
  const [amount, setAmount] = useState<BigNumber>(BigNumber.from(0));
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

  const [isLPTokenApproved, setIsLPTokenApproved] = useState(false);

  const [uniswapPairFactory, setUniswapPairFactory] = useState<UniswapPairFactory>();
  // TODO: move slippage to state or store
  const SLIPPAGE = 0.0005;

  useContractReads({
    enabled: Boolean(address && router.query.id),
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
        address: token0.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [router.query.id as `0x${string}`]
      },
      {
        address: token1.address,
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

  const { refetch: refetchAllowance } = useContractRead({
    enabled: Boolean(address && router.query.id),
    address: router.query.id as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, ROUTER_CONTRACT],
    onSuccess(value) {
      setIsLPTokenApproved(+formatEther(value) > 0);
    },
  })

  const { config: approveLPTokenConfig } = usePrepareContractWrite({
    enabled: Boolean(router.query.id),
    address: router.query.id as `0x${string}`,
    abi: NEUTRO_POOL_ABI,
    functionName: 'approve',
    args: [
      ROUTER_CONTRACT,
      BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935")
    ]
  })
  const { isLoading: isApprovingLPToken, write: approveLPToken } = useContractWrite({
    ...approveLPTokenConfig,
    onSuccess(result) {
      result.wait().then(() => refetchAllowance())
    }
  })

  // const removeLiquidityArgs: any = useMemo(() => [
  //   token0.address, // tokenA
  //   token1.address, // tokenB
  //   amount, // liquidity
  //   parseEther(token0Amount!), // amountAMin
  //   parseEther(token1Amount!), // amountBMin
  //   address!, // address
  //   BigNumber.from(dayjs().add(5, 'minutes').unix()) // deadline
  // ], [amount, token0, token1, token0Amount, token1Amount, address]);

  const { config: removeLiquidityConfig } = usePrepareContractWrite({
    enabled: Boolean(token0 && token1 && amount && !!token0Amount && !!token1Amount && address && deadline),
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: 'removeLiquidity',
    args: [
      token0.address, // tokenA
      token1.address, // tokenB
      amount, // liquidity
      !!token0Amount ? parseEther(token0Amount!) : parseEther("0"), // amountAMin
      !!token1Amount ? parseEther(token1Amount!) : parseEther("0"), // amountBMin
      address!, // address
      BigNumber.from(dayjs().add(5, 'minutes').unix()) // deadline
    ]
  })
  const {
    isLoading: isRemovingLiquidity,
    write: removeLiquidity
  } = useContractWrite(removeLiquidityConfig)

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
    const trade = await uniswapPairFactory.trade(nextValue);
    setToken1Amount(trade.expectedConvertQuote);
    if (!trade.minAmountConvertQuote) return;
    setToken1Min(trade.minAmountConvertQuote)
    setDeadline(trade.tradeExpires);
  }, 500)

  const handleToken1Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value) || !+value) return;
    setToken1Amount(value);
    if (+value) debouncedToken1(value);
  }

  const debouncedToken1 = debounce(async (nextValue) => {
    if (!uniswapPairFactory) return new Error('No Uniswap Pair Factory');
    const trade = await uniswapPairFactory.trade(nextValue);
    setToken0Amount(trade.expectedConvertQuote);
    if (!trade.minAmountConvertQuote) return;
    setToken1Min(nextValue);
    setDeadline(trade.tradeExpires);
  }, 500)

  useEffect(() => {
    if (amount.isZero() || totalLPSupply.isZero()) return;
    const slippage = 50; // 0.50% slippage
    const token0 = amount.mul(poolBalances[0].raw).mul(10000 - slippage).div(10000).div(totalLPSupply);
    const token1 = amount.mul(poolBalances[1].raw).mul(10000 - slippage).div(10000).div(totalLPSupply);
    // console.log(Number(formatEther(token0Amount)).toFixed(6), Number(formatEther(token1Amount)).toFixed(6));
    setToken0Amount(formatEther(token0));
    setToken1Amount(formatEther(token1));
  }, [amount, poolBalances, totalLPSupply, uniswapPairFactory])

  // NOTE: Enable for debugging only
  useEffect(() => {
    console.log([
      token0.address, // tokenA
      token1.address, // tokenB
      amount.toString(), // liquidity
      !!token0Amount && parseEther(token0Amount!).toString(), // amountAMin
      !!token1Amount && parseEther(token1Amount!).toString(), // amountBMin
      address!, // address
      BigNumber.from(dayjs().add(5, 'minutes').unix()).toString() // deadline
    ])
  }, [amount, token0, token1, token0Amount, token1Amount, token0Min, token1Min, address, deadline])

  return (
    <div className="">
      <div>
        <div className="flex items-center space-x-3">
          <ArrowUpTrayIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
          <p className="m-0 text-2xl font-semibold">Withdraw</p>
        </div>
        <p className="mt-2 mb-0 text-sm text-neutral-400 dark:text-neutral-600">
          Deposit tokens to the pool to start earning trading fees
        </p>
      </div>
      {/* <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">Contract: {router.query.id}</p> */}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
        <div className="w-full mt-4 col-span-7">
          <p className="mt-0 mb-2 font-medium text-neutral-500 dark:text-neutral-400">Amount to withdraw</p>
          <div className="flex flex-col py-5 px-7 border border-neutral-200 dark:border-neutral-800 rounded-lg ">
            <div className="flex items-center justify-between mb-2">
              <span className="m-0 text-2xl font-semibold bg-transparent w-full">
                {formatEther(amount)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">$0</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Available {userLPBalance.formatted}</span>
            </div>
            <Slider
              step={10}
              max={100}
              defaultValue={[percentage]}
              value={[percentage]}
              onValueChange={(value) => {
                setPercentage(value[0])
              }}
              onValueCommit={(value) => {
                setAmount(userLPBalance.raw.mul(value[0]).div(100));
              }}
            />
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Button
                auto
                scale={0.5}
                className="bg-transparent"
                onClick={() => {
                  setPercentage(25)
                  setAmount(userLPBalance.raw.mul(25).div(100));
                }}
              >
                25%
              </Button>
              <Button
                auto
                scale={0.5}
                className="bg-transparent"
                onClick={() => {
                  setPercentage(50)
                  setAmount(userLPBalance.raw.mul(50).div(100));
                }}
              >
                50%
              </Button>
              <Button
                auto
                scale={0.5}
                className="bg-transparent"
                onClick={() => {
                  setPercentage(75)
                  setAmount(userLPBalance.raw.mul(75).div(100));
                }}
              >
                75%
              </Button>
              <Button
                auto
                scale={0.5}
                className="bg-transparent"
                onClick={() => {
                  setPercentage(100)
                  setAmount(userLPBalance.raw);
                }}
              >
                MAX
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full col-span-7">
          <p className="mt-0 mb-2 font-medium text-neutral-500 dark:text-neutral-400">Expected to receive</p>
          <div className="flex flex-col py-5 px-7 border border-neutral-200 dark:border-neutral-800 rounded-lg ">
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
                <Input
                  scale={1.5}
                  className="w-full rounded-lg"
                  placeholder="0.00"
                  value={token0Amount}
                  onChange={handleToken0Change}
                />
              </div>
            </div>

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
                <Input
                  scale={1.5}
                  className="w-full rounded-lg"
                  placeholder="0.00"
                  value={token1Amount}
                  onChange={handleToken1Change}
                />
              </div>
            </div>

            <div className="flex flex-col w-full mt-4">
              {!isLPTokenApproved && (
                <Button
                  scale={1.25}
                  className="!mt-2"
                  loading={isApprovingLPToken}
                  onClick={() => approveLPToken?.()}
                >
                  Approve LP token
                </Button>
              )}
              {isLPTokenApproved && (
                <Button
                  scale={1.25}
                  className="!mt-2"
                  loading={isRemovingLiquidity}
                  disabled={!removeLiquidity}
                  onClick={() => removeLiquidity?.()}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="hidden w-full mt-4 col-span-5">
          <div className="flex flex-col space-y-2 p-7 border border-neutral-200 dark:border-neutral-800 rounded-lg ">
          </div>
        </div>
      </div>
    </div >
  )
}

export default PoolWithdrawalPanel;
