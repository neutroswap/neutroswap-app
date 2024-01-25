"use client";

import { useMemo, useState } from "react";
import { useDirectlyCreatePosition } from "@/shared/hooks/useDirectlyCreatePosition";
import { useCreateNFTPool } from "@/shared/hooks/useCreateNFTPool";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
// import { NFT_POOL_ABI } from "@/lib/abis/nft-pool.abi";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/elements/Alert";
import { Slider } from "@/components/elements/Slider";
import { Token } from "@/shared/types/tokens.types";
import { isWrappedNative, tokens } from "@/shared/statics/tokenList";
import { useNetwork, useContractRead } from "wagmi";
import { useApprove } from "@/shared/hooks/useApprove";
import { useBalanceAndAllowance } from "@/shared/hooks/useBalanceAndAllowance";
import { formatEther, formatUnits } from "viem";
import { CaretDown, Warning } from "@phosphor-icons/react";
import { Button } from "@geist-ui/core";
import { cn, currencyFormat } from "@/shared/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/elements/Collapsible";
import TokenLogo from "@/components/modules/TokenLogo";
// import { PoolStatistic } from "../page";
import {
  NFTPOOLFACTORY_ABI,
  NEUTRO_HELPER_ABI,
  NFT_POOL_ABI,
} from "@/shared/abi";
import {
  NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT,
  NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT,
  NEXT_PUBLIC_POSITION_HELPER_CONTRACT,
} from "@/shared/helpers/constants";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { GetPairQuery } from "@/shared/gql/types/factory/graphql";
import { classNames } from "@/shared/helpers/classNamer";
dayjs.extend(duration);

type CreatePositionModalProps = {
  // pool: NonNullable<GetPairQuery["pairs"][number]>;
  pool: string;
  // stats: PoolStatistic;
  token0: Token;
  token1: Token;
  token0Amount: string;
  token1Amount: string;
  token0Min: bigint;
  token1Min: bigint;
  isPreferNative: boolean;
  onSuccess?: () => Promise<void>;
};

