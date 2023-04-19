import { ERC20_ABI, NEUTRO_ROUTER_ABI } from "@/shared/abi";
import {
  ROUTER_CONTRACT,
} from "@/shared/helpers/contract";
import { Token } from "@/shared/types/tokens.types";
import { BigNumber } from "ethers";
import { formatEther, getAddress, parseEther } from "ethers/lib/utils.js";
import { ChangeEvent, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useContract,
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
import NativeTokenPicker from "@/components/modules/swap/NativeTokenPicker";
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import { tokens } from "@/shared/statics/tokenList";

type PoolDepositPanelProps = {
  balances: Currency[],
  token0: Token,
  token1: Token,
  priceRatio: [number, number],
  refetchAllBalance: (options?: any) => Promise<any>;
  refetchUserBalances: (options?: any) => Promise<any>;
};

const NATIVE_TOKEN_ADDRESS = getAddress(tokens[0].address);
const PoolDepositPanel: React.FC<PoolDepositPanelProps> = (props) => {
  const { balances, token0, token1, priceRatio, refetchAllBalance, refetchUserBalances } = props;

  const signer = useSigner();
  const { address } = useAccount();

  const [token0Amount, setToken0Amount] = useState<string>();
  const [token1Amount, setToken1Amount] = useState<string>();
  const [token0Min, setToken0Min] = useState(BigNumber.from(0));
  const [token1Min, setToken1Min] = useState(BigNumber.from(0));

  const [isPreferNative, setIsPreferNative] = useState(true);
  const [isToken0Approved, setIsToken0Approved] = useState(false);
  const [isToken1Approved, setIsToken1Approved] = useState(false);
  const [isFetchingToken0Price, setIsFetchingToken0Price] = useState(false);
  const [isFetchingToken1Price, setIsFetchingToken1Price] = useState(false);


  const parseBigNumber = (value?: string): BigNumber => {
    const parsedValue = (!!value && !!Number(value)) ? value : "0"
    return parseEther(parsedValue);
  }

  // TODO: move slippage to state or store
  const SLIPPAGE = 0.5; // in percent

  const { data: balance, refetch: refetchBalanceETH } = useBalance({
    enabled: Boolean(address),
    address
  })

  const neutroRouter = useContract({
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    signerOrProvider: signer.data
  })

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
      console.log('allowance', [formatEther(value[0]), formatEther(value[1])])
      setIsToken0Approved(+formatEther(value[0]) > balances[0].decimal);
      setIsToken1Approved(+formatEther(value[1]) > balances[1].decimal);
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
      onSuccess: async (result) => {
        await result.wait()
        await refetchAllowance()
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
      onSuccess: async (result) => {
        await result.wait()
        await refetchAllowance()
      },
    });

  const { config: addLiquidityConfig, isFetching: isSimulatingAddLiquidity } =
    usePrepareContractWrite({
      enabled: Boolean(
        !isPreferNative &&
        !token0Min.isZero() &&
        !token1Min.isZero() &&
        Boolean(Number(token0Amount)) &&
        Boolean(Number(token1Amount))
      ),
      address: ROUTER_CONTRACT,
      abi: NEUTRO_ROUTER_ABI,
      functionName: "addLiquidity",
      args: [
        token0.address,
        token1.address,
        parseBigNumber(token0Amount),
        parseBigNumber(token1Amount),
        token0Min,
        token1Min,
        address!,
        BigNumber.from(dayjs().add(5, 'minutes').unix()) // deadline
      ],
      onError(error) {
        console.log('Error', error)
      },
    });
  const { isLoading: isAddingLiquidity, write: addLiquidity } =
    useContractWrite({
      ...addLiquidityConfig,
      onSuccess: async (tx) => {
        await tx.wait()
        await refetchAllBalance();
        await refetchUserBalances();
        setToken0Amount("")
        setToken1Amount("")
      }
    });

  const { config: addLiquidityETHConfig, isFetching: isSimulatingAddLiquidityETH } =
    usePrepareContractWrite({
      enabled: Boolean(
        (token0.address === NATIVE_TOKEN_ADDRESS || token1.address === NATIVE_TOKEN_ADDRESS) && // do not enable if none of the addr is WEOS
        // Boolean(Number(token0Amount)) &&
        // Boolean(Number(token1Amount)) &&
        isPreferNative
      ),
      address: ROUTER_CONTRACT,
      abi: NEUTRO_ROUTER_ABI,
      functionName: "addLiquidityETH",
      args: [
        token0.symbol === "WEOS" ? token1.address : token0.address, // token (address)
        token0.symbol === "WEOS" ? parseBigNumber(token1Amount) : parseBigNumber(token0Amount), // amountTokenDesired
        token0.symbol === "WEOS" ? token1Min : token0Min, // amountTokenMin
        token0.symbol === "WEOS" ? token0Min : token1Min, // amountETHMin
        address!, // to
        BigNumber.from(dayjs().add(5, 'minutes').unix()) // deadline
      ],
      overrides: {
        value: token0.symbol === "WEOS" ? parseBigNumber(token0Amount) : parseBigNumber(token1Amount),
      },
      onError(error) {
        console.log('Error', error)
      },
    });
  const { isLoading: isAddingLiquidityETH, write: addLiquidityETH } =
    useContractWrite({
      ...addLiquidityETHConfig,
      onSuccess: async (tx) => {
        await tx.wait()
        await refetchAllBalance();
        await refetchUserBalances();
        await refetchBalanceETH();
        setToken0Amount("")
        setToken1Amount("")
      }
    });

  const handleToken0Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setToken0Amount(value);
    debouncedToken0(value);
  };

  const debouncedToken0 = debounce(async (nextValue) => {
    if (!Number(nextValue)) return setToken1Amount("");

    setIsFetchingToken1Price(true);
    try {
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
      setIsFetchingToken1Price(false);
    } catch (error) {
      setIsFetchingToken1Price(false);
    }
  }, 500);

  const handleToken1Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setToken1Amount(value);
    debouncedToken1(value);
  };

  const debouncedToken1 = debounce(async (nextValue) => {
    if (!Number(nextValue)) return setToken0Amount("");

    setIsFetchingToken0Price(true);
    try {
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
    } catch (error) {
      setIsFetchingToken0Price(false);
    }
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

  const isAmount0Invalid = () => {
    let value: BigNumber;
    if (isPreferNative && token0.symbol === "WEOS" && balance) value = balance.value;
    else value = balances[0].raw
    return Number(token0Amount) > +formatEther(value)
  }

  const isAmount1Invalid = () => {
    let value: BigNumber;
    if (isPreferNative && token1.symbol === "WEOS" && balance) value = balance.value;
    else value = balances[1].raw
    return Number(token1Amount) > +formatEther(value)
  }

  const isToken0NeedApproval = useMemo(() => {
    if (isPreferNative && (token0.address === NATIVE_TOKEN_ADDRESS)) return false;
    return !isToken0Approved;
  }, [token0.address, isToken0Approved, isPreferNative])

  const isToken1NeedApproval = useMemo(() => {
    if (isPreferNative && (token1.address === NATIVE_TOKEN_ADDRESS)) return false;
    return !isToken1Approved;
  }, [token1.address, isToken1Approved, isPreferNative])

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
        <div className="w-full col-span-7">
          <p className="mt-0 mb-2 font-medium text-neutral-500 dark:text-neutral-400">
            Select amount to deposit
          </p>
          <div className="flex flex-col py-5 px-7 border border-neutral-200/50 dark:border-neutral-800 rounded-lg ">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 items-center">
                {token0.symbol !== "WEOS" && (
                  <>
                    <img
                      alt={`${token0.symbol} Icon`}
                      src={token0.logo}
                      className="h-6 rounded-full"
                      onError={(e) => {
                        handleImageFallback(token0.symbol, e);
                      }}
                    />
                    <p className="m-0 font-bold">{token0.symbol}</p>
                  </>
                )}
                {token0.symbol === "WEOS" && (
                  <NativeTokenPicker handlePreferNative={setIsPreferNative} />
                )}
              </div>
              <div className="flex space-x-2 items-center">
                {token0.symbol !== "WEOS" && (
                  <p className="m-0 text-neutral-500 text-sm">
                    Balance: {balances[0].formatted}
                  </p>
                )}
                {token0.symbol === "WEOS" && (
                  <p className="m-0 text-neutral-500 text-sm">
                    Balance: {(isPreferNative && balance) ? currencyFormat(+balance?.formatted) : balances[0].formatted}
                  </p>
                )}
                <Button
                  auto
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    const value = (balance && isPreferNative && token0.symbol === "WEOS") ? balance.value : balances[0].raw
                    setToken0Amount(formatEther(value));
                    debouncedToken0(formatEther(value));
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
              type={isAmount0Invalid() ? "error" : "default"}
            />
            {isAmount0Invalid() && (
              <small className="mt-1 text-red-500">Insufficient balance</small>
            )}

            <div className="flex items-center justify-between mt-6">
              <div className="flex space-x-2 items-center">
                {token1.symbol !== "WEOS" && (
                  <>
                    <img
                      alt={`${token1.symbol} Icon`}
                      src={token1.logo}
                      className="h-6 rounded-full"
                      onError={(e) => {
                        handleImageFallback(token1.symbol, e);
                      }}
                    />
                    <p className="m-0 font-bold">{token1.symbol}</p>
                  </>
                )}
                {token1.symbol === "WEOS" && (
                  <NativeTokenPicker handlePreferNative={setIsPreferNative} />
                )}
              </div>
              <div className="flex space-x-2 items-center">
                {token1.symbol !== "WEOS" && (
                  <p className="m-0 text-neutral-500 text-sm">
                    Balance: {balances[1].formatted}
                  </p>
                )}
                {token1.symbol === "WEOS" && (
                  <p className="m-0 text-neutral-500 text-sm">
                    Balance: {(isPreferNative && balance) ? currencyFormat(+balance?.formatted) : balances[1].formatted}
                  </p>
                )}
                <Button
                  auto
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    const value = (balance && isPreferNative && token1.symbol === "WEOS") ? balance.value : balances[1].raw;
                    setToken1Amount(formatEther(value));
                    debouncedToken1(formatEther(value));
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
              type={isAmount1Invalid() ? "error" : "default"}
            />
            {isAmount1Invalid() && (
              <small className="mt-1 text-red-500">Insufficient balance</small>
            )}

            <div className="flex flex-col w-full mt-4">
              {(isToken0NeedApproval || isToken1NeedApproval) && (
                <Button
                  scale={1.25}
                  className="!mt-2"
                  loading={isApprovingToken0 || isApprovingToken1}
                  onClick={() => {
                    if (isToken0NeedApproval) return approveToken0?.();
                    if (isToken1NeedApproval) return approveToken1?.();
                  }}
                >
                  {isToken0NeedApproval
                    ? `Approve ${token0.symbol}`
                    : !isToken1Approved && `Approve ${token1.symbol}`}
                </Button>
              )}
              {!isToken0NeedApproval && !isToken1NeedApproval && (
                <>
                  {isPreferNative && (
                    <Button
                      name="addLiquidityETH"
                      scale={1.25}
                      className="!mt-2"
                      loading={isAddingLiquidityETH || isSimulatingAddLiquidityETH}
                      disabled={!addLiquidityETH}
                      onClick={() => addLiquidityETH?.()}
                    >
                      Deposit Now
                    </Button>
                  )}
                  {!isPreferNative && (
                    <Button
                      name="addLiquidity"
                      scale={1.25}
                      className="!mt-2"
                      loading={isAddingLiquidity || isSimulatingAddLiquidity}
                      disabled={!addLiquidity}
                      onClick={() => addLiquidity?.()}
                    >
                      Deposit Now
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {/*  NOTE: FOR DEBUGGING ONLY */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="w-full mt-4 col-span-5">
            <pre>
              {JSON.stringify({
                isPreferNative: isPreferNative,
                slippage: SLIPPAGE + "%",
                isToken0WEOS: token0.address === NATIVE_TOKEN_ADDRESS,
                isToken1WEOS: token1.address === NATIVE_TOKEN_ADDRESS,
                token0Amount: token0Amount,
                token1Amount: token1Amount,
                token0Min: formatEther(token0Min),
                token1Min: formatEther(token1Min),
              }, null, 4)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolDepositPanel;
