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
import {
  XNEUTRO_CONTRACT,
  YIELDBOOSTER_CONTRACT,
} from "@/shared/helpers/contract";
import { NFT_POOL_ABI, XNEUTRO_ABI, YIELDBOOSTER_ABI } from "@/shared/abi";
import { classNames } from "@/shared/helpers/classNamer";

export function Unboost(
  props: GetNFTPositionResponse & { onClose: () => void }
) {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [isLoading, setIsLoading] = useState(false);

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
      unboost: "",
    },
  });
  const unboostAmount = useWatch({
    control: form.control,
    name: "unboost",
  });
  const debouncedUnboostAmount = useDebounceValue(unboostAmount, 500);

  const data = encodeAbiParameters(
    [
      { name: "id", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    [props.id, BigInt(props.tokenId)]
  );

  const { config: unboostConfig } = usePrepareContractWrite({
    address: XNEUTRO_CONTRACT,
    abi: XNEUTRO_ABI,
    functionName: "deallocate",
    args: [YIELDBOOSTER_CONTRACT, parseEther(debouncedUnboostAmount), data],
  });

  const { isLoading: isUnboostLoading, write: unboost } = useContractWrite({
    ...unboostConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
    },
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
    // enabled: Boolean(address),
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

  const afterUnboostedAmount =
    Number(userPosition?.[1]) - Number(parseEther(debouncedUnboostAmount));
  const poolBoostShareAfterValue =
    afterUnboostedAmount >= 0
      ? (afterUnboostedAmount /
          (Number(userPosition?.[0]) -
            Number(parseEther(debouncedUnboostAmount)))) *
        100
      : 0;

  const poolBoostShareAfter = isNaN(poolBoostShareAfterValue)
    ? 0
    : poolBoostShareAfterValue;

  const userPositionValue = Number(userPosition?.[1]) || 0;

  const positionShare =
    userPositionValue !== 0
      ? (Number(props.amount) / userPositionValue) * 100
      : 0;

  const userAlloc = BigInt(userPosition?.[1] ?? BigInt(0));
  const afterUnboosted = userAlloc - parseEther(debouncedUnboostAmount);

  const totalLpSupply = BigInt(userPosition?.[2][5] ?? BigInt(0));
  const maxBoostMultiplier = BigInt(userPosition?.[3][3] ?? BigInt(0));
  const lpAmount = parseEther(props.amount);
  const totalAlloc = BigInt(userPosition?.[0] ?? BigInt(0));

  const multiplierDenominator1 =
    afterUnboosted * totalLpSupply * maxBoostMultiplier;
  const multiplierDenominator2 =
    lpAmount * (totalAlloc + parseEther(debouncedUnboostAmount));

  let expectedMultiplier;
  if (
    multiplierDenominator1 === BigInt(0) ||
    multiplierDenominator2 === BigInt(0)
  ) {
    expectedMultiplier = 1;
  } else {
    let multiplierF = multiplierDenominator1 / multiplierDenominator2;
    if (multiplierF > maxBoostMultiplier) {
      multiplierF = maxBoostMultiplier;
    }
    expectedMultiplier = Math.max(Number(multiplierF) / 10000 + 1, 1);
  }

  const balanceAfterUnboost =
    BigInt(userAllocation.userTotalAllocation) -
    parseEther(debouncedUnboostAmount);

  const onSubmit = async () => {
    setIsLoading(true);
    if (!signer) throw new Error("No signer");
    () => unboost?.();
  };
  return (
    <Form {...form}>
      <div className="animate-in slide-in-from-right-1/4 duration-200">
        <div>
          <div className="font-semibold">Unboost your position</div>
          <span className="text-sm text-muted-foreground">
            Deallocate xNEUTRO from your position
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">Amount allocated</div>
            <span className="text-sm text-muted-foreground">
              {" "}
              {Number(
                formatEther(BigInt(userAllocation.userTotalAllocation))
              ).toFixed(2)}{" "}
              xNEUTRO
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <FormField
              control={form.control}
              name="unboost"
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
                          form.setValue(
                            "unboost",
                            formatEther(
                              BigInt(userAllocation.userTotalAllocation)
                            )
                          )
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
            <p className="text-xs font-semibold uppercase tracking-wide mt-6 mb-2">
              Estimates
            </p>
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
              {/* add condition if same not using arrow */}
              <span className="text-sm">
                x {(2.0).toFixed(3)} &#x21E2; x {expectedMultiplier.toFixed(3)}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="CollapsibleContent">
              <div className="space-y-1 ml-2 mt-2">
                <div className="flex justify-between">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Boost allocation
                  </div>
                  <span className="text-sm">
                    {Number(
                      formatEther(BigInt(userAllocation.userTotalAllocation))
                    ).toFixed(2)}{" "}
                    xNEUTRO &#x21E2;{" "}
                    {balanceAfterUnboost >= BigInt(0)
                      ? Number(formatEther(balanceAfterUnboost)).toFixed(2)
                      : "0"}{" "}
                    xNEUTRO
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
              <div className="text-xs font-semibold uppercase tracking-wide">
                Total APR
              </div>
            </div>
            <span className="text-sm">
              {currencyFormat(totalAPR, 2, 0.01)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <Button
          className={classNames(
            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
            "text-white dark:text-primary",
            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
            "disabled:opacity-50"
          )}
          disabled={!unboost}
          loading={isUnboostLoading}
          onClick={() => unboost?.()}
        >
          Unboost
        </Button>
      </div>
    </Form>
  );
}
