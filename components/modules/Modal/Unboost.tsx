"use client";

import { Button } from "@/components/elements/Button";
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

export function Unboost(
  props: GetNFTPositionResponse & { onClose: () => void }
) {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [isLoading, setIsLoading] = useState(false);

  const { base, fees, nitro, multiplier } = props.apr;
  const bonus = (multiplier.lock + multiplier.boost) * base;
  const totalAPR = Object.values(multiplier).reduce(
    (prev, curr) => prev + curr,
    base + fees + nitro + bonus
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
    (Number(userPosition?.[1]) / Number(userPosition?.[0])) * 100;

  const positionShare =
    (Number(props.amount) / Number(userPosition?.[2] ?? 0)) * 100;

  //   const multiplierDenominator1 =
  //     parseEther(props.amount) *
  //     parseEther(formatEther(BigInt(userPosition?.[0] ?? BigInt(0))));
  //   const multiplierDenominator2 =
  //     parseEther(debouncedUnboostAmount) *
  //     parseEther(formatEther(BigInt(userPosition?.[2] ?? BigInt(0)))) *
  //     parseEther(formatEther(BigInt(userPosition?.[3][3] ?? BigInt(0))));

  //   let multiplierF;
  //   let expectedMultiplier;
  //   let remainingBoosted;
  //   let multiplierAfterUnboost;

  //   if (
  //     multiplierDenominator1 === BigInt(0) ||
  //     multiplierDenominator2 === BigInt(0)
  //   ) {
  //     multiplierF = 0;
  //     expectedMultiplier = 0;
  //     remainingBoosted = 0;
  //     multiplierAfterUnboost = 0;
  //   } else {
  //     multiplierF = multiplierDenominator2 / multiplierDenominator1;

  //     expectedMultiplier = (Number(multiplierF) / 100000).toFixed(3);
  //     remainingBoosted =
  //       parseEther(formatEther(BigInt(userAllocation.userTotalAllocation))) -
  //       parseEther(debouncedUnboostAmount);

  //     multiplierAfterUnboost =
  //       Number(expectedMultiplier) *
  //       (Number(remainingBoosted) / Number(userAllocation.userTotalAllocation));
  //   }

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

  let multiplierF;
  let expectedMultiplier;
  if (
    multiplierDenominator1 === BigInt(0) ||
    multiplierDenominator2 === BigInt(0)
  ) {
    multiplierF = 0;
    expectedMultiplier = 1;
  } else {
    multiplierF = multiplierDenominator1 / multiplierDenominator2;
    if (multiplierF > maxBoostMultiplier) {
      multiplierF = maxBoostMultiplier;
    }
    expectedMultiplier = Number(multiplierF) / 10000 + 1;
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
          <p className="font-semibold">Unboost your position</p>
          <p className="text-sm text-muted-foreground">
            Deallocate xNEUTRO from your position
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">Amount allocated</p>
            <p className="text-sm text-muted-foreground">
              Balance {formatEther(BigInt(userAllocation.userTotalAllocation))}{" "}
              xNEUTRO
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <FormField
              control={form.control}
              name="unboost"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              variant="outline"
              className="text-sm"
              onClick={() =>
                form.setValue(
                  "unboost",
                  formatEther(BigInt(userAllocation.userTotalAllocation))
                )
              }
            >
              MAX
            </Button>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide mt-6 mb-2">
              Estimates
            </p>
          </div>
          <Collapsible className="w-full">
            <CollapsibleTrigger className="w-full flex justify-between items-center group">
              <div className="flex text-muted-foreground group-hover:text-foreground text-sm items-center transition-colors">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Boost Multiplier
                </p>
                <CaretDown
                  className={cn(
                    "flex ml-2 w-3 h-3",
                    "group-data-[state=open]:-rotate-90"
                  )}
                  weight="bold"
                />
              </div>
              {/* add condition if same not using arrow */}
              <p className="text-sm">
                x {(1 + props.apr.multiplier.boost).toFixed(3)} &#x21E2; x
                {expectedMultiplier.toFixed(3)}
              </p>
            </CollapsibleTrigger>
            <CollapsibleContent className="CollapsibleContent">
              <div className="space-y-1 ml-2 mt-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Boost allocation
                  </p>
                  <p className="text-sm">
                    {formatEther(BigInt(userAllocation.userTotalAllocation))}{" "}
                    xNEUTRO &#x21E2;{" "}
                    {balanceAfterUnboost >= BigInt(0)
                      ? formatEther(balanceAfterUnboost)
                      : "0"}{" "}
                    xNEUTRO
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Position pool share
                  </p>
                  <p className="text-sm">
                    {currencyFormat(positionShare, 2, 0.01)}%
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Pool boost share
                  </p>
                  <p className="text-sm">{poolBoostShare.toFixed(2)}%</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible className="w-full">
            <CollapsibleTrigger className="w-full flex justify-between items-center group">
              <div className="flex text-muted-foreground group-hover:text-foreground text-sm items-center transition-colors">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  APR
                </p>
                <CaretDown
                  className={cn(
                    "flex ml-2 w-3 h-3",
                    "group-data-[state=open]:-rotate-90"
                  )}
                  weight="bold"
                />
              </div>
              <p className="text-sm">{currencyFormat(totalAPR, 2, 0.01)}%</p>
            </CollapsibleTrigger>
            <CollapsibleContent className="CollapsibleContent">
              <div className="space-y-1 ml-2 mt-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Farm base APR
                  </p>
                  <p className="text-sm">{currencyFormat(base, 2, 0.01)}%</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Bonus APR
                  </p>
                  <p className="text-sm">{currencyFormat(bonus, 2, 0.01)}%</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Earned fees APR
                  </p>
                  <p className="text-sm">{currencyFormat(fees, 2, 0.01)}%</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <Button
          type="submit"
          className="w-full"
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
