"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import { useForm, useWatch } from "react-hook-form";
import WalletIcon from "@/public/icons/wallet.svg";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/elements/Collapsible";
import { Button } from "@geist-ui/core";
import { classNames } from "@/shared/helpers/classNamer";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { WEOS_ADDRESS } from "@/shared/helpers/contract";
import { WEOS_ABI } from "@/shared/abi";
import { useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import { waitForTransaction } from "@wagmi/core";

export function UnwrapWeosToEos(props: { onClose: () => void }) {
  const { address, isConnected } = useAccount();

  const form = useForm({
    defaultValues: {
      unwrapWeos: "",
    },
  });
  const unwrapWeosAmount = useWatch({
    control: form.control,
    name: "unwrapWeos",
  });
  const debouncedUnwrapWeosAmount = useDebounceValue(unwrapWeosAmount, 500);

  const [weosBalance, setWeosBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const { refetch: refetchWeosBalance } = useContractRead({
    enabled: Boolean(address),
    address: WEOS_ADDRESS,
    abi: WEOS_ABI,
    functionName: "balanceOf",
    args: [address],
    onSuccess: (data) => {
      let balance = formatEther(data as bigint);
      setWeosBalance(balance);
    },
  });
  const { refetch: refetchAllowance } = useContractRead({
    enabled: Boolean(address),
    address: WEOS_ADDRESS,
    abi: WEOS_ABI,
    functionName: "allowance",
    args: [address, WEOS_ADDRESS],
    onSuccess: (data) => {
      let allowance = formatEther(data as bigint);
      setAllowance(allowance);
    },
  });
  const availableWeos = useMemo(() => {
    if (!weosBalance) return "0";
    return weosBalance;
  }, [weosBalance]);
  const isApproved = useMemo(() => {
    return +allowance >= +debouncedUnwrapWeosAmount;
  }, [allowance, debouncedUnwrapWeosAmount]);
  const isAmountValid = useMemo(() => {
    return +weosBalance >= +debouncedUnwrapWeosAmount;
  }, [debouncedUnwrapWeosAmount, weosBalance]);

  const { config: unwrapWeosConfig, refetch: retryUnwrapWeosConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: WEOS_ADDRESS,
      abi: WEOS_ABI,
      functionName: "withdraw",
      args: [parseEther(debouncedUnwrapWeosAmount)],
    });
  const { write: unwrapWeos, isLoading: isUnwrappingWeos } = useContractWrite({
    ...unwrapWeosConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      await refetchWeosBalance();
      await refetchAllowance();
      form.setValue("unwrapWeos", "");
    },
  });

  const { config: approveWeosConfig } = usePrepareContractWrite({
    enabled: Boolean(address),
    address: WEOS_ADDRESS,
    abi: WEOS_ABI,
    functionName: "approve",
    args: [
      WEOS_ADDRESS,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { write: approveWeos, isLoading: isApprovingWeos } = useContractWrite({
    ...approveWeosConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      await refetchWeosBalance();
      await refetchAllowance();
    },
  });

  return (
    <Form {...form}>
      <div className="animate-in slide-in-from-right-1/4 duration-200">
        <div>
          <div className="font-semibold text-foreground">Unwrap your WEOS</div>
          <span className="text-sm text-muted-foreground">
            WEOS (Wrapped EOS) -&gt; EOS
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">Amount</div>
            <div className="flex items-center">
              <WalletIcon className="mr-1 w-3 h-3 md:w-4 md:h-4 text-neutral-400 dark:text-neutral-600" />
              <span className="text-sm">{availableWeos} WEOS</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <FormField
              control={form.control}
              name="unwrapWeos"
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
                          form.setValue("unwrapWeos", availableWeos)
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
                disabled={!approveWeos || !isAmountValid}
                loading={isApprovingWeos}
                onClick={() => approveWeos?.()}
              >
                {!isAmountValid && "Insufficient WEOS"}
                {isAmountValid && "Approve WEOS"}
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
              disabled={!unwrapWeos || !isAmountValid}
              loading={isUnwrappingWeos}
              onClick={() => unwrapWeos?.()}
            >
              {!isAmountValid && "Insufficient WEOS"}
              {isAmountValid && "Unwrap WEOS"}
            </Button>
          );
        })()}
      </div>
    </Form>
  );
}
