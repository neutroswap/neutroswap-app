import { ERC20_ABI, NEUTRO_ROUTER_ABI } from "@/shared/abi";
import { ROUTER_CONTRACT } from "@/shared/helpers/contract";
import { Token } from "@/shared/types/tokens.types";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "viem";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { Button, Input, Spinner } from "@geist-ui/core";
import { Currency } from "@/shared/types/currency.types";
import dayjs from "dayjs";
import NativeTokenPicker from "@/components/modules/Swap/NativeTokenPicker";
import { currencyFormat } from "@/shared/utils";
import { isWrappedNative, tokens } from "@/shared/statics/tokenList";
import {
  DEFAULT_CHAIN_ID,
  supportedChainID,
  SupportedChainID,
} from "@/shared/types/chain.types";
import { useApprove } from "@/shared/hooks/useApprove";
import { useBalanceAndAllowance } from "@/shared/hooks/useBalanceAndAllowance";
import { getContract, waitForTransaction } from "@wagmi/core";
import { useAddLiquidity } from "@/shared/hooks/useAddLiquidityETH";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Tabs, TabsList, TabsTrigger } from "@/components/elements/Tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { ResponsiveDialog } from "@/components/modules/ResponsiveDialog";
import { useRouter } from "next/router";
import { CreatePositionModal } from "@/components/modules/CreatePosition";
import { classNames } from "@/shared/helpers/classNamer";

