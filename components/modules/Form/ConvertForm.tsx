"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import { useMemo, useState } from "react";
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
import { ERC20_ABI, XNEUTRO_ABI } from "@/shared/abi";
import {
  NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT,
  NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT,
} from "@/shared/helpers/constants";
import { waitForTransaction } from "@wagmi/core";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import { NEUTRO_CONTRACT, XNEUTRO_CONTRACT } from "@/shared/helpers/contract";
import WalletIcon from "@/public/icons/wallet.svg";
import { classNames } from "@/shared/helpers/classNamer";

export default function ConvertForm() {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const form = useForm();

  const convertNeutroToXneutro = useWatch({
    control: form.control,
    name: "convertNeutroToXneutro",
  });

  const debouncedConvertNeutroToXneutro = useDebounceValue(
    convertNeutroToXneutro,
    500
  );

  const neutroContract = {
    address: NEUTRO_CONTRACT,
    abi: ERC20_ABI,
  };

  const [neutroBalance, setNeutroBalance] = useState(BigInt(0));
  const [allowance, setAllowance] = useState(BigInt(0));
  const { refetch: refetchNeutroInfo } = useContractReads({
    enabled: Boolean(address),
    watch: true,
    allowFailure: false,
    contracts: [
      {
        ...neutroContract,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        ...neutroContract,
        functionName: "allowance",
        args: [address!, XNEUTRO_CONTRACT],
      },
    ],
    onSuccess: (data: any) => {
      const [neutroBalanceResult, allowanceResult] = data;
      // if (neutroBalanceResult.status === "success") {
      //   setNeutroBalance(neutroBalanceResult);
      // }
      // if (allowanceResult.status === "success") {
      //   setAllowance(allowanceResult);
      // }
      setNeutroBalance(neutroBalanceResult);
      setAllowance(allowanceResult);
    },
  });

  const availableNeutro = useMemo(() => {
    if (!neutroBalance) return "0";
    return `${Number(formatEther(neutroBalance)).toFixed(2)}`;
  }, [neutroBalance]);

  const { config: approveNeutroConfig } = usePrepareContractWrite({
    address: NEUTRO_CONTRACT,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      XNEUTRO_CONTRACT,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });

  const { config: convertNeutroConfig, refetch: retryConvertNeutroConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: XNEUTRO_CONTRACT,
      abi: XNEUTRO_ABI,
      functionName: "convert",
      args: [
        parseEther(
          debouncedConvertNeutroToXneutro
            ? `${debouncedConvertNeutroToXneutro}`
            : "0"
        ),
      ],
    });
  const { write: convertNeutro, isLoading: isConvertNeutroLoading } =
    useContractWrite({
      ...convertNeutroConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        form.setValue("convertNeutroToXneutro", "");
      },
    });

  const { isLoading: isApprovingNeutro, write: approveNeutro } =
    useContractWrite({
      ...approveNeutroConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        await refetchNeutroInfo();
        await retryConvertNeutroConfig();
      },
    });

  const isApproved = useMemo(() => {
    return allowance >= parseEther(debouncedConvertNeutroToXneutro ?? "0");
  }, [allowance, debouncedConvertNeutroToXneutro]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => convertNeutro?.())}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-bold">Get xNEUTRO</div>
            <p className="text-sm font-normal leading-5 my-0 text-muted-foreground">
              Unlock bonus rewards and exclusive benefits by converting your
              NEUTRO to xNEUTRO.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <FormField
              control={form.control}
              name="convertNeutroToXneutro"
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
                            "convertNeutroToXneutro",
                            availableNeutro
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
              <span>{availableNeutro} NEUTRO</span>
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
                  disabled={!approveNeutro}
                  loading={isApprovingNeutro}
                  onClick={() => approveNeutro?.()}
                >
                  Approve NEUTRO
                </Button>
              );
            }
            return (
              <Button
                className={classNames(
                  "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                  "text-white dark:text-primary",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                disabled={!convertNeutro}
                loading={isConvertNeutroLoading}
                onClick={() => convertNeutro?.()}
              >
                Convert NEUTRO
              </Button>
            );
          })()}
        </div>
      </form>
    </Form>
  );
}
