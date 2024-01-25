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
    functionName: "getTotalValueOfLiquidity",
    args: [props.lpToken],
  });

  const formattedLpPrice = +formatEther(lpPrice ?? BigInt(0));

  const remainingValue = +props.amount - +debouncedLpTokenAmount;

  return (
    // <Modal>
    //   <ModalOpenButton>
    //     <MiniButton type="button">
    //       <ArrowUpTrayIcon className="w-7 h-7 mx-auto text-amber-500" />
    //     </MiniButton>
    //   </ModalOpenButton>

    //   <ModalContents>
    //     {({ close }) => (
    //       <Form {...form}>
    //         {/* <form onSubmit={form.handleSubmit(onSubmit)}> */}
    //         <div className="box-border relative">
    //           <XCircleIcon
    //             onClick={() => close()}
    //             className="h-6 cursor-pointer text-black dark:text-white opacity-50 absolute right-0"
    //           />
    //           <div className="flex items-center justify-between">
    //             <div className="flex items-center justify-center w-full text-xl font-bold text-neutral-500 ">
    //               Token Name
    //             </div>
    //           </div>

    //           <div className="flex justify-center items-center mt-2 gap-2">
    //             <span className="text-amber-500 text-xl font-semibold">
    //               Withdraw
    //             </span>
    //             <span className="text-xl font-semibold text-black dark:text-white">
    //               from your position
    //             </span>
    //           </div>

    //           <div className="flex justify-center">
    //             <div className="text-neutral-500">
    //               Recover underlying tokens from a spNFT
    //             </div>
    //           </div>

    //           <div className="mb-2 font-medium bg-neutral-800 rounded-sm mt-2">
    //             <div className="px-2 py-1">Amount</div>
    //           </div>

    //           <div className="text-xs text-neutral-500">
    //             You need to own ETH-USDC.e LP tokens to directly add more
    //             liquidity to this position. If that&apos;s not the case, head to
    //             the&nbsp;
    //             <Link
    //               href="/pool"
    //               className="text-neutral-500 hover:text-amber-500"
    //             >
    //               liquidity page
    //             </Link>
    //             &nbsp;first.
    //           </div>

    //           <FormField
    //             control={form.control}
    //             name="allocateXneutro"
    //             render={({ field }) => (
    //               <FormItem>
    //                 <FormControl>
    //                   <InputGroup
    //                     suffix={
    //                       <button
    //                         type="button"
    //                         className="mt-2 mr-4 items-center justify-center rounded-md text-sm font-semibold uppercase leading-5 text-neutral-600"
    //                         // onClick={() =>
    //                         //   form.setValue(
    //                         //     "addLiquidity",
    //                         //     availableLpToken
    //                         //   )
    //                         // }
    //                       >
    //                         MAX
    //                       </button>
    //                     }
    //                   >
    //                     <Input
    //                       type="number"
    //                       className="mt-2 !py-[12px]"
    //                       placeholder="0.00"
    //                       {...field}
    //                     ></Input>
    //                   </InputGroup>
    //                 </FormControl>
    //               </FormItem>
    //             )}
    //           ></FormField>

    //           <div className="flex justify-end text-xs text-neutral-500 mt-2">
    //             <div>
    //               <span>Wallet Balance:</span>
    //               {/* <span> {availableXneutro} xNEUTRO</span> */}
    //             </div>
    //           </div>

    //           <div className="mt-4 font-medium bg-neutral-800 rounded-sm">
    //             <div className="px-2 py-1">Options</div>
    //           </div>

    //           <div className="w-full mt-2 px-2 ">
    //             <RadioGroup
    //               value={isAutoUnbind}
    //               onChange={setIsAutoUnbind}
    //               className="flex justify-between"
    //             >
    //               <RadioGroup.Label className="flex flex-col ">
    //                 <span>LP auto-unbind</span>
    //                 <span className="text-xs text-neutral-500">
    //                   Auto unbind your underlying LP tokens
    //                 </span>
    //               </RadioGroup.Label>
    //               <div className="flex items-center bg-neutral-800 cursor-pointer rounded-md p-1">
    //                 <RadioGroup.Option value={true}>
    //                   {({ checked }) => (
    //                     <div
    //                       className={classNames(
    //                         checked
    //                           ? "text-neutral-900 dark:text-neutral-900 bg-white dark:bg-amber-500 shadow"
    //                           : "text-neutral-500 dark:text-neutral-400 ",
    //                         "p-1 rounded-md text-sm "
    //                       )}
    //                     >
    //                       ON
    //                     </div>
    //                   )}
    //                 </RadioGroup.Option>
    //                 <RadioGroup.Option value={false}>
    //                   {({ checked }) => (
    //                     <div
    //                       className={classNames(
    //                         checked
    //                           ? "text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 shadow"
    //                           : "text-neutral-500 dark:text-neutral-400",
    //                         "p-1 rounded-md text-sm"
    //                       )}
    //                     >
    //                       OFF
    //                     </div>
    //                   )}
    //                 </RadioGroup.Option>
    //               </div>
    //             </RadioGroup>
    //           </div>

    //           <div className="mt-4 font-medium bg-neutral-800 rounded-sm">
    //             <div className="px-2 py-1">Estimates</div>
    //           </div>

    //           <div className="flex flex-col px-2 mt-2 text-sm">
    //             <div className="w-full flex justify-between">
    //               <div>Withdrawal Amount</div>
    //               <div className="text-black dark:text-white">$0.2</div>
    //             </div>

    //             <div className="w-full flex justify-between">
    //               <div>Remaining Amount</div>
    //               <div className="text-black dark:text-white">$0.2</div>
    //             </div>
    //           </div>

    //           <div className="flex gap-2 mt-4">
    //             <Button
    //               type="button"
    //               variant="outline"
    //               onClick={close}
    //               className="!text-black !dark:text-white"
    //             >
    //               Cancel
    //             </Button>
    //             {/* {!isApproved && (
    //             <Button
    //               type="submit"
    //               variant="outline"
    //               disabled={!approve}
    //               loading={isLoadingApprove}
    //             >
    //               Approve
    //             </Button>
    //           )} */}
    //             {/* {!!isApproved && ( */}
    //             <Button
    //               type="submit"
    //               variant="solid"
    //               // disabled={!addLiquidity}
    //               // loading={isLoadingAddLiquidity}
    //               className="!text-black dark:text-white"
    //             >
    //               Withdraw
    //             </Button>
    //             {/* )} */}
    //           </div>
    //         </div>
    //         {/* </form> */}
    //       </Form>
    //     )}
    //   </ModalContents>
    // </Modal>
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
                          onClick={() => form.setValue("lpToken", props.amount)} // TODO: change amount to read contract
                        >
                          MAX
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {/* <div className="flex items-center space-x-2 mt-2">
              <Checkbox id="autobind" />
              <label
                htmlFor="autobind"
                className="text-sm mt-1 select-none leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Auto unbind your LP token
              </label>
            </div> */}

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
