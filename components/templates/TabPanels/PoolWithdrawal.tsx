import {
  ERC20_ABI,
  NEUTRO_HELPER_ABI,
  NEUTRO_POOL_ABI,
  NEUTRO_ROUTER_ABI,
} from "@/shared/abi";
import {
  NEUTRO_HELPER_CONTRACT,
  ROUTER_CONTRACT,
} from "@/shared/helpers/contract";
import { Token } from "@/shared/types/tokens.types";
import { BigNumber } from "ethers";
import {
  formatEther,
  formatUnits,
  getAddress,
  parseEther,
  parseUnits,
} from "viem";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { Button, Input } from "@geist-ui/core";
import { Slider } from "@/components/elements/Slider";
import { Currency } from "@/shared/types/currency.types";
import dayjs from "dayjs";
import { tokens } from "@/shared/statics/tokenList";
import NativeTokenPicker from "@/components/modules/swap/NativeTokenPicker";
import {
  DEFAULT_CHAIN_ID,
  supportedChainID,
  SupportedChainID,
} from "@/shared/types/chain.types";
import { waitForTransaction } from "@wagmi/core";
import { classNames } from "@/shared/helpers/classNamer";

type PoolWithdrawalPanelProps = {
  balances: Currency[];
  token0: Token;
  token1: Token;
  totalLPSupply: bigint;
  userLPBalance: Currency;
  reserves: readonly [bigint, bigint, number] | undefined;
  refetchAllBalance: (options?: any) => Promise<any>;
  refetchUserBalances: (options?: any) => Promise<any>;
};

// TODO: move slippage to state or store
const SLIPPAGE = 50; //0.005;

