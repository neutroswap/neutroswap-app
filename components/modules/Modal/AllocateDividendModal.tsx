import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import InputGroup from "@/components/elements/InputGroup";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { XGRAIL_ABI } from "@/shared/abi";
import {
  NEXT_PUBLIC_DIVIDENDS_CONTRACT,
  NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT,
} from "@/shared/helpers/constants";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { waitForTransaction } from "@wagmi/core";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import Input from "@/components/elements/Input";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  useAccount,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import Button from "@/components/elements/Button";

export default function AllocateDividendModal() {
  const { address } = useAccount();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm();

  const allocateXneutro = useWatch({
    control: form.control,
    name: "allocateXneutro",
  });
  const debouncedAllocateXneutro = useDebounce(allocateXneutro, 500);

  const xneutroContract = {
    addres: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT,
    abi: XGRAIL_ABI,
  };
  const [xneutroBalance, setXneutroBalance] = useState(BigInt(0));
  const [allowance, setAllowance] = useState(BigInt(0));
  const { refetch: refetchXneutroInfo } = useContractReads({
    enabled: Boolean(address),
    watch: true,
    contracts: [
      {
        ...xneutroContract,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        ...xneutroContract,
        functionName: "getUsageApproval",
        args: [address!, NEXT_PUBLIC_DIVIDENDS_CONTRACT],
      },
    ],
    onSuccess: (data: any) => {
      const [xneutroBalanceResult, allowanceResult] = data;
      if (xneutroBalanceResult.status === "success") {
        setXneutroBalance(xneutroBalanceResult.result);
      }
      if (allowanceResult.status === "success") {
        setAllowance(allowanceResult.result);
      }
    },
  });

  const availableXneutro = useMemo(() => {
    if (!xneutroBalance) return "0";
    return `${Number(formatEther(xneutroBalance)).toFixed(2)}`;
  }, [xneutroBalance]);

  const isApproved = useMemo(() => {
    return Number(allowance) >= debouncedAllocateXneutro;
  }, [allowance, debouncedAllocateXneutro]);

  const { config: approveConfig, refetch: retryApproveConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
      abi: XGRAIL_ABI,
      functionName: "getUsageApproval",
      args: [address, NEXT_PUBLIC_DIVIDENDS_CONTRACT],
    });
  const { write: approve, isLoading: isLoadingApprove } = useContractWrite({
    ...approveConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash });
    },
  });

  const { config: allocateConfig, refetch: retryAllocateConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
      abi: XGRAIL_ABI,
      functionName: "allocate",
      args: [NEXT_PUBLIC_DIVIDENDS_CONTRACT, debouncedAllocateXneutro, "0x"],
    });
  const { write: allocate, isLoading: isLoadingAllocate } = useContractWrite({
    ...allocateConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash });
    },
  });

  const onSubmit = async () => {
    setIsLoading(true);
    if (!address) return new Error("Not connected");

    if (!isApproved) {
      approve?.();
    }

    if (isApproved) {
      allocate?.();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Modal>
          <ModalOpenButton>
            <button className="border rounded px-3 py-1 border-amber-500 text-black font-semibold bg-amber-500">
              +
            </button>
          </ModalOpenButton>
          <ModalContents>
            {() => (
              <div className="border border-red-500">
                <div className="flex flex-col gap-1">
                  <div className="text-xl font-bold">Allocate xNEUTRO</div>
                </div>
                <div className="flex flex-col">
                  <div className="mt-2">Amount</div>
                  <FormField
                    control={form.control}
                    name="allocateXneutro"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputGroup
                            suffix={
                              <button
                                type="button"
                                className="mt-2 rounded-md text-sm font-semibold uppercase leading-5 text-neutral-600"
                                onClick={() =>
                                  form.setValue(
                                    "allocateXneutro",
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
                <div className="flex justify-end text-xs text-neutral-500 mt-2">
                  <div>
                    <span>Wallet Balance:</span>
                    <span> {availableXneutro} GRAIL</span>
                  </div>
                </div>
                {(() => {
                  if (!isApproved) {
                    return (
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={!approve}
                        loading={isLoadingApprove}
                      >
                        Approve GRAIL
                      </Button>
                    );
                  }
                  return (
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={!allocate}
                      loading={isLoadingAllocate}
                    >
                      Convert GRAIL
                    </Button>
                  );
                })()}
              </div>
            )}
          </ModalContents>
        </Modal>
      </form>
    </Form>
  );
}
