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
  useBalance,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { WEOS_ADDRESS } from "@/shared/helpers/contract";
import { WEOS_ABI } from "@/shared/abi";
import { formatEther, parseEther } from "viem";
import { waitForTransaction } from "@wagmi/core";
import { useMemo } from "react";

export function WrapEosToWeos(props: { onClose: () => void }) {
  const { address, isConnected } = useAccount();

  const form = useForm({
    defaultValues: {
      wrapEos: "",
    },
  });
  const wrapEosAmount = useWatch({
    control: form.control,
    name: "wrapEos",
  });
  const debouncedWrapEosAmount = useDebounceValue(wrapEosAmount, 500);

  const { data: eosBalance, refetch: refetchEosBalance } = useBalance({
    enabled: Boolean(address),
    address,
  });
  const availableEos = useMemo(() => {
    if (!eosBalance) return "0";
    return formatEther(eosBalance.value);
  }, [eosBalance]);
  const isAmountValid = useMemo(() => {
    return eosBalance!.value >= parseEther(debouncedWrapEosAmount);
  }, [debouncedWrapEosAmount, eosBalance]);

  const { config: wrapEosConfig } = usePrepareContractWrite({
    address: WEOS_ADDRESS,
    abi: WEOS_ABI,
    functionName: "deposit",
    value: parseEther(debouncedWrapEosAmount),
  });
  const { write: wrapEos, isLoading: isWrappingEos } = useContractWrite({
    ...wrapEosConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      await refetchEosBalance();
      form.setValue("wrapEos", "");
    },
  });

  return (
    <Form {...form}>
      <div className="animate-in slide-in-from-right-1/4 duration-200">
        <div>
          <div className="font-semibold text-foreground">Wrap your EOS</div>
          <span className="text-sm text-muted-foreground">
            EOS -&gt; WEOS (Wrapped EOS)
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">Amount</div>
            <div className="flex items-center">
              <WalletIcon className="mr-1 w-3 h-3 md:w-4 md:h-4 text-neutral-400 dark:text-neutral-600" />
              <span className="text-sm">
                {Number(availableEos).toLocaleString()} EOS
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <FormField
              control={form.control}
              name="wrapEos"
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
                        onClick={() => form.setValue("wrapEos", availableEos)}
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
        <Button
          className={classNames(
            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
            "text-white dark:text-primary !normal-case",
            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
            "disabled:opacity-50"
          )}
          disabled={!wrapEos || !isAmountValid}
          loading={isWrappingEos}
          onClick={() => wrapEos?.()}
        >
          {!isAmountValid && "Insufficient EOS"}
          {isAmountValid && "Wrap EOS"}
        </Button>
      </div>
    </Form>
  );
}
