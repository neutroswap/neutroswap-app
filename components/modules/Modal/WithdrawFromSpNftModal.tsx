"use client";

import { Button } from "@geist-ui/core";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import { Input } from "@/components/elements/Input";
import InputGroup from "@/components/elements/InputGroup";
import MiniButton from "@/components/elements/MiniButton";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { classNames } from "@/shared/helpers/classNamer";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import { RadioGroup } from "@headlessui/react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { Response as GetNFTPositionResponse } from "@/shared/getters/getNFTPosition";
import { currencyFormat } from "@/shared/utils";
import { NEUTRO_HELPER_ABI, NFT_POOL_ABI } from "@/shared/abi";
import { formatEther, parseEther } from "viem";
import { waitForTransaction } from "@wagmi/core";
import { NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT } from "@/shared/helpers/constants";
import { NEUTRO_HELPER_CONTRACT } from "@/shared/helpers/contract";

export default function WithdrawFromSpNftModal(
  props: GetNFTPositionResponse & { onClose: () => void }
) {
  const { address } = useAccount();

  const [isAutoUnbind, setIsAutoUnbind] = useState<boolean>(false);

  // use form utils
  const form = useForm({
    defaultValues: {
      lpToken: "",
    },
  });
  const lpTokenAmount = useWatch({
    control: form.control,
    name: "lpToken",
  });
  const debouncedLpTokenAmount = useDebounceValue(lpTokenAmount, 500);

  const { config: withdrawPositionConfig } = usePrepareContractWrite({
    address: props.id,
    abi: NFT_POOL_ABI,
    functionName: "withdrawFromPosition",
    args: [BigInt(props.tokenId), parseEther(debouncedLpTokenAmount)],
  });

  const { isLoading: isWithdrawPositionLoading, write: withdrawPosition } =
    useContractWrite({
      ...withdrawPositionConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      },
    });

  const { data: lpPrice } = useContractRead({
    address: NEUTRO_HELPER_CONTRACT,
    abi: NEUTRO_HELPER_ABI,
    functionName: "getTokenPrice",
    args: [props.lpToken],
  });

  const formattedLpPrice = +formatEther(lpPrice ?? BigInt(0));

  const remainingValue = +props.amount - +debouncedLpTokenAmount;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => withdrawPosition?.())}>
        <div className="animate-in slide-in-from-right-1/4 duration-200">
          <div>
            <div className="font-semibold text-foreground">
              Withdraw from your position
            </div>
            <span className="text-sm text-muted-foreground">
              Recover underlying token from this spNFT
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">Amount</div>
              <span className="text-sm text-muted-foreground">
                Balance {props.amount} LP
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <FormField
                control={form.control}
                name="lpToken"
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
                          onClick={() => form.setValue("lpToken", props.amount)}
                        >
                          MAX
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-foreground font-semibold uppercase tracking-wide mt-6 mb-2">
                Estimates
              </div>
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                  Withdrawal Value
                </div>
                <span className="text-sm">
                  $
                  {currencyFormat(
                    +debouncedLpTokenAmount * formattedLpPrice,
                    2,
                    0.01
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                  Remaining Value
                </div>
                <span className="text-sm">
                  ${currencyFormat(remainingValue, 2, 0.01)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button
              className={classNames(
                "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                "text-white dark:text-primary",
                "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50"
              )}
              onClick={() => props.onClose()}
            >
              Cancel
            </Button>
            <Button
              className={classNames(
                "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                "text-white dark:text-primary",
                "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50"
              )}
              disabled={!withdrawPosition}
              loading={isWithdrawPositionLoading}
              onClick={() => withdrawPosition?.()}
            >
              Remove position
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
