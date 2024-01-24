"use client";

import { useMemo, useState } from "react";
import { useDirectlyCreatePosition } from "@/shared/hooks/useDirectlyCreatePosition";
import { GetPairQuery } from "@/shared/gql/types/factory/graphql";
import { useCreateNFTPool } from "@/shared/hooks/useCreateNFTPool";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import {
  NFTPOOLFACTORY_ABI,
  NFT_POOL_ABI,
  NEUTRO_HELPER_ABI,
  ERC20_ABI,
} from "@/shared/abi";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/elements/Alert";
import { Slider } from "@/components/elements/Slider";
import { Token } from "@/shared/types/tokens.types";
import { isWrappedNative } from "@/shared/statics/tokenList";
import {
  useNetwork,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractReads,
} from "wagmi";
import { useApprove } from "@/shared/hooks/useApprove";
import { useBalanceAndAllowance } from "@/shared/hooks/useBalanceAndAllowance";
import { formatEther, formatUnits, parseEther } from "viem";
import dayjs from "dayjs";
import { CaretDown, Warning } from "@phosphor-icons/react";
// import { Button } from "@/components/elements/Button";
import { Button } from "@geist-ui/core";
import { cn, currencyFormat } from "@/shared/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/elements/Collapsible";
// import { PoolStatistic } from "../page";
import { waitForTransaction } from "@wagmi/core";
import { wrap } from "module";
import { useForm, useWatch } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import { Input } from "@/components/elements/Input";
import {
  NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT,
  NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT,
} from "@/shared/helpers/constants";
import { classNames } from "@/shared/helpers/classNamer";
import WalletIcon from "@/public/icons/wallet.svg";

type WrapPositionModalProps = {
  pool: `0x${string}`;
  // stats: PoolStatistic;
  // onSuccess?: () => Promise<void>;
};

