"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import InputGroup from "@/components/elements/InputGroup";
import { Button } from "@/components/elements/Button";
import { Input } from "@/components/elements/Input";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { currencyFormat } from "@/shared/utils";
import { XNEUTRO_ABI } from "@/shared/abi";
import { NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT } from "@/shared/helpers/constants";
import { Slider } from "@/components/elements/Slider";
import { waitForTransaction } from "@wagmi/core";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import { XNEUTRO_CONTRACT } from "@/shared/helpers/contract";

const DEFAULT_PERCENTAGE = 50;
const DAY_PER_PERCENTAGE = 3.36; // ((max redeem duration in days  - min redeem duration in days) / default percentage)
const DEFAULT_DURATION = 15;
const ONE_DAY_IN_SECONDS = 86400;
const MIN_REDEEM_RATIO = 50;
const MAX_REDEEM_RATIO = 100;
const MIN_REDEEM_DURATION = 1296000;
const MAX_REDEEM_DURATION = 15811200;

export default function RedeemForm() {
  const { address } = useAccount();

  const form = useForm();
  const [neutroOutputPercentage, setNeutroOutputPercentage] = useState(50);

  const handlePercentageChange = (event: number[]) => {
    setNeutroOutputPercentage(DEFAULT_PERCENTAGE + Number(event));
  };

  const redeemXneutroToNeutro = useWatch({
    control: form.control,
    name: "redeemXneutroToNeutro",
  });
  const debouncedRedeemXneutroToNeutro = useDebounceValue(
    redeemXneutroToNeutro,
    500
  );

  const xneutroContract = {
    address: XNEUTRO_CONTRACT,
    abi: XNEUTRO_ABI,
  };

  const [xneutroBalance, setXneutroBalance] = useState(BigInt(0));
  const [allowance, setAllowance] = useState(BigInt(0));
  const { refetch: refetchXneutroInfo } = useContractReads({
    enabled: Boolean(address),
    watch: true,
    allowFailure: false,
    contracts: [
      {
        ...xneutroContract,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        ...xneutroContract,
        functionName: "allowance",
        args: [address!, XNEUTRO_CONTRACT],
      },
    ],
    onSuccess: (data: any) => {
      const [xneutroBalanceResult, allowanceResult] = data;
      setXneutroBalance(xneutroBalanceResult);
      setAllowance(allowanceResult);
    },
  });

  const availableXneutro = useMemo(() => {
    if (!xneutroBalance) return "0";
    return `${Number(formatEther(xneutroBalance)).toFixed(2)}`;
  }, [xneutroBalance]);

  const { config: approveXneutroConfig } = usePrepareContractWrite({
    address: XNEUTRO_CONTRACT,
    abi: XNEUTRO_ABI,
    functionName: "approve",
    args: [
      XNEUTRO_CONTRACT,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { isLoading: isApprovingXneutro, write: approveXneutro } =
    useContractWrite({
      ...approveXneutroConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
        await refetchXneutroInfo();
        await retryRedeemXneutroConfig();
      },
    });

  const isApproved = useMemo(() => {
    return Number(allowance) >= Number(debouncedRedeemXneutroToNeutro ?? "0");
  }, [allowance, debouncedRedeemXneutroToNeutro]);

  const neutroRedeemDuration = useMemo(() => {
    return (
      (neutroOutputPercentage - DEFAULT_PERCENTAGE) * DAY_PER_PERCENTAGE +
      DEFAULT_DURATION
    );
    // return (
    //   (neutroOutputPercentage - DEFAULT_PERCENTAGE) * DAY_PER_PERCENTAGE +
    //   DEFAULT_DURATION
    // );
  }, [neutroOutputPercentage]);

  const neutroRedeemDurationInSeconds = useMemo(() => {
    if (!neutroRedeemDuration) return 0;
    return neutroRedeemDuration * ONE_DAY_IN_SECONDS;
  }, [neutroRedeemDuration]);

  const ratio = useMemo(() => {
    if (!neutroRedeemDuration) return 0;
    return (
      MIN_REDEEM_RATIO +
      ((neutroRedeemDuration * ONE_DAY_IN_SECONDS - MIN_REDEEM_DURATION) *
        (MAX_REDEEM_RATIO - MIN_REDEEM_RATIO)) /
        (MAX_REDEEM_DURATION - MIN_REDEEM_DURATION)
    );
  }, [neutroRedeemDuration]);

  const neutroOutput = useMemo(() => {
    if (!debouncedRedeemXneutroToNeutro) return 0;
    return (ratio * +debouncedRedeemXneutroToNeutro) / 100;
  }, [debouncedRedeemXneutroToNeutro, ratio]);

  const { config: redeemXneutroConfig, refetch: retryRedeemXneutroConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: XNEUTRO_CONTRACT,
      abi: XNEUTRO_ABI,
      functionName: "redeem",
      args: [
        parseEther(
          debouncedRedeemXneutroToNeutro
            ? `${debouncedRedeemXneutroToNeutro}`
            : "0"
        ),
        BigInt(Math.floor(neutroRedeemDurationInSeconds)),
      ],
    });

  const { write: redeemXneutro, isLoading: isRedeemXneutroLoading } =
    useContractWrite({
      ...redeemXneutroConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
      },
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => redeemXneutro?.())}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-bold">Redeem xNEUTRO</div>
            <p className="text-sm font-normal leading-5 my-0 text-muted-foreground">
              Redeem your xNEUTRO back into NEUTRO over a vesting period of 15
              days (1 → 0.5 ratio) to 6 months (1 → 1 ratio).
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <FormField
              control={form.control}
              name="redeemXneutroToNeutro"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup
                      suffix={
                        <button
                          type="button"
                          className="mr-1.5 mt-2 rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase leading-5 text-neutral-600"
                          onClick={() =>
                            form.setValue(
                              "redeemXneutroToNeutro",
                              availableXneutro
                            )
                          }
                        >
                          Max
                        </button>
                      }
                    >
                      <Input
                        type="number"
                        className="mt-2"
                        placeholder="0.00"
                        {...field}
                      ></Input>
                    </InputGroup>
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className="flex justify-end text-xs text-neutral-500 -mt-2">
            <div>
              <span className="mr-2">wallet balance:</span>
              <span>{availableXneutro} xNEUTRO</span>
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex flex-col mt-3">
              <div className="font-xs font-semibold">Redeem ratio</div>
            </div>
            <div className="flex w-full items-center gap-2">
              <Slider
                defaultValue={[0]}
                onValueChange={(e) => handlePercentageChange(e)}
                max={50}
                step={1}
              />
              <span className="text-sm font-semibold leading-5 text-neutral-500">
                {neutroOutputPercentage}%
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold leading-5 text-neutral-500">
                Redeem Duration
              </span>
              <span className="text-sm font-semibold leading-5 text-neutral-500">
                {Math.floor(neutroRedeemDuration)} Days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold leading-5 text-neutral-500">
                NEUTRO Output
              </span>
              <span className="text-sm font-semibold leading-5 text-neutral-500">
                {neutroOutput.toFixed(2)} NEUTRO
              </span>
            </div>
          </div>
          {(() => {
            if (!isApproved) {
              return (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!approveXneutro}
                  loadingText="Approving xNEUTRO"
                  loading={isApprovingXneutro}
                  onClick={() => approveXneutro?.()}
                >
                  Approve xNEUTRO
                </Button>
              );
            }
            return (
              <Button
                type="submit"
                variant="outline"
                disabled={!redeemXneutro}
                loading={isRedeemXneutroLoading}
              >
                Redeem xNEUTRO
              </Button>
            );
          })()}
        </div>
      </form>
    </Form>
  );
}