export type PoolDepositPanelProps = {
  balances: Currency[];
  token0: Token;
  token1: Token;
  // token0Amount: string;
  // token1Amount: string;
  priceRatio: [number, number];
  reserves: readonly [bigint, bigint, number] | undefined;
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
    reserves,
    refetchReserves,
    refetchAllBalance,
    refetchUserBalances,
    isNewPool,
  } = props;

  const { chain } = useNetwork();
  const { address } = useAccount();
  const router = useRouter();

  const [token0Amount, setToken0Amount] = useState<string>("");
  const [token1Amount, setToken1Amount] = useState<string>("");
  const [token0Min, setToken0Min] = useState(BigInt(0));
  const [token1Min, setToken1Min] = useState(BigInt(0));

  const [isFetchingToken0Price, setIsFetchingToken0Price] = useState(false);
  const [isFetchingToken1Price, setIsFetchingToken1Price] = useState(false);

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

  // TODO: move slippage to state or store
  const SLIPPAGE = 500; // 1.5%

  const { data: balanceETH, refetch: refetchBalanceETH } = useBalance({
    enabled: Boolean(address),
    address,
  });

  const neutroRouter = getContract({
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
  });

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

  const {
    write: addLiquidity,
    isLoading: isAddingLiquidity,
    isSimulating: isSimulatingAddLiquidity,
  } = useAddLiquidity({
    token0,
    token1,
    token0Amount,
    token1Amount,
    token0Min,
    token1Min,
    isPreferNative,
    onSuccess: async () => {
      if (isWrappedNative(token0.address)) await refetchBalanceETH();
      else await refetchBalanceAndAllowance0;
      if (isWrappedNative(token1.address)) await refetchBalanceETH();
      else await refetchBalanceAndAllowance1;
      setToken0Amount("");
      setToken1Amount("");
    },
  });

  const handleToken0Change = async () => {
    if (isNaN(+token0Amount)) return;
    setToken0Amount(token0Amount);
    const amountADesired = parseUnits(token0Amount, token0.decimal);

    if (isNewPool || !reserves)
      return setToken0Min(
        (parseUnits(!!token0Amount ? token0Amount : "0", token0.decimal) *
          BigInt(10000 - SLIPPAGE)) /
          BigInt(10000)
      );
    if (!Number(amountADesired)) return setToken1Amount("");

    const amountBDesired = (amountADesired * reserves[1]) / reserves[0];
    setToken1Amount(formatUnits(amountBDesired, token1.decimal));

    const amountAMin =
      (amountADesired * BigInt(10000 - SLIPPAGE)) / BigInt(10000);
    const amountBMin =
      (amountBDesired * BigInt(10000 - SLIPPAGE)) / BigInt(10000);
    setToken0Min(amountAMin);
    setToken1Min(amountBMin);
  };

  const debouncedToken0Change = useDebounce(handleToken0Change);

  const handleToken1Change = async () => {
    if (isNaN(+token1Amount)) return;
    setToken1Amount(token1Amount);
    const amountBDesired = parseUnits(token1Amount, token1.decimal);

    if (isNewPool || !reserves)
      return setToken1Min(
        (parseUnits(!!token1Amount ? token1Amount : "0", token1.decimal) *
          BigInt(10000 - SLIPPAGE)) /
          BigInt(10000)
      );
    if (!Number(amountBDesired)) return setToken1Amount("");

    const amountADesired = (amountBDesired * reserves[0]) / reserves[1];
    setToken0Amount(formatUnits(amountADesired, token0.decimal));

    const amountAMin =
      (amountADesired * BigInt(10000 - SLIPPAGE)) / BigInt(10000);
    const amountBMin =
      (amountBDesired * BigInt(10000 - SLIPPAGE)) / BigInt(10000);
    setToken0Min(amountAMin);
    setToken1Min(amountBMin);
  };

  const debouncedToken1Change = useDebounce(handleToken1Change);

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

  const formattedBigBalance = useCallback(
    (balance: bigint, token: Token) => {
      if (isWrappedNative(token.address)) {
        return balanceETH ? balanceETH.value : BigInt(0);
      }
      return balance;
    },
    [balanceETH]
  );

  const isAmount0Invalid = () => {
    let value: bigint;
    if (isPreferNative && token0.symbol === "WEOS" && balanceETH)
      value = balanceETH.value;
    else value = balances[0].raw;
    return Number(token0Amount) > +formatUnits(value, token0.decimal);
  };

  const isAmount1Invalid = () => {
    let value: bigint;
    if (isPreferNative && token1.symbol === "WEOS" && balanceETH)
      value = balanceETH.value;
    else value = balances[1].raw;
    return Number(token1Amount) > +formatUnits(value, token1.decimal);
  };

  const isToken0NeedApproval = useMemo(() => {
    if (isPreferNative && token0.address === nativeToken.address) return false;
    if (!allowance0) return true;
    return +formatUnits(allowance0, token0.decimal) < Number(token0Amount);
  }, [token0, isPreferNative, nativeToken, allowance0, token0Amount]);
  console.log(token0.name);
  console.log(allowance0);
  console.log("isToken0NeedApproval", isToken0NeedApproval);

  const isToken1NeedApproval = useMemo(() => {
    if (isPreferNative && token1.address === nativeToken.address) return false;
    if (!allowance1) return true;
    return +formatUnits(allowance1, token1.decimal) < Number(token1Amount);
  }, [token1, isPreferNative, nativeToken, allowance1, token1Amount]);
  console.log("isToken1NeedApproval", isToken1NeedApproval);

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
                  <div className="m-0 text-neutral-500 text-sm">
                    Balance: {balances[0].formatted}
                  </div>
                )}
                {token0.symbol === "WEOS" && (
                  <div className="m-0 text-neutral-500 text-sm">
                    Balance:{" "}
                    {isPreferNative && balanceETH
                      ? currencyFormat(+balanceETH?.formatted)
                      : balances[0].formatted}
                  </div>
                )}
                <Button
                  auto
                  className={classNames(
                    "!flex !items-center !py-3 !transition-all !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                    "text-white dark:text-primary",
                    "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                    "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                    "disabled:opacity-50"
                  )}
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    const value =
                      balanceETH && isPreferNative && token0.symbol === "WEOS"
                        ? balanceETH.value
                        : balances[0].raw;
                    setToken0Amount(formatUnits(value, token0.decimal));
                    if (!isNewPool) debouncedToken0Change();
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
              onChange={(e) => {
                setToken0Amount(e.target.value);
                debouncedToken0Change();
              }}
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
                    {isPreferNative && balanceETH
                      ? currencyFormat(+balanceETH?.formatted)
                      : balances[1].formatted}
                  </p>
                )}
                <Button
                  auto
                  className={classNames(
                    "!flex !items-center !py-3 !transition-all !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                    "text-white dark:text-primary",
                    "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                    "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                    "disabled:opacity-50"
                  )}
                  scale={0.33}
                  disabled={!balances}
                  onClick={() => {
                    if (!balances) return;
                    const value =
                      balanceETH && isPreferNative && token1.symbol === "WEOS"
                        ? balanceETH.value
                        : balances[1].raw;
                    setToken1Amount(formatUnits(value, token1.decimal));
                    if (!isNewPool) debouncedToken1Change();
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
              onChange={(e) => {
                setToken1Amount(e.target.value);
                debouncedToken1Change();
              }}
              iconRight={isFetchingToken1Price ? <Spinner /> : <></>}
              type={isAmount1Invalid() ? "error" : "default"}
            />
            {isAmount1Invalid() && (
              <small className="mt-1 text-red-500">Insufficient balance</small>
            )}

            <Tabs defaultValue="token">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Preferred Types
                </p>
                <TabsList className="p-px">
                  <TabsTrigger value="nft" className="text-xs">
                    spNFT
                  </TabsTrigger>
                  <TabsTrigger value="token" className="text-xs">
                    LP Only
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="nft">
                <ResponsiveDialog.Root shouldScaleBackground>
                  <ResponsiveDialog.Trigger>
                    <Button
                      scale={1.25}
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-primary",
                        "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                        "disabled:opacity-50"
                      )}
                    >
                      Create spNFT
                    </Button>
                  </ResponsiveDialog.Trigger>
                  <ResponsiveDialog.Content>
                    <CreatePositionModal
                      pool={router.query.id as string}
                      // stats={props.stats}
                      token0={token0}
                      token1={token1}
                      token0Amount={token0Amount}
                      token1Amount={token1Amount}
                      token0Min={token0Min}
                      token1Min={token1Min}
                      isPreferNative={isPreferNative}
                      onSuccess={async () => {
                        if (isWrappedNative(token0.address))
                          await refetchBalanceETH();
                        else await refetchBalanceAndAllowance0();
                        if (isWrappedNative(token1.address))
                          await refetchBalanceETH();
                        else await refetchBalanceAndAllowance1();
                        setToken0Amount("");
                        setToken1Amount("");
                        router.push("/positions");
                      }}
                    />
                  </ResponsiveDialog.Content>
                </ResponsiveDialog.Root>
              </TabsContent>
              <TabsContent value="token">
                <div className="flex flex-col w-full">
                  {(isToken0NeedApproval || isToken1NeedApproval) && (
                    <Button
                      scale={1.25}
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-primary",
                        "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                        "disabled:opacity-50"
                      )}
                      loading={isApprovingToken0 || isApprovingToken1}
                      onClick={() => {
                        if (isToken0NeedApproval) return approveToken0?.();
                        if (isToken1NeedApproval) return approveToken1?.();
                      }}
                    >
                      {isToken0NeedApproval
                        ? `Approve ${token0.symbol}`
                        : isToken1NeedApproval && `Approve ${token1.symbol}`}
                    </Button>
                  )}
                  {!isToken0NeedApproval && !isToken1NeedApproval && (
                    <>
                      {isPreferNative && (
                        <Button
                          name="addLiquidityETH"
                          scale={1.25}
                          className={classNames(
                            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                            "text-white dark:text-primary",
                            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                            "disabled:opacity-50"
                          )}
                          loading={
                            isAddingLiquidity || isSimulatingAddLiquidity
                          }
                          disabled={!addLiquidity}
                          onClick={() => addLiquidity?.()}
                        >
                          Deposit Now
                        </Button>
                      )}
                      {!isPreferNative && (
                        <Button
                          name="addLiquidity"
                          scale={1.25}
                          className={classNames(
                            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                            "text-white dark:text-primary",
                            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                            "disabled:opacity-50"
                          )}
                          loading={
                            isAddingLiquidity || isSimulatingAddLiquidity
                          }
                          disabled={!addLiquidity}
                          onClick={() => addLiquidity?.()}
                        >
                          Deposit Now
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
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
