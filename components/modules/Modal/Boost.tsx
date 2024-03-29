"use client";

import { Button } from "@geist-ui/core";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/elements/Collapsible";
import { Input } from "@/components/elements/Input";
import { cn, currencyFormat } from "@/shared/utils";
import { CaretDown } from "@phosphor-icons/react";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { Response as GetNFTPositionResponse } from "@/shared/getters/getNFTPosition";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWalletClient,
} from "wagmi";
import { useMemo, useState } from "react";
import { encodeAbiParameters, formatEther, parseEther } from "viem";
import { useForm, useWatch } from "react-hook-form";
import useDebounceValue from "@/shared/hooks/useDebounceValue";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import { waitForTransaction } from "@wagmi/core";
import { useBalanceAndAllowance } from "@/shared/hooks/useBalanceAndAllowance";
import { NFT_POOL_ABI, XNEUTRO_ABI, YIELDBOOSTER_ABI } from "@/shared/abi";
import {
  XNEUTRO_CONTRACT,
  YIELDBOOSTER_CONTRACT,
} from "@/shared/helpers/contract";
import WalletIcon from "@/public/icons/wallet.svg";
import { classNames } from "@/shared/helpers/classNamer";

export function Boost(props: GetNFTPositionResponse & { onClose: () => void }) {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [isLoading, setIsLoading] = useState(false);

  const {
    balance,
    allowance,
    refetch: refetchBalanceAndAllowance,
  } = useBalanceAndAllowance(XNEUTRO_CONTRACT, YIELDBOOSTER_CONTRACT);

  const availablexNEUTRO = useMemo(() => {
    if (!balance) return "0";
    return `${Number(formatEther(balance)).toFixed(2)}`;
  }, [balance]);

  const { base, nitro, multiplier } = props.apr;
  const bonus = (multiplier.lock + multiplier.boost) * base;
  const totalAPR = Object.values(multiplier).reduce(
    (prev, curr) => prev + curr,
    base + nitro + bonus
  );

  //get user account as signer
  const { data: signer } = useWalletClient({
    chainId: chain?.id,
  });

  // use form utils
  const form = useForm({
    defaultValues: {
      boost: "",
    },
  });
  const boostAmount = useWatch({
    control: form.control,
    name: "boost",
  });
  const debouncedBoostAmount = useDebounceValue(boostAmount, 500);

  const { config: approveUsageConfig } = usePrepareContractWrite({
    address: XNEUTRO_CONTRACT,
    abi: XNEUTRO_ABI,
    functionName: "approveUsage",
    args: [
      YIELDBOOSTER_CONTRACT,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });

  const { isLoading: isApprovingUsage, write: approveUsage } = useContractWrite(
    {
      ...approveUsageConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        await refetchBalanceAndAllowance();
        await retryBoostConfig();
      },
    }
  );

  const data = encodeAbiParameters(
    [
      { name: "id", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    [props.id, BigInt(props.tokenId)]
  );

  const { config: boostConfig, refetch: retryBoostConfig } =
    usePrepareContractWrite({
      address: XNEUTRO_CONTRACT,
      abi: XNEUTRO_ABI,
      functionName: "allocate",
      args: [YIELDBOOSTER_CONTRACT, parseEther(debouncedBoostAmount), data],
    });

  const { isLoading: isBoostLoading, write: boost } = useContractWrite({
    ...boostConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      refetchBalanceAndAllowance();
      form.setValue("boost", "");
    },
  });

  const { data: allowanceUsage } = useContractRead({
    address: XNEUTRO_CONTRACT,
    abi: XNEUTRO_ABI,
    functionName: "getUsageApproval",
    args: [address!, YIELDBOOSTER_CONTRACT],
  });

  const { data: userAllocationInYieldBooster } = useContractRead({
    address: YIELDBOOSTER_CONTRACT,
    abi: YIELDBOOSTER_ABI,
    functionName: "getUserPositionAllocation",
    args: [address!, props.id, BigInt(props.tokenId)],
  });

  const userAllocation = useMemo(() => {
    if (!userAllocationInYieldBooster)
      return {
        userTotalAllocation: BigInt(0),
      };
    const userTotalAllocation = userAllocationInYieldBooster;
    return {
      userTotalAllocation,
    };
  }, [userAllocationInYieldBooster]);

  const { data: userPosition } = useContractReads({
    enabled: Boolean(address),
    cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: YIELDBOOSTER_CONTRACT,
        abi: YIELDBOOSTER_ABI,
        functionName: "getPoolTotalAllocation",
        args: [props.id],
      } as const,
      {
        address: YIELDBOOSTER_CONTRACT,
        abi: YIELDBOOSTER_ABI,
        functionName: "getUserPositionAllocation",
        args: [address!, props.id, BigInt(props.tokenId)],
      } as const,
      {
        address: props.id,
        abi: NFT_POOL_ABI,
        functionName: "getPoolInfo",
      } as const,
      {
        address: props.id,
        abi: NFT_POOL_ABI,
        functionName: "getMultiplierSettings",
      } as const,
    ],
  });

  const poolBoostShare =
    Number(userPosition?.[0]) !== 0
      ? (Number(userPosition?.[1]) / Number(userPosition?.[0])) * 100
      : 0;

  const poolBoostShareAfterValue =
    ((Number(userPosition?.[1]) + Number(parseEther(debouncedBoostAmount))) /
      (Number(userPosition?.[0]) + Number(parseEther(debouncedBoostAmount)))) *
    100;

  const poolBoostShareAfter = isNaN(poolBoostShareAfterValue)
    ? 0
    : poolBoostShareAfterValue;

  const userPositionValue = Number(userPosition?.[1]) || 0;

  const positionShare =
    userPositionValue !== 0
      ? (Number(props.amount) / userPositionValue) * 100
      : 0;

  const userAlloc = BigInt(userPosition?.[1] ?? BigInt(0));
  const afterBoosted = userAlloc + parseEther(debouncedBoostAmount);

  const totalLpSupply = BigInt(userPosition?.[2][5] ?? BigInt(0));
  const maxBoostMultiplier = BigInt(userPosition?.[3][3] ?? BigInt(0));
  const lpAmount = parseEther(props.amount);
  const totalAlloc = BigInt(userPosition?.[0] ?? BigInt(0));

  const multiplierDenominator1 =
    afterBoosted * totalLpSupply * maxBoostMultiplier;
  const multiplierDenominator2 =
    lpAmount * (totalAlloc + parseEther(debouncedBoostAmount));

  let multiplierF;
  let expectedMultiplier;
  if (
    multiplierDenominator1 === BigInt(0) ||
    multiplierDenominator2 === BigInt(0)
  ) {
    multiplierF = 0;
    expectedMultiplier = 0;
  } else {
    multiplierF = multiplierDenominator1 / multiplierDenominator2;
    if (multiplierF > maxBoostMultiplier) {
      multiplierF = maxBoostMultiplier;
    }
    expectedMultiplier = Number(multiplierF) / 10000 + 1;
  }

  const balanceAfterBoost =
    BigInt(userAllocation.userTotalAllocation) +
    parseEther(debouncedBoostAmount);

  //checking whether the token is approved or not
  const isApproved = useMemo(() => {
    return allowanceUsage! >= parseEther(debouncedBoostAmount);
  }, [allowanceUsage, debouncedBoostAmount]);

  const onSubmit = async () => {
    setIsLoading(true);
    if (!signer) throw new Error("No signer");
    () => approveUsage?.();
  };
  return (
    <Form {...form}>
      <div className="animate-in slide-in-from-right-1/4 duration-200">
        <div>
          <div className="font-semibold text-foreground">
            Boost your position
          </div>
          <span className="text-sm text-muted-foreground">
            Allocate your xNEUTRO to your position for extra yield
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">Amount</div>
            <div className="flex items-center">
              <WalletIcon className="mr-1 w-3 h-3 md:w-4 md:h-4 text-neutral-400 dark:text-neutral-600" />
              <span className="text-sm">
                {Number(formatEther(BigInt(balance))).toFixed(2)} xNEUTRO
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <FormField
              control={form.control}
              name="boost"
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
                        className="mr-3 text-sm text-primary cursor-pointer font-semibold"
                        onClick={() =>
                          form.setValue("boost", formatEther(BigInt(balance)))
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
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide mt-6 mb-2">
              Estimates
            </div>
          </div>
          <Collapsible className="w-full">
            <CollapsibleTrigger className="w-full flex justify-between items-center group">
              <div className="flex text-muted-foreground group-hover:text-foreground text-sm items-center transition-colors">
                <div className="text-xs font-semibold uppercase tracking-wide">
                  Boost Multiplier
                </div>
                <CaretDown
                  className={cn(
                    "flex ml-2 w-3 h-3",
                    "group-data-[state=open]:-rotate-90"
                  )}
                  weight="bold"
                />
              </div>
              <span className="text-sm">
                x{(1 + props.apr.multiplier.boost).toFixed(3)} &#x21E2; x
                {expectedMultiplier.toFixed(3)}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="CollapsibleContent">
              <div className="space-y-1 ml-2 mt-2">
                <div className="flex justify-between">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Boost allocation
                  </div>
                  <span className="text-sm">
                    {formatEther(BigInt(userAllocation.userTotalAllocation))}{" "}
                    xNEUTRO &#x21E2; {formatEther(balanceAfterBoost)} xNEUTRO
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Position pool share
                  </div>
                  <span className="text-sm">
                    {currencyFormat(positionShare, 2, 0.01)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Pool boost share
                  </div>
                  <span className="text-sm">
                    {poolBoostShare.toFixed(2)}% &#x21E2;{" "}
                    {poolBoostShareAfter.toFixed(2)}%
                  </span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <div className="w-full flex justify-between items-center group">
            <div className="flex text-muted-foreground text-sm items-center">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Total APR
              </p>
            </div>
            <p className="text-sm">{currencyFormat(totalAPR, 2, 0.01)}%</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        {(() => {
          if (!isApproved) {
            return (
              <Button
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                  "text-white dark:text-primary !normal-case",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                disabled={!approveUsage}
                loading={isApprovingUsage}
                onClick={() => approveUsage?.()}
              >
                Approve xNEUTRO
              </Button>
            );
          }
          return (
            <Button
              className={classNames(
                "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                "text-white dark:text-primary !normal-case",
                "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50"
              )}
              disabled={!boost}
              loading={isBoostLoading}
              onClick={() => boost?.()}
            >
              Boost
            </Button>
          );
        })()}
      </div>
    </Form>
  );
}
