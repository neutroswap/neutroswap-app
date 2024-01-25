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
import { Button } from "@geist-ui/core";
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
import { classNames } from "@/shared/helpers/classNamer";
import WalletIcon from "@/public/icons/wallet.svg";

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
                            "redeemXneutroToNeutro",
                            availableXneutro
                          )
                        }
                      >
                        MAX
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className="flex justify-end text-xs text-neutral-500 -mt-2">
            <div className="flex items-center">
              <WalletIcon className="mr-1 w-3 h-3 md:w-4 md:h-4 text-neutral-400 dark:text-neutral-600" />
              <span>{availableXneutro} NEUTRO</span>
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
                  className={classNames(
                    "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                    "text-white dark:text-primary",
                    "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                    "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                    "disabled:opacity-50"
                  )}
                  disabled={!approveXneutro}
                  loading={isApprovingXneutro}
                  onClick={() => approveXneutro?.()}
                >
                  Approve xNEUTRO
                </Button>
              );
            }
            return (
              <Button
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base !normal-case",
                  "text-white dark:text-primary",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                disabled={!redeemXneutro}
                loading={isRedeemXneutroLoading}
                onClick={() => redeemXneutro?.()}
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
