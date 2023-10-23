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
import Button from "@/components/elements/Button";
import Input from "@/components/elements/Input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import { ERC20_ABI, XNEUTRO_ABI } from "@/shared/abi";
import {
  NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT,
  NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT,
} from "@/shared/helpers/constants";
import { BigNumber } from "ethers";
import { waitForTransaction } from "@wagmi/core";

export default function ConvertForm() {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const form = useForm();

  const convertNeutroToXneutro = useWatch({
    control: form.control,
    name: "convertNeutroToXneutro",
  });

  const debouncedConvertNeutroToXneutro = useDebounce(
    convertNeutroToXneutro,
    500
  );

  const neutroContract = {
    address: NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT as `0x${string}`,
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
        args: [address!, NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT as `0x${string}`],
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
    address: NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT as `0x${string}`,
      BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });

  const { config: convertNeutroConfig, refetch: retryConvertNeutroConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT as `0x${string}`,
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
        await waitForTransaction({ hash: tx.hash });
      },
    });

  const { isLoading: isApprovingNeutro, write: approveNeutro } =
    useContractWrite({
      ...approveNeutroConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
        await refetchNeutroInfo();
        await retryConvertNeutroConfig();
      },
    });

  const isApproved = useMemo(() => {
    return Number(allowance) >= Number(debouncedConvertNeutroToXneutro ?? "0");
  }, [allowance, debouncedConvertNeutroToXneutro]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => convertNeutro?.())}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-bold">Get xNEUTRO</div>
            <p className="text-sm font-normal leading-5 text-gray-500">
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
                    <InputGroup
                      suffix={
                        <button
                          type="button"
                          className="mr-1.5 mt-2 rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase leading-5 text-neutral-600"
                          onClick={() =>
                            form.setValue(
                              "convertNeutroToXneutro",
                              availableNeutro
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
              <span>{availableNeutro} NEUTRO</span>
            </div>
          </div>
          {(() => {
            if (!isApproved) {
              return (
                <Button
                  type="button"
                  variant="outline"
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
                type="submit"
                variant="outline"
                disabled={!convertNeutro}
                loading={isConvertNeutroLoading}
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