export const CreatePositionModal = (props: CreatePositionModalProps) => {
  const {
    pool,
    // stats,
    token0,
    token1,
    token0Amount,
    token1Amount,
    token0Min,
    token1Min,
    isPreferNative,
    onSuccess: handleSuccess,
  } = props;

  const [multiplierSettings, setMultiplierSettings] = useState({
    maxGlobalMultiplier: 0,
    maxLockDuration: 0,
    maxLockMultiplier: 0,
    maxBoostMultiplier: 0,
  });
  const [duration, setDuration] = useState(0);
  const debouncedDuration = useDebounceValue(duration, 500);

  const { data: nftPool, refetch: refetchNFTPool } = useContractRead({
    enabled: Boolean(pool),
    address: NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT as `0x${string}`,
    abi: NFTPOOLFACTORY_ABI,
    functionName: "getPool",
    args: [pool as `0x${string}`],
  });

  const { write: approveToken0, isLoading: isApprovingToken0 } = useApprove({
    address: token0.address,
    spender: NEXT_PUBLIC_POSITION_HELPER_CONTRACT as `0x${string}`,
    onSuccess: async () => {
      await refetchBalanceAndAllowance0();
    },
  });
  const { write: approveToken1, isLoading: isApprovingToken1 } = useApprove({
    address: token1.address,
    spender: NEXT_PUBLIC_POSITION_HELPER_CONTRACT as `0x${string}`,
    onSuccess: async () => {
      await refetchBalanceAndAllowance1();
    },
  });

  const { allowance: allowance0, refetch: refetchBalanceAndAllowance0 } =
    useBalanceAndAllowance(
      token0.address,
      NEXT_PUBLIC_POSITION_HELPER_CONTRACT as `0x${string}`
    );

  const { allowance: allowance1, refetch: refetchBalanceAndAllowance1 } =
    useBalanceAndAllowance(
      token1.address,
      NEXT_PUBLIC_POSITION_HELPER_CONTRACT as `0x${string}`
    );

  const isToken0NeedApproval = useMemo(() => {
    if (isPreferNative && isWrappedNative(token0.address)) return false;
    return +formatUnits(allowance0, token0.decimal) < Number(token0Amount);
  }, [token0, isPreferNative, token0Amount, allowance0]);
  console.log("isToken0NeedApproval", isToken0NeedApproval);
  console.log("allowance0", allowance0);

  const isToken1NeedApproval = useMemo(() => {
    if (isPreferNative && isWrappedNative(token1.address)) return false;
    return +formatUnits(allowance1, token1.decimal) < Number(token1Amount);
  }, [token1, isPreferNative, token1Amount, allowance1]);

  useContractRead({
    enabled: Boolean(nftPool),
    address: nftPool as `0x${string}`,
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

  const {
    write: directlyCreatePosition,
    isLoading: isDirectlyCreatingPosition,
    isSimulating: isSimulatingDirectlyCreatePosition,
  } = useDirectlyCreatePosition({
    pool: nftPool,
    token0,
    token1,
    token0Amount,
    token1Amount,
    token0Min,
    token1Min,
    isPreferNative,
    lockDuration: BigInt(
      dayjs.duration(Number(debouncedDuration), "days").asSeconds()
    ),
    onSuccess: handleSuccess,
  });

  const { write: createNFTPool, isLoading: isCreatingNFTPool } =
    useCreateNFTPool({
      pool: pool as `0x${string}`,
      enabled: nftPool === "0x0000000000000000000000000000000000000000",
      onSuccess: async () => {
        await refetchNFTPool();
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
        <div className="font-semibold">Create spNFT Position</div>
        <div className="text-sm text-muted-foreground">
          Start earning yield by holding your spNFT
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
              "text-white dark:text-primary",
              "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
              "!border !border-orange-600/50 dark:border-orange-400/[.12]",
              "disabled:opacity-50"
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
            <div className="flex items-center justify-between space-x-4">
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
                  {dayjs.duration(duration, "days").months()} months{" "}
                  {dayjs.duration(duration, "days").days()} days
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-4 mt-0.5">
              <button
                className={cn("text-xs font-semibold text-primary")}
                onClick={() => setDuration(multiplierSettings.maxLockDuration)}
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

            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide mt-6 mb-2">
                Estimates
              </div>
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                  Min. {token0.symbol}
                </div>
                <div className="flex items-center space-x-1">
                  <div className="text-sm">
                    {currencyFormat(+formatUnits(token0Min, token0.decimal), 5)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${token0.symbol}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                  Min. {token1.symbol}
                </div>
                <div className="flex items-center space-x-1">
                  <div className="text-sm">
                    {currencyFormat(+formatUnits(token1Min, token1.decimal), 5)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${token1.symbol}
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-between items-center ">
                <div className="flex text-muted-foreground  text-sm items-center">
                  <div className="text-xs font-semibold uppercase tracking-wide">
                    Total APR
                  </div>
                </div>
                <div className="text-sm">{totalApr.toFixed(2)}%</div>
              </div>
            </div>
          </div>

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
              {isToken0NeedApproval ? (
                <div className="flex items-center">
                  <p className="-mb-0.5">Approve {token0.symbol}</p>
                  <TokenLogo className="w-4 h-4 ml-2" src={token0.logo} />
                </div>
              ) : (
                isToken1NeedApproval && (
                  <div className="flex items-center">
                    <p className="-mb-0.5">Approve {token1.symbol}</p>
                    <TokenLogo className="w-4 h-4 ml-2" src={token1.logo} />
                  </div>
                )
              )}
            </Button>
          )}

          {!isToken0NeedApproval && !isToken1NeedApproval && (
            <Button
              scale={1.25}
              name="directlyCreatePosition"
              className={classNames(
                "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                "text-white dark:text-primary",
                "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50"
              )}
              loading={
                isDirectlyCreatingPosition || isSimulatingDirectlyCreatePosition
              }
              disabled={!directlyCreatePosition}
              onClick={() => directlyCreatePosition?.()}
            >
              Create Position
            </Button>
          )}
        </>
      )}
    </div>
  );
};
