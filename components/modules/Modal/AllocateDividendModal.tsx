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
      await refetchAllowance();
      await retryAllocateConfig();
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
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      await refetchAllowance();
      form.setValue("allocateXneutro", "");
    },
  });

  //onSubmit handler
  // const onSubmit = async () => {
  //   setIsLoading(true);
  //   if (!address) return new Error("Not connected");

  //   if (!isApproved) {
  //     approve?.();
  //   }

  //   if (isApproved) {
  //     allocate?.();
  //   }
  // };

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
          +
        </Button>
      </ModalOpenButton>
      <ModalContents>
        {() => (
          <Form {...form}>
            {/* <form onSubmit={form.handleSubmit(onSubmit)}> */}
            <div className="box-border">
              <div className="flex flex-col gap-1">
                <div className="text-xl font-bold text-foreground">
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
                              form.setValue("allocateXneutro", xneutroBalance)
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
                  <span>Wallet Balance:</span>
                  <span> {availableXneutro} xNEUTRO</span>
                </div>
              </div>
              {(() => {
                if (!isApproved) {
                  return (
                    <Button
                      className={classNames(
                        "!flex !items-center !py-5 !mt-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-primary !normal-case",
                        "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                        "disabled:opacity-50"
                      )}
                      disabled={!approve}
                      loading={isLoadingApprove}
                      onClick={() => approve?.()}
                    >
                      Approve xNEUTRO
                    </Button>
                  );
                }
                return (
                  <Button
                    className={classNames(
                      "!flex !items-center !py-5 !mt-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                      "text-white dark:text-primary !normal-case",
                      "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                      "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                      "disabled:opacity-50"
                    )}
                    disabled={!allocate}
                    loading={isLoadingAllocate}
                    onClick={() => allocate?.()}
                  >
                    Allocate xNEUTRO
                  </Button>
                );
              })()}
            </div>
            {/* </form> */}
          </Form>
        )}
      </ModalContents>
    </Modal>
  );
}
