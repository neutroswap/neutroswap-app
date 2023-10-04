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
import Button from "@/components/elements/Button";
import Input from "@/components/elements/Input";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import { XGRAIL_ABI } from "@/shared/abi";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT } from "@/shared/helpers/constants";
import { BigNumber } from "ethers";
import { Slider } from "@/components/elements/Slider";
import { waitForTransaction } from "@wagmi/core";

const DEFAULT_PERCENTAGE = 50;
const DAY_PER_PERCENTAGE = 3.3;
const DEFAULT_DURATION = 15;
const ONE_DAY_IN_SECONDS = 86400;
const MIN_REDEEM_RATIO = 50;
const MAX_REDEEM_RATIO = 100;
const MIN_REDEEM_DURATION = 1296000;
const MAX_REDEEM_DURATION = 15552000;

export default function RedeemForm() {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const form = useForm();
  const [grailOutputPercentage, setGrailOutputPercentage] = useState(50);

  const handlePercentageChange = (event: number[]) => {
    setGrailOutputPercentage(DEFAULT_PERCENTAGE + Number(event));
  };

  const redeemXgrailToGrail = useWatch({
    control: form.control,
    name: "redeemXgrailToGrail",
  });
  const debouncedRedeemXgrailToGrail = useDebounce(redeemXgrailToGrail, 500);

  const xgrailContract = {
    address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
    abi: XGRAIL_ABI,
  };

  const [xgrailBalance, setXgrailBalance] = useState(BigInt(0));
  const [allowance, setAllowance] = useState(BigInt(0));
  const { refetch: refetchXgrailInfo } = useContractReads({
    enabled: Boolean(address),
    watch: true,
    allowFailure: false,
    contracts: [
      {
        ...xgrailContract,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        ...xgrailContract,
        functionName: "allowance",
        args: [address!, NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`],
      },
    ],
    onSuccess: (data: any) => {
      const [xgrailBalanceResult, allowanceResult] = data;
      setXgrailBalance(xgrailBalanceResult);
      setAllowance(allowanceResult);
    },
  });

  const availableXgrail = useMemo(() => {
    if (!xgrailBalance) return "0";
    return `${Number(formatEther(xgrailBalance)).toFixed(2)}`;
  }, [xgrailBalance]);

  const { config: approveXgrailConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
    abi: XGRAIL_ABI,
    functionName: "approve",
    args: [
      NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
      BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { isLoading: isApprovingXgrail, write: approveXgrail } =
    useContractWrite({
      ...approveXgrailConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
        await refetchXgrailInfo();
        await retryRedeemXgrailConfig();
      },
    });

  const isApproved = useMemo(() => {
    return Number(allowance) >= Number(debouncedRedeemXgrailToGrail ?? "0");
  }, [allowance, debouncedRedeemXgrailToGrail]);

  const grailRedeemDuration = useMemo(() => {
    return (
      (grailOutputPercentage - DEFAULT_PERCENTAGE) * DAY_PER_PERCENTAGE +
      DEFAULT_DURATION
    );
  }, [grailOutputPercentage]);

  const grailRedeemDurationInSeconds = useMemo(() => {
    if (!grailRedeemDuration) return 0;
    return grailRedeemDuration * ONE_DAY_IN_SECONDS;
  }, [grailRedeemDuration]);

  const ratio = useMemo(() => {
    if (!grailRedeemDuration) return 0;
    return (
      MIN_REDEEM_RATIO +
      ((grailRedeemDuration * ONE_DAY_IN_SECONDS - MIN_REDEEM_DURATION) *
        (MAX_REDEEM_RATIO - MIN_REDEEM_RATIO)) /
        (MAX_REDEEM_DURATION - MIN_REDEEM_DURATION)
    );
  }, [grailRedeemDuration]);

  const grailOutput = useMemo(() => {
    if (!debouncedRedeemXgrailToGrail) return 0;
    return (ratio * debouncedRedeemXgrailToGrail) / 100;
  }, [debouncedRedeemXgrailToGrail, ratio]);

  const { config: redeemXgrailConfig, refetch: retryRedeemXgrailConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
      abi: XGRAIL_ABI,
      functionName: "redeem",
      args: [
        parseEther(
          debouncedRedeemXgrailToGrail ? `${debouncedRedeemXgrailToGrail}` : "0"
        ),
        BigNumber.from(Math.floor(grailRedeemDurationInSeconds)),
      ],
    });

  const { write: redeemXgrail, isLoading: isRedeemXgrailLoading } =
    useContractWrite({
      ...redeemXgrailConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
      },
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => redeemXgrail?.())}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-bold">Redeem xNEUTRO</div>
            <p className="text-sm font-normal leading-5 text-gray-500">
              Redeem your xNEUTRO back into NEUTRO over a vesting period of 15
              days (1 → 0.5 ratio) to 6 months (1 → 1 ratio).
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <FormField
              control={form.control}
              name="redeemXgrailToGrail"
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
                              "redeemXgrailToGrail",
                              availableXgrail
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
              <span>{availableXgrail} xNEUTRO</span>
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex flex-col mt-3">
              <div className="font-xs font-semibold">Redeem duration</div>
            </div>
            <div className="flex w-full items-center gap-2">
              <Slider
                defaultValue={[0]}
                onValueChange={(e) => handlePercentageChange(e)}
                max={50}
                step={1}
              />
              <span className="text-sm font-semibold leading-5 text-neutral-500">
                {grailOutputPercentage}%
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold leading-5 text-neutral-500">
                Redeem Duration
              </span>
              <span className="text-sm font-semibold leading-5 text-neutral-500">
                {Math.floor(grailRedeemDuration)} Days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold leading-5 text-neutral-500">
                GRAIL Output
              </span>
              <span className="text-sm font-semibold leading-5 text-neutral-500">
                {grailOutput} NEUTRO
              </span>
            </div>
          </div>
          {(() => {
            if (!isApproved) {
              return (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!approveXgrail}
                  loadingText="Approving xGRAIL"
                  loading={isApprovingXgrail}
                  onClick={() => approveXgrail?.()}
                >
                  Approve xNEUTRO
                </Button>
              );
            }
            return (
              <Button
                type="submit"
                variant="outline"
                disabled={!redeemXgrail}
                loading={isRedeemXgrailLoading}
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
