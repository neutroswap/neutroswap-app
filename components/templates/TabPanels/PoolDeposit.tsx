import { ERC20_ABI, NEUTRO_ROUTER_ABI } from "@/shared/abi";
import { ROUTER_CONTRACT } from "@/shared/helpers/contract";
import { Token } from "@/shared/types/tokens.types";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "viem";
import { ChangeEvent, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import debounce from "lodash/debounce";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { Button, Input, Spinner } from "@geist-ui/core";
import { Currency } from "@/shared/types/currency.types";
import dayjs from "dayjs";
import NativeTokenPicker from "@/components/modules/swap/NativeTokenPicker";
import { currencyFormat } from "@/shared/utils";
import { tokens } from "@/shared/statics/tokenList";
import {
  DEFAULT_CHAIN_ID,
  supportedChainID,
  SupportedChainID,
} from "@/shared/types/chain.types";
import { parseBigNumber } from "@/shared/helpers/parseBigNumber";
import { useApprove } from "@/shared/hooks/useApprove";
import { useBalanceAndAllowance } from "@/shared/hooks/useBalanceAndAllowance";
import { waitForTransaction } from "@wagmi/core";

type PoolDepositPanelProps = {
  balances: Currency[];
  token0: Token;
  token1: Token;
  token0Amount: string;
  token1Amount: string;
  priceRatio: [number, number];
  refetchReserves: (options?: any) => Promise<any>;
  refetchAllBalance: (options?: any) => Promise<any>;
  refetchUserBalances: (options?: any) => Promise<any>;
  isNewPool: boolean;
};

const PoolDepositPanel: React.FC<PoolDepositPanelProps> = (props) => {
  const {
    balances,
    token0,
    token1,
    priceRatio,
    refetchReserves,
    refetchAllBalance,
    refetchUserBalances,
    isNewPool,
  } = props;

  const { chain } = useNetwork();
  const { address } = useAccount();

  const [token0Amount, setToken0Amount] = useState<string>("");
  const [token1Amount, setToken1Amount] = useState<string>("");
  const [token0Min, setToken0Min] = useState(BigInt(0));
  const [token1Min, setToken1Min] = useState(BigInt(0));

  const [isFetchingToken0Price, setIsFetchingToken0Price] = useState(false);
  const [isFetchingToken1Price, setIsFetchingToken1Price] = useState(false);

  // TODO: MOVE THIS HOOKS
  const nativeToken = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID][0];
    if (!supportedChainID.includes(chain.id.toString() as any))
      return tokens[DEFAULT_CHAIN_ID][0];
    return tokens[chain.id.toString() as SupportedChainID][0];
  }, [chain]);

  const [isPreferNative, setIsPreferNative] = useState(
    token0.address === nativeToken.address ||
      token1.address === nativeToken.address
  );

  // TODO: move slippage to state or store
  const SLIPPAGE = 500; // 1.5%

  const { data: balance, refetch: refetchBalanceETH } = useBalance({
    enabled: Boolean(address),
    address,
  });

  const neutroRouter = {
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
  };

  const {
    balance: balance0,
    allowance: allowance0,
    refetch: refetchBalanceAndAllowance0,
  } = useBalanceAndAllowance(token0.address);

  const {
    balance: balance1,
    allowance: allowance1,
    refetch: refetchBalanceAndAllowance1,
  } = useBalanceAndAllowance(token1.address);

  const { isLoading: isApprovingToken0, write: approveToken0 } = useApprove({
    address: token0.address,
    spender: ROUTER_CONTRACT,
    onSuccess: async () => {
      await refetchBalanceAndAllowance0();
    },
  });

  const { isLoading: isApprovingToken1, write: approveToken1 } = useApprove({
    address: token1.address,
    spender: ROUTER_CONTRACT,
    onSuccess: async () => {
      await refetchBalanceAndAllowance1();
    },
  });

  const { config: addLiquidityConfig, isFetching: isSimulatingAddLiquidity } =
    usePrepareContractWrite({
      enabled: Boolean(
        !isPreferNative &&
          token0Min !== BigInt(0) &&
          token1Min !== BigInt(0) &&
          Number(token0Amount) &&
          Number(token1Amount)
      ),
      address: ROUTER_CONTRACT,
      abi: NEUTRO_ROUTER_ABI,
      functionName: "addLiquidity",
      args: [
        token0.address,
        token1.address,
        parseUnits(token0Amount, token0.decimal),
        parseUnits(token1Amount, token1.decimal),
        token0Min,
        token1Min,
        address!,
        BigInt(dayjs().add(5, "minutes").unix()), // deadline
      ],
      onError(error) {
        console.log("Error", error);
      },
    });

  const { isLoading: isAddingLiquidity, write: addLiquidity } =
    useContractWrite({
      ...addLiquidityConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        await refetchAllBalance();
        await refetchUserBalances();
        await refetchReserves();
        setToken0Amount("");
        setToken1Amount("");
      },
    });

  const {
    config: addLiquidityETHConfig,
    isFetching: isSimulatingAddLiquidityETH,
  } = usePrepareContractWrite({
    enabled: Boolean(
      (token0.address === nativeToken.address ||
        token1.address === nativeToken.address) && // do not enable if none of the addr is WEOS
        isPreferNative
    ),
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: "addLiquidityETH",
    args: [
      token0.symbol === "WEOS" ? token1.address : token0.address, // token (address)
      token0.symbol === "WEOS"
        ? parseUnits(token1Amount, token1.decimal)
        : parseUnits(token0Amount, token0.decimal), // amountTokenDesired
      token0.symbol === "WEOS" ? token1Min : token0Min, // amountTokenMin
      token0.symbol === "WEOS" ? token0Min : token1Min, // amountETHMin
      address!, // to
      BigInt(dayjs().add(5, "minutes").unix()), // deadline
    ],
    value:
      token0.symbol === "WEOS"
        ? parseUnits(token0Amount, token0.decimal)
        : parseUnits(token1Amount, token1.decimal),
  });

  const { isLoading: isAddingLiquidityETH, write: addLiquidityETH } =
    useContractWrite({
      ...addLiquidityETHConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        await refetchAllBalance();
        await refetchUserBalances();
        await refetchBalanceETH();
        await refetchReserves();
        setToken0Amount("");
        setToken1Amount("");
      },
    });

  const handleToken0Change = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(+value)) return;
    setToken0Amount(value);

    if (isNewPool)
      return setToken0Min(
        (parseUnits(!!value ? value : "0", token0.decimal) *
          BigInt(10000 - SLIPPAGE)) /
          BigInt(10000)
      );
    else debouncedToken0(value);
  };

  const debouncedToken0 = debounce(async (nextValue) => {
    if (!Number(nextValue)) return setToken1Amount("");

    setIsFetchingToken1Price(true);
    try {
      // (r0 / r1) * amount0
      const amount = (priceRatio[1] * Number(nextValue)).toFixed(
        token1.decimal
      );
      setToken1Amount(amount);

      // calculate token0Min
      const amountsOut0 = await neutroRouter?.getAmountsOut(
        parseUnits(amount, token1.decimal),
        [token1.address, token0.address]
      );
      if (!amountsOut0) throw new Error("Fail getAmountsOut0");
      const [, min0] = amountsOut0;
      setToken0Min(min0);

      // calculate token1Min
      const amountsOut1 = await neutroRouter?.getAmountsOut(
        parseUnits(nextValue, token0.decimal),
        [token0.address, token1.address]
      );
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

    if (isNewPool)
      return setToken1Min(
        (parseUnits(!!value ? value : "0", token1.decimal) *
          BigInt(10000 - SLIPPAGE)) /
          BigInt(10000)
      );
    else debouncedToken1(value);
  };

  const debouncedToken1 = debounce(async (nextValue) => {
    if (!Number(nextValue)) return setToken0Amount("");

    setIsFetchingToken0Price(true);
    try {
      // (r1 / r0) * amount1
      const amount = (priceRatio[0] * Number(nextValue)).toFixed(
        token0.decimal
      );
      setToken0Amount(amount);
      // calculate token0Min
      const amountsOut0 = await neutroRouter?.getAmountsOut(
        parseUnits(nextValue, token1.decimal),
        [token1.address, token0.address]
      );
      if (!amountsOut0) throw new Error("Fail getAmountsOut0");
      const [, min0] = amountsOut0;
      setToken0Min(min0);

      // calculate token1Min
      const amountsOut1 = await neutroRouter?.getAmountsOut(
        parseUnits(amount, token0.decimal),
        [token0.address, token1.address]
      );
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
    let value: bigint;
    if (isPreferNative && token0.symbol === "WEOS" && balance)
      value = balance.value;
    else value = balances[0].raw;
    return Number(token0Amount) > +formatUnits(value, token0.decimal);
  };

  const isAmount1Invalid = () => {
    let value: bigint;
    if (isPreferNative && token1.symbol === "WEOS" && balance)
      value = balance.value;
    else value = balances[1].raw;
    return Number(token1Amount) > +formatUnits(value, token1.decimal);
  };

  const isToken0NeedApproval = useMemo(() => {
    if (isPreferNative && token0.address === nativeToken.address) return false;
    if (!allowance0) return true;
    return +formatUnits(allowance0, token0.decimal) < Number(token0Amount);
  }, [token0, isPreferNative, nativeToken, allowance0, token0Amount]);

  const isToken1NeedApproval = useMemo(() => {
    if (isPreferNative && token1.address === nativeToken.address) return false;
    if (!allowance1) return true;
    return +formatUnits(allowance1, token1.decimal) < Number(token1Amount);
  }, [token1, isPreferNative, nativeToken, allowance1, token1Amount]);

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
                    Balance:{" "}
                    {isPreferNative && balance
                      ? currencyFormat(+balance?.formatted)
                      : balances[0].formatted}
                  </p>
                )}
                <Button
                  auto
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    const value =
                      balance && isPreferNative && token0.symbol === "WEOS"
                        ? balance.value
                        : balances[0].raw;
                    setToken0Amount(formatUnits(value, token0.decimal));
                    if (!isNewPool)
                      debouncedToken0(formatUnits(value, token0.decimal));
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
                    Balance:{" "}
                    {isPreferNative && balance
                      ? currencyFormat(+balance?.formatted)
                      : balances[1].formatted}
                  </p>
                )}
                <Button
                  auto
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    const value =
                      balance && isPreferNative && token1.symbol === "WEOS"
                        ? balance.value
                        : balances[1].raw;
                    setToken1Amount(formatUnits(value, token1.decimal));
                    if (!isNewPool)
                      debouncedToken1(formatUnits(value, token1.decimal));
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
                    : !isToken1NeedApproval && `Approve ${token1.symbol}`}
                </Button>
              )}
              {!isToken0NeedApproval && !isToken1NeedApproval && (
                <>
                  {isPreferNative && (
                    <Button
                      name="addLiquidityETH"
                      scale={1.25}
                      className="!mt-2"
                      loading={
                        isAddingLiquidityETH || isSimulatingAddLiquidityETH
                      }
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
        {process.env.NODE_ENV !== "production" && (
          <div className="w-full mt-4 col-span-5">
            <pre>
              {JSON.stringify(
                {
                  token0: token0.address,
                  token0_allowance: allowance0.toString(),
                  isToken0NeedApproval: isToken0NeedApproval,
                  token1: token1.address,
                  token1_allowance: formatUnits(allowance1, token1.decimal),
                  isToken1NeedApproval: isToken1NeedApproval,
                  isPreferNative: isPreferNative,
                  slippage: (SLIPPAGE / 10000) * 100 + "%",
                  isToken0WEOS: token0.address === nativeToken.address,
                  isToken1WEOS: token1.address === nativeToken.address,
                  token0Amount: token0Amount,
                  token1Amount: token1Amount,
                  token0Min: formatUnits(token0Min, token0.decimal),
                  token1Min: formatUnits(token1Min, token1.decimal),
                },
                null,
                4
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolDepositPanel;
