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
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { Button } from "@geist-ui/core";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import {
  DIVIDENDS_CONTRACT,
  XNEUTRO_CONTRACT,
} from "@/shared/helpers/contract";
import { classNames } from "@/shared/helpers/classNamer";

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
  const { refetch: refetchAllocated, isFetching: isFetchingAllocated } =
    useContractRead({
      enabled: Boolean(address!),
      address: XNEUTRO_CONTRACT,
      abi: XNEUTRO_ABI,
      functionName: "getUsageAllocation",
      args: [address!, DIVIDENDS_CONTRACT],
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
      address: XNEUTRO_CONTRACT,
      abi: XNEUTRO_ABI,
      functionName: "deallocate",
      args: [
        DIVIDENDS_CONTRACT,
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
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        await refetchAllocated();
        form.setValue("deallocateXneutro", "");
      },
    });

  return (
    <Modal>
      <ModalOpenButton>
        <Button
          scale={0.25}
          className={classNames(
            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm !text-base",
            "text-white dark:text-primary",
            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
            "disabled:opacity-50"
          )}
        >
          -
        </Button>
      </ModalOpenButton>
      <ModalContents>
        {() => (
          <Form {...form}>
            <div className="box-border">
              <div className="flex flex-col gap-1">
                <div className="text-xl font-bold text-foreground">
                  Deallocate xNEUTRO
                </div>
              </div>
              <div className="flex flex-col">
                <div className="mt-2 text-muted-foreground">Amount</div>
                <FormField
                  control={form.control}
                  name="deallocateXneutro"
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
                                "deallocateXneutro",
                                availableAllocatedXneutro
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
              <div className="flex justify-end text-xs text-neutral-500 mt-2">
                <div>
                  <span>Allocated Balance:</span>
                  <span> {availableAllocatedXneutro} xNEUTRO</span>
                </div>
              </div>
              <Button
                className={classNames(
                  "!flex !items-center !py-5 !mt-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                  "text-white dark:text-primary !normal-case",
                  "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                  "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                  "disabled:opacity-50"
                )}
                disabled={!deallocate}
                loading={isLoadingDeallocate}
                onClick={() => deallocate?.()}
              >
                Deallocate xNEUTRO
              </Button>
            </div>
          </Form>
        )}
      </ModalContents>
    </Modal>
  );
}
