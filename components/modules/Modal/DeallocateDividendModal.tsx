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
import Input from "@/components/elements/Input";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import Button from "@/components/elements/Button";
import useDebounceValue from "@/shared/hooks/useDebounceValue";

export default function AllocateDividendModal() {
  const { address } = useAccount();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  //useForm utils
  const form = useForm();
  const deallocateXneutro = useWatch({
    control: form.control,
    name: "deallocateXneutro",
  });
  const debouncedAllocateXneutro = useDebounceValue(deallocateXneutro, 500);

  //Get xNEUTRO balance & allowance for Dividend Plugin
  const [allocatedBalance, setAllocatedBalance] = useState("0");
  const { refetch: allocated, isFetching: isFetchingAllocated } =
    useContractRead({
      enabled: Boolean(address!),
      watch: true,
      address: NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT as `0x${string}`,
      abi: XNEUTRO_ABI,
      functionName: "getUsageAllocation",
      args: [address!, NEXT_PUBLIC_DIVIDENDS_CONTRACT as `0x${string}`],
      onSuccess: (data) => {
        let balance = formatEther(data);
        setAllocatedBalance(balance);
      },
    });
  const availableAllocatedXneutro = useMemo(() => {
    if (!allocatedBalance) return "0";
    return Number(allocatedBalance).toFixed(2);
  }, [allocatedBalance]);

  //Write deallocate function
  const { config: deallocateConfig, refetch: retryDeallocateConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address),
      address: NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT as `0x${string}`,
      abi: XNEUTRO_ABI,
      functionName: "deallocate",
      args: [
        NEXT_PUBLIC_DIVIDENDS_CONTRACT as `0x${string}`,
        parseEther(
          debouncedAllocateXneutro ? `${debouncedAllocateXneutro}` : "0"
        ),
        "0x",
      ],
    });
  const { write: deallocate, isLoading: isLoadingDeallocate } =
    useContractWrite({
      ...deallocateConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
      },
    });

  return (
    <Modal>
      <ModalOpenButton>
        <button className="border rounded px-3 py-1 font-semibold">-</button>
      </ModalOpenButton>
      <ModalContents>
        {() => (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => deallocate?.())}>
              <div className="box-border">
                <div className="flex flex-col gap-1">
                  <div className="text-xl font-bold">Deallocate xNEUTRO</div>
                </div>
                <div className="flex flex-col">
                  <div className="mt-2">Amount</div>
                  <FormField
                    control={form.control}
                    name="deallocateXneutro"
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
                                    "deallocateXneutro",
                                    availableAllocatedXneutro
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
                    <span>Allocated Balance:</span>
                    <span> {availableAllocatedXneutro} xNEUTRO</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!deallocate}
                  loading={isLoadingDeallocate}
                >
                  Deallocate xNEUTRO
                </Button>
              </div>
            </form>
          </Form>
        )}
      </ModalContents>
    </Modal>
  );
}
