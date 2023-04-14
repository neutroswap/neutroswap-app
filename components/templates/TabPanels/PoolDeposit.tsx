import { ERC20_ABI, NEUTRO_POOL_ABI, NEUTRO_ROUTER_ABI } from "@/shared/abi";
import {
  FACTORY_CONTRACT,
  MULTICALL_CONTRACT,
  ROUTER_CONTRACT,
} from "@/shared/helpers/contract";
import { Token } from "@/shared/types/tokens.types";
import { BigNumber } from "ethers";
import { formatEther, parseEther, parseUnits } from "ethers/lib/utils.js";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  TradeDirection,
  UniswapPair,
  UniswapPairFactory,
  UniswapPairSettings,
  UniswapVersion,
} from "simple-uniswap-sdk";
import { CloneUniswapContractDetailsV2 } from "simple-uniswap-sdk/dist/esm/factories/pair/models/clone-uniswap-contract-details";
import {
  useAccount,
  useContract,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useSigner,
} from "wagmi";
import debounce from "lodash/debounce";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { Button, Input, Spinner } from "@geist-ui/core";
import { Currency } from "@/shared/types/currency.types";
import dayjs from "dayjs";

type PoolDepositPanelProps = {
  balances: Currency[];
  token0: Token;
  token1: Token;
  priceRatio: [number, number]
};

