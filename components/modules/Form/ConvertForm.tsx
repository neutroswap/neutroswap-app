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
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import { GRAIL_ABI, XGRAIL_ABI } from "@/shared/abi";
import {
  NEXT_PUBLIC_GRAIL_TOKEN_CONTRACT,
  NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT,
} from "@/shared/helpers/constants";
import { BigNumber } from "ethers";
import { waitForTransaction } from "@wagmi/core";

export default function ConvertForm() {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const form = useForm();

  const convertGrailToXgrail = useWatch({
    control: form.control,
    name: "convertGrailToXgrail",
  });

  const debouncedConvertGrailToXgrail = useDebounce(convertGrailToXgrail, 500);

  const grailContract = {
    address: NEXT_PUBLIC_GRAIL_TOKEN_CONTRACT as `0x${string}`,
    abi: GRAIL_ABI,
  };

  const [grailBalance, setGrailBalance] = useState(BigInt(0));
  const [allowance, setAllowance] = useState(BigInt(0));
  const { refetch: refetchGrailInfo } = useContractReads({
    enabled: Boolean(address),
    watch: true,
    allowFailure: false,
    contracts: [
      {
        ...grailContract,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        ...grailContract,
        functionName: "allowance",
        args: [address!, NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT],
      },
    ],
    onSuccess: (data: any) => {
      const [grailBalanceResult, allowanceResult] = data;
      // if (grailBalanceResult.status === "success") {
      //   setGrailBalance(grailBalanceResult);
      // }
      // if (allowanceResult.status === "success") {
      //   setAllowance(allowanceResult);
      // }
      setGrailBalance(grailBalanceResult);
      setAllowance(allowanceResult);
    },
  });

  const availableGrail = useMemo(() => {
    if (!grailBalance) return "0";
    return `${Number(formatEther(grailBalance)).toFixed(2)}`;
  }, [grailBalance]);

  const { config: approveGrailConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_GRAIL_TOKEN_CONTRACT as `0x${string}`,
    abi: GRAIL_ABI,
    functionName: "approve",
    args: [
      NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT,
      BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });

  const { config: convertGrailConfig, refetch: retryConvertGrailConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
      abi: XGRAIL_ABI,
      functionName: "convert",
      args: [
        parseEther(
          debouncedConvertGrailToXgrail
            ? `${debouncedConvertGrailToXgrail}`
            : "0"
        ),
      ],
    });
  const { write: convertGrail, isLoading: isConvertGrailLoading } =
    useContractWrite({
      ...convertGrailConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
      },
    });

  const { isLoading: isApprovingGrail, write: approveGrail } = useContractWrite(
    {
      ...approveGrailConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
        await refetchGrailInfo();
        await retryConvertGrailConfig();
      },
    }
  );

  const isApproved = useMemo(() => {
    return Number(allowance) >= Number(debouncedConvertGrailToXgrail ?? "0");
  }, [allowance, debouncedConvertGrailToXgrail]);
  // console.log("allowance", allowance);
  // console.log("debounce", debouncedConvertGrailToXgrail);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => convertGrail?.())}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-bold">Get xGRAIL</div>
            <p className="text-sm font-normal leading-5 text-gray-500">
              Unlock bonus rewards and exclusive benefits by converting your
              GRAIL to xGRAIL.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <FormField
              control={form.control}
              name="convertGrailToXgrail"
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
                              "convertGrailToXgrail",
                              availableGrail
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
              <span>{availableGrail} GRAIL</span>
            </div>
          </div>
          {(() => {
            if (!isApproved) {
              return (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!approveGrail}
                  loading={isApprovingGrail}
                  onClick={() => approveGrail?.()}
                >
                  Approve GRAIL
                </Button>
              );
            }
            return (
              <Button
                type="submit"
                variant="outline"
                disabled={!convertGrail}
                loading={isConvertGrailLoading}
              >
                Convert GRAIL
              </Button>
            );
          })()}
        </div>
      </form>
    </Form>
  );
}