export const WrapPositionModal = (props: WrapPositionModalProps) => {
  // const { pool, stats, onSuccess: handleSuccess } = props;
  const { chain } = useNetwork();
  const { address } = useAccount();

  const [ownedLP, setOwnedLP] = useState(BigInt(0));

  const form = useForm({
    defaultValues: {
      lpToken: "",
    },
  });
  const lpTokenAmount = useWatch({
    control: form.control,
    name: "lpToken",
  });
  const debouncedLpTokenAmount = useDebounceValue(lpTokenAmount, 500);

  const [multiplierSettings, setMultiplierSettings] = useState({
    maxGlobalMultiplier: 0,
    maxLockDuration: 0,
    maxLockMultiplier: 0,
    maxBoostMultiplier: 0,
  });
  const [duration, setDuration] = useState(0);
  const debouncedDuration = useDebounceValue(duration, 500);
  const totalDays = duration;
  const months = Math.floor(totalDays / 30);
  const remainingDays = totalDays % 30;

  const { data: nftPool, refetch: refetchNFTPool } = useContractRead({
    enabled: Boolean(props.pool),
    address: NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT as `0x${string}`,
    abi: NFTPOOLFACTORY_ABI,
    functionName: "getPool",
    args: [props.pool],
  });

  // const { allowance: allowanceLp, refetch: refetchBalanceAndAllowanceLp } =
  //   useBalanceAndAllowance(props.pool, nftPool);

  const [allowance, setAllowance] = useState(BigInt(0));
  const { refetch: refetchLpTokenInfo } = useContractReads({
    enabled: Boolean(address),
    watch: true,
    allowFailure: false,
    contracts: [
      {
        address: props.pool,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: props.pool,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address!, nftPool as `0x${string}`],
      },
    ],
    onSuccess: (data: any) => {
      const [neutroBalanceResult, allowanceResult] = data;
      // if (neutroBalanceResult.status === "success") {
      //   setNeutroBalance(neutroBalanceResult);
      // }
      // if (allowanceResult.status === "success") {
      //   setAllowance(allowanceResult);
      // }
      setOwnedLP(neutroBalanceResult);
      setAllowance(allowanceResult);
    },
  });

  // const { write: approveLpToken, isLoading: isApprovingLpToken } = useApprove({
  //   address: props.pool,
  //   spender: nftPool as `0x${string}`,
  //   onSuccess: async (tx) => {
  //     await refetchLpTokenInfo();
  //     await refetchWrapNFTConfig();
  //     await waitForTransaction({ hash: tx.hash, confirmations: 8 });
  //   },
  // });

  const { config: approveLpTokenConfig } = usePrepareContractWrite({
    address: props.pool,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      nftPool as `0x${string}`,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });

  const { isLoading: isApprovingLpToken, write: approveLpToken } =
    useContractWrite({
      ...approveLpTokenConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        await refetchLpTokenInfo();
        await retryWrapNFTConfig();
      },
    });

  const isApproved = useMemo(() => {
    // let formattedAllowance = formatEther(BigInt(allowanceLp ?? 0));
    return allowance >= (parseEther(debouncedLpTokenAmount) ?? "0");
  }, [debouncedLpTokenAmount, allowance]);

  useContractRead({
    enabled: Boolean(nftPool),
    address: nftPool,
    abi: NFT_POOL_ABI,
    functionName: "getMultiplierSettings",
    onSuccess: (data) => {
      const [
        maxGlobalMultiplier,
        maxLockDuration,
        maxLockMultiplier,
        maxBoostMultiplier,
      ] = data;
      setMultiplierSettings({
        maxGlobalMultiplier: Number(maxGlobalMultiplier),
        maxLockDuration: dayjs
          .duration(Number(maxLockDuration), "seconds")
          .asDays(),
        maxLockMultiplier: Number(maxLockMultiplier),
        maxBoostMultiplier: Number(maxBoostMultiplier),
      });
    },
  });

  // const { isLoading } = useContractReads({
  //   enabled: Boolean(address),
  //   // cacheOnBlock: true,
  //   allowFailure: false,
  //   contracts: [
  //     {
  //       address: props.pool,
  //       abi: ERC20_ABI,
  //       functionName: "totalSupply",
  //     } as const,
  //     {
  //       address: props.pool,
  //       abi: ERC20_ABI,
  //       functionName: "balanceOf",
  //       args: [address!],
  //     } as const,
  //   ],
  //   onSuccess: (response) => {
  //     const [totalSupply, balanceOf] = response;
  //     setOwnedLP(balanceOf);
  //   },
  // });

  const { write: createNFTPool, isLoading: isCreatingNFTPool } =
    useCreateNFTPool({
      pool: props.pool,
      enabled: nftPool === "0x0000000000000000000000000000000000000000",
      onSuccess: async () => {
        await refetchNFTPool();
      },
    });

  const { config: wrapNFTConfig, refetch: retryWrapNFTConfig } =
    usePrepareContractWrite({
      address: nftPool,
      abi: NFT_POOL_ABI,
      functionName: "createPosition",
      args: [
        parseEther(debouncedLpTokenAmount),
        BigInt(dayjs.duration(Number(debouncedDuration), "days").asSeconds()),
      ],
    });

  const { isLoading: isWrappingNFTLoading, write: wrapNFT } = useContractWrite({
    ...wrapNFTConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
    },
  });

  const handleDurationChange = (event: number[]) => {
    setDuration(Number(event));
  };

  const isNFTPoolFound = useMemo(() => {
    return nftPool !== "0x0000000000000000000000000000000000000000";
  }, [nftPool]);

  const { data: nftPoolApr } = useContractRead({
    enabled: Boolean(nftPool),
    address: NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT as `0x${string}`,
    abi: NEUTRO_HELPER_ABI,
    functionName: "nftPoolApr",
    args: [nftPool!],
  });

  // APR CALCULATION
  const lockBonusInPercent = useMemo(() => {
    const percent =
      (multiplierSettings.maxLockMultiplier * duration) /
      multiplierSettings.maxLockDuration /
      100;
    return Number(percent.toFixed(2)); // in percent
  }, [duration, multiplierSettings]);

  const baseApr = parseFloat(formatEther(nftPoolApr ?? BigInt(0)));
  const bonusApr = baseApr * (lockBonusInPercent / 100);

  const totalApr = useMemo(() => {
    return baseApr + bonusApr;
  }, [baseApr, bonusApr]);

  return (
    <div className="p-3 space-y-4">
      <div>
        <div className="font-semibold">Wrap LP to spNFT Position</div>
        <div className="text-sm text-muted-foreground">
          Start earning yield by depositing assets to NEUTRO
        </div>
      </div>

      {!isNFTPoolFound && (
        <>
          <Alert variant="warning">
            <Warning className="h-4 w-4" />
            <AlertTitle>Need to initialize spNFT pool</AlertTitle>
            <AlertDescription>
              You are the very first spNFT minter for this asset! You will need
              to initialize the spNFT contract first.
            </AlertDescription>
          </Alert>
          <Button
            name="createNFTPool"
            className={classNames(
              "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
              "text-white dark:text-amber-600",
              "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
              "!border !border-orange-600/50 dark:border-orange-400/[.12]"
            )}
            loading={isCreatingNFTPool}
            disabled={!createNFTPool}
            onClick={() => createNFTPool?.()}
          >
            Initialize NFT Pool
          </Button>
        </>
      )}

      {isNFTPoolFound && (
        <>
          <div className="mt-4">
            <Form {...form}>
              <div className="flex items-center justify-between">
                <div className="text-sm">Amount</div>
                <div className="flex">
                  <WalletIcon className="mr-2 w-4 h-4 md:w-5 md:h-5 text-neutral-400 dark:text-neutral-600" />
                  <div className="text-sm text-muted-foreground">
                    {formatEther(ownedLP)} LP
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <FormField
                  control={form.control}
                  name="lpToken"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <div className="flex justify-between items-center bg-neutral-200/50 dark:bg-neutral-900/50 rounded-lg">
                          <input
                            type="number"
                            placeholder="0.0"
                            className="bg-transparent text-black dark:text-white !px-4 !py-3 !rounded-lg !box-border"
                            {...field}
                          ></input>
                          <div
                            className="mr-3 text-sm text-amber-600 cursor-pointer font-semibold"
                            onClick={() =>
                              form.setValue("lpToken", formatEther(ownedLP))
                            }
                          >
                            MAX
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center justify-between space-x-4 mt-4">
                <div>
                  <div className="text-sm whitespace-nowrap leading-none">
                    Lock Duration
                  </div>
                </div>
                <Slider
                  defaultValue={[0]}
                  value={[duration]}
                  onValueChange={handleDurationChange}
                  max={multiplierSettings.maxLockDuration}
                  step={1}
                />
                <div>
                  <div className="w-32 text-sm flex justify-end">
                    {months === 0 && remainingDays === 0 && "0 months 0 days"}
                    {months > 0 && `${months} months`}{" "}
                    {remainingDays > 0 && `${remainingDays} days`}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-4 mt-0.5">
                <button
                  className={cn("text-xs font-semibold text-primary")}
                  onClick={() =>
                    setDuration(multiplierSettings.maxLockDuration)
                  }
                >
                  Set Max
                </button>
                <div className="flex text-xs text-muted-foreground whitespace-nowrap justify-end">
                  {lockBonusInPercent}% lock bonus{" "}
                  {lockBonusInPercent / 100 + 1 > 1
                    ? `(x${(lockBonusInPercent / 100 + 1).toFixed(2)})`
                    : ""}
                </div>
              </div>
            </Form>
          </div>

          <div className="w-full flex justify-between items-center group">
            <div className="flex text-muted-foreground text-sm items-center">
              <div className="text-xs font-semibold uppercase tracking-wide">
                Total APR
              </div>
            </div>
            <div className="text-sm">{totalApr.toFixed(2)}%</div>
          </div>

          {(() => {
            if (!isApproved) {
              return (
                <Button
                  className={classNames(
                    "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                    "text-white dark:text-amber-600",
                    "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                    "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                    "disabled:opacity-50"
                  )}
                  disabled={!approveLpToken}
                  loading={isApprovingLpToken}
                  onClick={() => approveLpToken?.()}
                >
                  Approve LP
                </Button>
              );
            }
            return (
              <Button
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                  "text-white dark:text-amber-600",
                  "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                disabled={!wrapNFT}
                loading={isWrappingNFTLoading}
                onClick={() => wrapNFT?.()}
              >
                Create Position
              </Button>
            );
          })()}
        </>
      )}
    </div>
  );
};