const PoolDepositPanel: React.FC<PoolDepositPanelProps> = (props) => {
  const { balances, token0, token1, priceRatio } = props;

  const router = useRouter();
  const signer = useSigner();
  const { address } = useAccount();

  const [token0Amount, setToken0Amount] = useState<string>();
  const [token1Amount, setToken1Amount] = useState<string>();
  const [token0Min, setToken0Min] = useState(BigNumber.from(0));
  const [token1Min, setToken1Min] = useState(BigNumber.from(0));

  const [isToken0Approved, setIsToken0Approved] = useState(false);
  const [isToken1Approved, setIsToken1Approved] = useState(false);
  const [isFetchingToken0Price, setIsFetchingToken0Price] = useState(false);
  const [isFetchingToken1Price, setIsFetchingToken1Price] = useState(false);


  const [uniswapPairFactory, setUniswapPairFactory] =
    useState<UniswapPairFactory>();
  // TODO: move slippage to state or store
  const SLIPPAGE = 0.5; // in percent

  const neutroRouter = useContract({
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    signerOrProvider: signer.data
  })

  // useContractRead({
  //   enabled: Boolean(token1Amount),
  //   address: ROUTER_CONTRACT,
  //   abi: NEUTRO_ROUTER_ABI,
  //   functionName: "getAmountsOut",
  //   args: [
  //     !!token1Amount && parseEther(token1Amount),
  //     [token1.address, token0.address],
  //   ] as any,
  //   onSuccess(response) {
  //     console.log('getAmountsOut', [
  //       response[0].toString(),
  //       response[1].toString()
  //     ]);
  //   }
  // });

  const { refetch: refetchAllowance } = useContractReads({
    enabled: Boolean(address),
    contracts: [
      {
        address: token0.address,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address!, ROUTER_CONTRACT],
      },
      {
        address: token1.address,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address!, ROUTER_CONTRACT],
      },
    ],
    onSuccess(value) {
      setIsToken0Approved(+formatEther(value[0]) > 0);
      setIsToken1Approved(+formatEther(value[1]) > 0);
    },
  });

  const { config: approveConfig0 } = usePrepareContractWrite({
    address: token0.address,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      ROUTER_CONTRACT,
      BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { isLoading: isApprovingToken0, write: approveToken0 } =
    useContractWrite({
      ...approveConfig0,
      onSuccess(result) {
        result.wait().then((receipt) => console.log(receipt));
      },
    });

  const { config: approveConfig1 } = usePrepareContractWrite({
    address: token1.address,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      ROUTER_CONTRACT,
      BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { isLoading: isApprovingToken1, write: approveToken1 } =
    useContractWrite({
      ...approveConfig1,
      address: token1.address,
      onSuccess(result) {
        result.wait().then(() => refetchAllowance());
      },
    });

  const addLiquidityArgs: any = useMemo(
    () => [
      token0.address,
      token1.address,
      !!token0Amount && parseEther(token0Amount),
      !!token1Amount && parseEther(token1Amount),
      // !!token0Min && token0Min[1],
      token0Min,
      token1Min,
      address!,
      BigNumber.from(dayjs().add(5, 'minutes').unix()) // deadline
    ],
    [
      token0,
      token1,
      token0Amount,
      token1Amount,
      token0Min,
      token1Min,
      address,
    ]
  );

  const { config: addLiquidityConfig, isFetching: isSimulatingAddLiquidity } =
    usePrepareContractWrite({
      enabled: Boolean(!token0Min.isZero() || !token0Min.isZero()),
      address: ROUTER_CONTRACT,
      abi: NEUTRO_ROUTER_ABI,
      functionName: "addLiquidity",
      args: addLiquidityArgs,
      onError(error) {
        console.log('Error', error)
      },
    });
  const { isLoading: isAddingLiquidity, write: addLiquidity } =
    useContractWrite({
      ...addLiquidityConfig,
      onSuccess(result) {
        result.wait().then(() => refetchAllowance())
      }
    });

  let cloneUniswapContractDetailsV2: CloneUniswapContractDetailsV2 = useMemo(
    () => ({
      routerAddress: ROUTER_CONTRACT,
      routerAbi: NEUTRO_ROUTER_ABI as any,
      factoryAddress: FACTORY_CONTRACT,
      pairAddress: router.query.id as `0x${string}`,
    }),
    [router.query.id]
  );

  let customNetworkData = useMemo(
    () => ({
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
    }),
    []
  );

  let customPairSettings = useMemo(
    () =>
      new UniswapPairSettings({
        slippage: SLIPPAGE / 100,
        deadlineMinutes: 15,
        disableMultihops: true,
        cloneUniswapContractDetails: {
          v2Override: cloneUniswapContractDetailsV2,
        },
        uniswapVersions: [UniswapVersion.v2],
        customNetwork: customNetworkData,
      }),
    [cloneUniswapContractDetailsV2, customNetworkData]
  );

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
    })();
  }, [token0, token1, address, customPairSettings]);

  const handleToken0Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setToken0Amount(value);
    if (+value) debouncedToken0(value);
  };

  const debouncedToken0 = debounce(async (nextValue) => {
    if (!uniswapPairFactory) return new Error("No Uniswap Pair Factory");
    setIsFetchingToken1Price(true);

    // (r0 / r1) * amount0
    const amount = (priceRatio[1] * Number(nextValue)).toString();
    setToken1Amount(amount)

    // calculate token0Min
    const amountsOut0 = await neutroRouter?.getAmountsOut(
      parseEther(amount),
      [token1.address, token0.address]
    )
    if (!amountsOut0) throw new Error("Fail getAmountsOut0");
    const [, min0] = amountsOut0;
    setToken0Min(min0);

    // calculate token1Min
    const amountsOut1 = await neutroRouter?.getAmountsOut(
      parseEther(nextValue),
      [token0.address, token1.address]
    )
    if (!amountsOut1) throw new Error("Fail getAmountsOut1");
    const [, min1] = amountsOut1;
    setToken1Min(min1);

    // const min0 = parseEther(nextValue).mul(10000 - (SLIPPAGE * 100)).div(10000);
    // setToken0Min(min0);

    // let amount = (Number(nextValue) * priceRatio[0]).toFixed(18);
    // setToken1Amount(amount);
    // const min1 = parseEther(amount).mul(10000 - (SLIPPAGE * 100)).div(10000);
    // setToken1Min(min1);

    setIsFetchingToken1Price(false);
  }, 500);

  const handleToken1Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setToken1Amount(value);
    if (+value) debouncedToken1(value);
  };

  const debouncedToken1 = debounce(async (nextValue) => {
    if (!uniswapPairFactory) return new Error("No Uniswap Pair Factory");
    setIsFetchingToken0Price(true);
    // (r1 / r0) * amount1
    const amount = (priceRatio[0] * Number(nextValue)).toString();
    setToken0Amount(amount)
    // calculate token0Min
    const amountsOut0 = await neutroRouter?.getAmountsOut(
      parseEther(nextValue),
      [token1.address, token0.address]
    )
    if (!amountsOut0) throw new Error("Fail getAmountsOut0");
    const [, min0] = amountsOut0;
    setToken0Min(min0);

    // calculate token1Min
    const amountsOut1 = await neutroRouter?.getAmountsOut(
      parseEther(amount),
      [token0.address, token1.address]
    )
    if (!amountsOut1) throw new Error("Fail getAmountsOut1");
    const [, min1] = amountsOut1;
    setToken1Min(min1);
    setIsFetchingToken0Price(false);
  }, 500);

  // NOTE: Enable for debugging only
  // useEffect(() => {
  //   console.log([
  //     token0.address,
  //     token1.address,
  //     !!token0Amount && parseEther(token0Amount).toString(),
  //     !!token1Amount && parseEther(token1Amount).toString(),
  //     // !!token0Min && token0Min[1].toString(),
  //     token0Min.toString(),
  //     token1Min.toString(),
  //     address!,
  //     BigNumber.from(dayjs().add(5, 'minutes').unix()).toString() // deadline
  //   ])
  // }, [token0, token1, token0Amount, token1Amount, token0Min, token1Min, address, deadline])

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
            <p className="mt-0 mb-8 text-xl font-semibold">
              Select amount to deposit
            </p>
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
                <p className="m-0 text-neutral-500 text-sm">
                  Balance: {balances[0].formatted}
                </p>
                <Button
                  auto
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    setToken0Amount(formatEther(balances[0].raw));
                    debouncedToken0(formatEther(balances[0].raw));
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
                <p className="m-0 text-neutral-500 text-sm">
                  Balance: {balances[1].formatted}
                </p>
                <Button
                  auto
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    setToken1Amount(formatEther(balances[1].raw));
                    debouncedToken1(formatEther(balances[1].raw));
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
                    : !isToken1Approved && `Approve ${token1.symbol}`}
                </Button>
              )}
              {isToken0Approved && isToken1Approved && (
                <Button
                  scale={1.25}
                  className="!mt-2"
                  loading={isAddingLiquidity || isSimulatingAddLiquidity}
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
          <div className="flex flex-col space-y-2 p-7 border border-neutral-200/50 dark:border-neutral-800 rounded-lg "></div>
        </div>
      </div>
    </div>
  );
};

export default PoolDepositPanel;
