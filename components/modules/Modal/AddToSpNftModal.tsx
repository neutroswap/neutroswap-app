"use client";

import { Button } from "@geist-ui/core";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import { Input } from "@/components/elements/Input";
import { formatEther, parseEther } from "viem";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import { currencyFormat } from "@/shared/utils";
import { Response as GetNFTPositionResponse } from "@/shared/getters/getNFTPosition";
import { useBalanceAndAllowance } from "@/shared/hooks/useBalanceAndAllowance";
import { ERC20_ABI, NEUTRO_HELPER_ABI, NFT_POOL_ABI } from "@/shared/abi";
import { waitForTransaction } from "@wagmi/core";
import { NEUTRO_HELPER_CONTRACT } from "@/shared/helpers/contract";
import WalletIcon from "@/public/icons/wallet.svg";
import { classNames } from "@/shared/helpers/classNamer";

export default function AddToSpNftModal(
  props: GetNFTPositionResponse & { onClose: () => void }
) {
  const { address } = useAccount();

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState<boolean>(false);

  const {
    balance,
    allowance,
    refetch: refetchBalanceAndAllowance,
  } = useBalanceAndAllowance(props.lpToken, props.id);

  const availableLpToken = useMemo(() => {
    if (!balance) return "0";
    return `${Number(formatEther(balance)).toFixed(2)}`;
  }, [balance]);

  const { multiplier, ...apr } = props.apr;
  const totalAPR = Object.values(apr).reduce((prev, curr) => {
    return prev + curr;
  });

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

  //checking whether the token is approved or not
  const isApproved = useMemo(() => {
    let formattedAllowance = formatEther(allowance);
    return +formattedAllowance >= +debouncedLpTokenAmount;
  }, [debouncedLpTokenAmount, allowance]);

  const { config: approveLpConfig } = usePrepareContractWrite({
    address: props.lpToken,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      props.id,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });

  const { isLoading: isApprovingLp, write: approveLp } = useContractWrite({
    ...approveLpConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      await refetchBalanceAndAllowance();
    },
  });

  const { config: addToPositionConfig } = usePrepareContractWrite({
    address: props.id,
    abi: NFT_POOL_ABI,
    functionName: "addToPosition",
    args: [BigInt(props.tokenId), parseEther(debouncedLpTokenAmount)],
  });

  const { isLoading: isAddToPositionLoading, write: addToPosition } =
    useContractWrite({
      ...addToPositionConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash });
      },
    });

  const { data: ownedLpInUSD } = useContractRead({
    address: NEUTRO_HELPER_CONTRACT,
    abi: NEUTRO_HELPER_ABI,
    functionName: "getTokenPrice",
    args: [props.lpToken],
  });

  const onSubmit = async () => {
    setIsLoading(true);
    () => approveLp?.();
  };

  return (
    <Form {...form}>
      <div className="animate-in slide-in-from-right-1/4 duration-200">
        <div>
          <div className="font-semibold text-foreground">
            Add more LP to your spNFT
          </div>
          <span className="text-sm text-muted-foreground">
            Stake your spNFT into genesis pool to earn extra yield
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">Amount</div>
            <div className="flex items-center">
              <WalletIcon className="mr-1 w-3 h-3 md:w-4 md:h-4 text-neutral-400 dark:text-neutral-600" />
              <span className="text-sm">{formatEther(BigInt(balance))} LP</span>
            </div>
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
                        onClick={() =>
                          form.setValue("lpToken", formatEther(BigInt(balance)))
                        }
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
                Deposit Value
              </div>
              <span className="text-sm">
                $
                {currencyFormat(
                  +formatEther(ownedLpInUSD ?? BigInt(0)) * +props.amount,
                  2,
                  0.01
                )}
              </span>
            </div>

            <div className="w-full flex justify-between items-center group">
              <div className="flex text-muted-foreground text-sm items-center">
                <div className="text-xs font-semibold uppercase tracking-wide">
                  Total APR
                </div>
              </div>
              <span className="text-sm">{totalAPR}%</span>
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
                  disabled={!approveLp}
                  loading={isApprovingLp}
                  onClick={() => approveLp?.()}
                >
                  Approve LP
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
                disabled={!addToPosition}
                loading={isAddToPositionLoading}
                onClick={() => addToPosition?.()}
              >
                Add to position
              </Button>
            );
          })()}
        </div>
      </div>
    </Form>
  );
}
