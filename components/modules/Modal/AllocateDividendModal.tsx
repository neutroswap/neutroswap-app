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
import { XNEUTRO_ABI } from "@/shared/abi";
import {
  NEXT_PUBLIC_DIVIDENDS_CONTRACT,
  NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT,
} from "@/shared/helpers/constants";
import { waitForTransaction } from "@wagmi/core";
import { formatEther, parseEther } from "viem";
import { Input } from "@/components/elements/Input";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { Button } from "@/components/elements/Button";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import {
  DIVIDENDS_CONTRACT,
  XNEUTRO_CONTRACT,
} from "@/shared/helpers/contract";

export default function AllocateDividendModal() {
  const { address } = useAccount();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  //useForm utils
  const form = useForm();
  const allocateXneutro = useWatch({
    control: form.control,
    name: "allocateXneutro",
  });
  const debouncedAllocateXneutro = useDebounceValue(allocateXneutro, 500);

  //Get xNEUTRO balance & allowance for Dividend Plugin
  const [xneutroBalance, setXneutroBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const { refetch: refetchBalance, isFetching: isFetchingBalance } =
    useContractRead({
      enabled: Boolean(address!),
      watch: true,
      address: XNEUTRO_CONTRACT,
      abi: XNEUTRO_ABI,
      functionName: "balanceOf",
      args: [address!],
      onSuccess: (data) => {
        let balance = formatEther(data);
        setXneutroBalance(balance);
      },
    });
  const { refetch: refetchAllowance, isFetching: isFetchingAllowance } =
    useContractRead({
      enabled: Boolean(address!),
      watch: true,
      address: XNEUTRO_CONTRACT,
      abi: XNEUTRO_ABI,
      functionName: "getUsageApproval",
      args: [address!, DIVIDENDS_CONTRACT],
      onSuccess: (data) => {
        let allowance = formatEther(data);
        setAllowance(allowance);
      },
    });
  const availableXneutro = useMemo(() => {
    if (!xneutroBalance) return "0";
    return Number(xneutroBalance).toFixed(2);
  }, [xneutroBalance]);
  const isApproved = useMemo(() => {
    return +allowance >= +debouncedAllocateXneutro;
  }, [allowance, debouncedAllocateXneutro]);

  //Write approveUsage function
  const { config: approveConfig, refetch: retryApproveConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: XNEUTRO_CONTRACT,
      abi: XNEUTRO_ABI,
      functionName: "approveUsage",
      args: [
        DIVIDENDS_CONTRACT,
        parseEther(
          debouncedAllocateXneutro ? `${debouncedAllocateXneutro}` : "0"
        ),
      ],
    });

  const { write: approve, isLoading: isLoadingApprove } = useContractWrite({
    ...approveConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      refetchAllowance();
    },
  });

  //Write allocate function
  const { config: allocateConfig, refetch: retryAllocateConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: XNEUTRO_CONTRACT,
      abi: XNEUTRO_ABI,
      functionName: "allocate",
      args: [
        DIVIDENDS_CONTRACT,
        parseEther(
          debouncedAllocateXneutro ? `${debouncedAllocateXneutro}` : "0"
        ),
        "0x",
      ],
    });
  const { write: allocate, isLoading: isLoadingAllocate } = useContractWrite({
    ...allocateConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash });
      refetchAllowance();
    },
  });

  //onSubmit handler
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
    <Modal>
      <ModalOpenButton>
        <button className="border rounded px-3 py-1 border-amber-500 text-black font-semibold bg-amber-500">
          +
        </button>
      </ModalOpenButton>
      <ModalContents>
        {() => (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="box-border">
                <div className="flex flex-col gap-1">
                  <div className="text-xl font-bold text-muted-foreground">
                    Allocate xNEUTRO
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="mt-2 text-muted-foreground">Amount</div>
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
                                className="mt-2 mr-4 items-center justify-center rounded-md text-sm font-semibold uppercase leading-5 text-neutral-600"
                                onClick={() =>
                                  form.setValue(
                                    "allocateXneutro",
                                    availableXneutro
                                  )
                                }
                              >
                                MAX
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
                    <span> {availableXneutro} xNEUTRO</span>
                  </div>
                </div>
                {(() => {
                  if (!isApproved) {
                    return (
                      <Button
                        type="submit"
                        className="w-full mt-5 text-neutral-500"
                        variant="outline"
                        disabled={!approve}
                        loading={isLoadingApprove}
                      >
                        Approve xNEUTRO
                      </Button>
                    );
                  }
                  return (
                    <Button
                      type="submit"
                      className="w-full mt-5 text-neutral-500"
                      variant="outline"
                      disabled={!allocate}
                      loading={isLoadingAllocate}
                    >
                      Allocate xNEUTRO
                    </Button>
                  );
                })()}
              </div>
            </form>
          </Form>
        )}
      </ModalContents>
    </Modal>
  );
}
