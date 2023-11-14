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
// import useConfig from "@/lib/hooks/useConfig";
import { useApprove } from "@/shared/hooks/useApprove";
import { useBalanceAndAllowance } from "@/shared/hooks/useBalanceAndAllowance";
import { formatEther, formatUnits, parseEther } from "viem";
import dayjs from "dayjs";
import { CaretDown, Warning } from "@phosphor-icons/react";
import Button from "@/components/elements/Button";
// import { Button } from "@geist-ui/core";
import { cn, currencyFormat } from "@/shared/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/elements/Collapsible";
import TokenLogo from "../TokenLogo";
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
import Input from "@/components/elements/Input";
import {
  NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT,
  NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT,
} from "@/shared/helpers/constants";

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

  const { data: nftPool, refetch: refetchNFTPool } = useContractRead({
    enabled: Boolean(props.pool),
    address: NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT as `0x${string}`,
    abi: NFTPOOLFACTORY_ABI,
    functionName: "getPool",
    args: [props.pool],
  });

  const { write: approveLpToken, isLoading: isApprovingLpToken } = useApprove({
    address: props.pool,
    spender: nftPool as `0x${string}`,
    onSuccess: async () => {
      await refetchBalanceAndAllowanceLp();
    },
  });

  const { allowance: allowanceLp, refetch: refetchBalanceAndAllowanceLp } =
    useBalanceAndAllowance(props.pool, nftPool);

  const isApproved = useMemo(() => {
    let formattedAllowance = formatEther(BigInt(allowanceLp ?? 0));
    return +formattedAllowance >= +debouncedLpTokenAmount;
  }, [debouncedLpTokenAmount, allowanceLp]);

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

  const { isLoading } = useContractReads({
    enabled: Boolean(address),
    // cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: props.pool,
        abi: ERC20_ABI,
        functionName: "totalSupply",
      } as const,
      {
        address: props.pool,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      } as const,
    ],
    onSuccess: (response) => {
      const [totalSupply, balanceOf] = response;
      setOwnedLP(balanceOf);
    },
  });

  const { write: createNFTPool, isLoading: isCreatingNFTPool } =
    useCreateNFTPool({
      pool: props.pool,
      enabled: nftPool === "0x0000000000000000000000000000000000000000",
      onSuccess: async () => {
        await refetchNFTPool();
      },
    });

  const { config: wrapNFTConfig } = usePrepareContractWrite({
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

  //   const totalApr = useMemo(() => {
  //     return stats.feesApr + baseApr + bonusApr;
  //   }, [stats, baseApr, bonusApr]);

  return (
    <div className="p-3 space-y-4">
      <div>
        <p className="font-semibold">Wrap LP to spNFT Position</p>
        <p className="text-sm text-muted-foreground">
          Start earning yield by depositing assets to ESPER
        </p>
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
            className={cn("w-full uppercase font-semibold tracking-tight")}
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
                <p className="text-sm">Amount</p>
                <p className="text-sm text-muted-foreground">
                  Balance {formatEther(ownedLP)} LP
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <FormField
                  control={form.control}
                  name="lpToken"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  className="text-sm"
                  onClick={() => form.setValue("lpToken", formatEther(ownedLP))}
                >
                  MAX
                </Button>
              </div>
              <div className="flex items-center justify-between space-x-4 mt-4">
                <div>
                  <p className="text-sm whitespace-nowrap leading-none">
                    Lock Duration
                  </p>
                </div>
                <Slider
                  defaultValue={[0]}
                  value={[duration]}
                  onValueChange={handleDurationChange}
                  max={multiplierSettings.maxLockDuration}
                  step={1}
                />
                <div>
                  <p className="w-32 text-sm flex justify-end">
                    {dayjs.duration(duration, "days").months()} months{" "}
                    {dayjs.duration(duration, "days").days()} days
                  </p>
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
                <p className="flex text-xs text-muted-foreground whitespace-nowrap justify-end">
                  {lockBonusInPercent}% lock bonus{" "}
                  {lockBonusInPercent / 100 + 1 > 1
                    ? `(x${(lockBonusInPercent / 100 + 1).toFixed(2)})`
                    : ""}
                </p>
              </div>
            </Form>
          </div>
          <Collapsible className="w-full">
            <CollapsibleTrigger className="w-full flex justify-between items-center group">
              <div className="flex text-muted-foreground group-hover:text-foreground text-sm items-center transition-colors">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Total APR
                </p>
                <CaretDown
                  className={cn(
                    "flex ml-2 w-3 h-3",
                    "group-data-[state=open]:-rotate-90"
                  )}
                  weight="bold"
                />
              </div>
              {/* <p className="text-sm">{totalApr.toFixed(2)}%</p> */}
            </CollapsibleTrigger>
            <CollapsibleContent className="CollapsibleContent">
              <div className="space-y-1 ml-2 mt-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Swap Fees APR
                  </p>
                  {/* <p className="text-sm">{stats.feesApr.toPrecision(3)}%</p> */}
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Farm Base APR
                  </p>
                  <p className="text-sm">{baseApr}%</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Farm Bonus APR
                  </p>
                  <p className="text-sm">{bonusApr}%</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {(() => {
            if (!isApproved) {
              return (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full uppercase text-xs font-semibold mt-3"
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
                type="submit"
                className="w-full uppercase text-xs font-semibold mt-3"
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