const PoolWithdrawalPanel: React.FC<PoolWithdrawalPanelProps> = (props) => {
  const {
    token0,
    token1,
    totalLPSupply,
    userLPBalance,
    reserves,
    refetchAllBalance,
    refetchUserBalances,
  } = props;

  const router = useRouter();
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [token0Amount, setToken0Amount] = useState("");
  const [token1Amount, setToken1Amount] = useState("");
  const [percentage, setPercentage] = useState(33);
  const [amount, setAmount] = useState(BigInt(0));

  const [isLPTokenApproved, setIsLPTokenApproved] = useState(false);

  // TODO: MOVE THIS HOOKS
  const nativeToken = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID.id][0];
    if (!supportedChainID.includes(chain.id as any))
      return tokens[DEFAULT_CHAIN_ID.id][0];
    return tokens[chain.id as SupportedChainID][0];
  }, [chain]);

  const [isPreferNative, setIsPreferNative] = useState(
    token0.address === nativeToken.address ||
      token1.address === nativeToken.address
  );

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    enabled: Boolean(address && router.query.id),
    address: router.query.id as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address!, ROUTER_CONTRACT],
    onSuccess(value) {
      setIsLPTokenApproved(
        +formatEther(value) >= +formatEther(userLPBalance.raw)
      );
    },
  });

  const { data: totalValueOfLiquidity } = useContractRead({
    address: NEUTRO_HELPER_CONTRACT,
    abi: NEUTRO_HELPER_ABI,
    functionName: "getTokenPrice",
    args: [router.query.id as `0x${string}`],
  });

  const { config: approveLPTokenConfig } = usePrepareContractWrite({
    enabled: Boolean(router.query.id),
    address: router.query.id as `0x${string}`,
    abi: NEUTRO_POOL_ABI,
    functionName: "approve",
    args: [
      ROUTER_CONTRACT,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { isLoading: isApprovingLPToken, write: approveLPToken } =
    useContractWrite({
      ...approveLPTokenConfig,
      onSuccess: async (result) => {
        await waitForTransaction({ hash: result.hash, confirmations: 8 });
        await refetchAllowance();
      },
    });

  const {
    config: removeLiquidityConfig,
    isFetching: isSimulatingRemoveLiquidity,
  } = usePrepareContractWrite({
    enabled: Boolean(
      token0 && token1 && amount && !!token0Amount && !!token1Amount && address
    ),
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: "removeLiquidity",
    args: [
      token0.address, // tokenA
      token1.address, // tokenB
      amount, // liquidity
      parseUnits(token0Amount!.toString(), token0.decimal), // amountAMin
      parseUnits(token1Amount!.toString(), token1.decimal), // amountAMin
      // !!token0Amount ? parseEther(token0Amount!) : parseEther("0"), // amountAMin
      // !!token1Amount ? parseEther(token1Amount!) : parseEther("0"), // amountBMin
      address!, // address
      BigInt(dayjs().add(5, "minutes").unix()), // deadline
    ],
  });
  const { isLoading: isRemovingLiquidity, write: removeLiquidity } =
    useContractWrite({
      ...removeLiquidityConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        await refetchAllBalance();
        await refetchUserBalances();
      },
    });

  const {
    config: removeLiquidityETHConfig,
    isFetching: isSimulatingRemoveLiquidityETH,
  } = usePrepareContractWrite({
    enabled: Boolean(
      token0 && token1 && amount && !!token0Amount && !!token1Amount && address
    ),
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: "removeLiquidityETH",
    args: [
      token0.address === nativeToken.address ? token1.address : token0.address, // token
      amount, // liquidity
      token0.address === nativeToken.address
        ? parseUnits(token1Amount!.toString(), token1.decimal)
        : parseUnits(token0Amount!.toString(), token0.decimal), // amountTokenMin
      token0.address === nativeToken.address
        ? parseUnits(token0Amount!.toString(), token0.decimal)
        : parseUnits(token1Amount!.toString(), token1.decimal), // amountETHMin
      address!, // address
      BigInt(dayjs().add(5, "minutes").unix()), // deadline
    ],
    onError(err) {
      console.log(err);
    },
  });
  const { isLoading: isRemovingLiquidityETH, write: removeLiquidityETH } =
    useContractWrite({
      ...removeLiquidityETHConfig,
      onError(error, variables, context) {
        console.log(error, variables, context);
      },
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        await refetchAllBalance();
        await refetchUserBalances();
      },
    });

  // useEffect(() => {
  //   if (amount !== BigInt(0) || totalLPSupply !== BigInt(0)) return;
  //   const token0Value =
  //     (amount *
  //       totalLPSupply *
  //       poolBalances[0].raw *
  //       BigInt(10000 - SLIPPAGE)) /
  //     BigInt(10000);
  //   const token1Value =
  //     (amount *
  //       totalLPSupply *
  //       poolBalances[1].raw *
  //       BigInt(10000 - SLIPPAGE)) /
  //     BigInt(10000);
  //   setToken0Amount(formatUnits(token0Value, token0.decimal));
  //   setToken1Amount(formatUnits(token1Value, token1.decimal));
  // }, [token0, token1, amount, poolBalances, totalLPSupply, SLIPPAGE]);

  const updateExpectedAmounts = (withdrawAmount: bigint) => {
    const token0Value =
      (((withdrawAmount * reserves![0]) / totalLPSupply) *
        BigInt(10000 - SLIPPAGE)) /
      BigInt(10000);
    const token1Value =
      (((withdrawAmount * reserves![1]) / totalLPSupply) *
        BigInt(10000 - SLIPPAGE)) /
      BigInt(10000);

    setAmount(withdrawAmount);
    setToken0Amount(formatUnits(token0Value, token0.decimal));
    setToken1Amount(formatUnits(token1Value, token1.decimal));
  };

  const amountValue = parseFloat(formatEther(amount));
  const totalValueInLiquidity = parseFloat(
    formatEther(totalValueOfLiquidity ?? BigInt(0))
  );

  const totalValueInUsd = amountValue * totalValueInLiquidity;

  // NOTE: Enable for debugging only
  // useEffect(() => {
  //   console.log([
  //     token0.address, // tokenA
  //     token1.address, // tokenB
  //     amount.toString(), // liquidity
  //     !!token0Amount && parseEther(token0Amount!).toString(), // amountAMin
  //     !!token1Amount && parseEther(token1Amount!).toString(), // amountBMin
  //     address!, // address
  //     BigNumber.from(dayjs().add(5, 'minutes').unix()).toString() // deadline
  //   ])
  // }, [amount, token0, token1, token0Amount, token1Amount, token0Min, token1Min, address, deadline])

  return (
    <div className="">
      <div>
        <div className="flex items-center space-x-3">
          <ArrowUpTrayIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
          <p className="m-0 text-2xl font-semibold">Withdraw</p>
        </div>
        <p className="mt-2 mb-0 text-sm text-neutral-400 dark:text-neutral-600">
          Withdraw the tokens you&apos;ve provided as liquidity from the pool
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
        <div className="w-full mt-4 col-span-7">
          <p className="mt-0 mb-2 font-medium text-neutral-500 dark:text-neutral-400">
            Amount to withdraw
          </p>
          <div className="flex flex-col py-5 px-7 border border-neutral-200 dark:border-neutral-800 rounded-lg ">
            <div className="flex items-center justify-between mb-2">
              <span className="m-0 text-2xl font-semibold bg-transparent w-full">
                {formatEther(amount)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                ${totalValueInUsd.toFixed(2)}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Available {formatEther(userLPBalance.raw)}
              </span>
            </div>
            <Slider
              step={10}
              max={100}
              defaultValue={[percentage]}
              value={[percentage]}
              onValueChange={(value) => {
                setPercentage(value[0]);
              }}
              onValueCommit={(value) => {
                const withdrawAmount =
                  (userLPBalance.raw * BigInt(value[0])) / BigInt(100);
                updateExpectedAmounts(withdrawAmount);
              }}
            />
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Button
                auto
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                  "text-white dark:text-primary",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                scale={0.5}
                onClick={() => {
                  const percentage = 25;
                  setPercentage(percentage);
                  const withdrawAmount =
                    (userLPBalance.raw * BigInt(percentage)) / BigInt(100);
                  updateExpectedAmounts(withdrawAmount);
                }}
              >
                25%
              </Button>
              <Button
                auto
                scale={0.5}
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                  "text-white dark:text-primary",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                onClick={() => {
                  const percentage = 50;
                  setPercentage(percentage);

                  const withdrawAmount =
                    (userLPBalance.raw * BigInt(percentage)) / BigInt(100);
                  updateExpectedAmounts(withdrawAmount);
                }}
              >
                50%
              </Button>
              <Button
                auto
                scale={0.5}
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                  "text-white dark:text-primary",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                onClick={() => {
                  const percentage = 75;
                  setPercentage(percentage);

                  const withdrawAmount =
                    (userLPBalance.raw * BigInt(percentage)) / BigInt(100);
                  updateExpectedAmounts(withdrawAmount);
                }}
              >
                75%
              </Button>
              <Button
                auto
                scale={0.5}
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                  "text-white dark:text-primary",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                onClick={() => {
                  const percentage = 100;
                  setPercentage(percentage);
                  setAmount(userLPBalance.raw);
                  updateExpectedAmounts(userLPBalance.raw);
                }}
              >
                MAX
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full col-span-7">
          <p className="mt-0 mb-2 font-medium text-neutral-500 dark:text-neutral-400">
            Expected to receive
          </p>
          <div className="flex flex-col py-5 px-7 border border-neutral-200 dark:border-neutral-800 rounded-lg ">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 items-center">
                {token0.address !== nativeToken.address && (
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
                {token0.address === nativeToken.address && (
                  <NativeTokenPicker handlePreferNative={setIsPreferNative} />
                )}
              </div>
              <div className="flex space-x-2 items-center">
                <Input
                  scale={1.5}
                  className="w-full rounded-lg"
                  placeholder="0.00"
                  value={token0Amount}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex space-x-2 items-center">
                {token1.address !== nativeToken.address && (
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
                {token1.address === nativeToken.address && (
                  <NativeTokenPicker handlePreferNative={setIsPreferNative} />
                )}
              </div>
              <div className="flex space-x-2 items-center">
                <Input
                  scale={1.5}
                  className="w-full rounded-lg"
                  placeholder="0.00"
                  value={token1Amount}
                />
              </div>
            </div>

            <div className="flex flex-col w-full mt-4">
              {!isLPTokenApproved && (
                <Button
                  scale={1.25}
                  className={classNames(
                    "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                    "text-white dark:text-primary !normal-case",
                    "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                    "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                    "disabled:opacity-50"
                  )}
                  loading={isApprovingLPToken}
                  onClick={() => approveLPToken?.()}
                >
                  Approve LP Token
                </Button>
              )}
              {isLPTokenApproved && (
                <>
                  {!isPreferNative && (
                    <Button
                      name="removeLiquidity"
                      scale={1.25}
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-primary",
                        "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                        "disabled:opacity-50"
                      )}
                      loading={
                        isRemovingLiquidity || isSimulatingRemoveLiquidity
                      }
                      disabled={!removeLiquidity}
                      onClick={() => removeLiquidity?.()}
                    >
                      Withdraw
                    </Button>
                  )}
                  {isPreferNative && (
                    <Button
                      name="removeLiquidityETH"
                      scale={1.25}
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-primary",
                        "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                        "disabled:opacity-50"
                      )}
                      loading={
                        isRemovingLiquidityETH || isSimulatingRemoveLiquidityETH
                      }
                      disabled={!removeLiquidityETH}
                      onClick={() => removeLiquidityETH?.()}
                    >
                      Withdraw
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
                  isPreferNative: isPreferNative,
                  slippage: SLIPPAGE + "%",
                  isToken0WEOS: token0.address === nativeToken.address,
                  isToken1WEOS: token1.address === nativeToken.address,
                  token0Amount: token0Amount,
                  token1Amount: token1Amount,
                  LPbalance: formatEther(userLPBalance.raw),
                  LPAllowance: formatEther(allowance ?? BigInt(0)),
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

export default PoolWithdrawalPanel;
