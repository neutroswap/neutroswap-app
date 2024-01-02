"use client";

import { Button } from "@/components/elements/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import { Input } from "@/components/elements/Input";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { formatEther, parseEther } from "viem";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWalletClient,
} from "wagmi";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/elements/Collapsible";
import { cn, currencyFormat } from "@/shared/utils";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { Response as GetNFTPositionResponse } from "@/shared/getters/getNFTPosition";
import { useBalanceAndAllowance } from "@/shared/hooks/useBalanceAndAllowance";
import { ERC20_ABI, NEUTRO_HELPER_ABI, NFT_POOL_ABI } from "@/shared/abi";
import { waitForTransaction } from "@wagmi/core";
import { NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT } from "@/shared/helpers/constants";
import { CaretDown } from "@phosphor-icons/react";
import { NEUTRO_HELPER_CONTRACT } from "@/shared/helpers/contract";

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
    functionName: "getTotalValueOfLiquidity",
    args: [props.lpToken],
  });

  const onSubmit = async () => {
    setIsLoading(true);
    () => approveLp?.();
  };

  return (
    // <Modal>
    //   <ModalOpenButton>
    //     <MiniButton type="button">
    //       <ArrowDownTrayIcon className="w-7 h-7 mx-auto text-amber-500" />
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
    //               Add
    //             </span>
    //             <span className="text-xl font-semibold text-black dark:text-white">
    //               to your position
    //             </span>
    //           </div>

    //           <div className="flex justify-center">
    //             <div className="text-neutral-500">
    //               Deposit more into this spNFT to increase your yield.
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
    //             <div className="px-2 py-1">Estimates</div>
    //           </div>

    //           <div className="flex flex-col px-2 mt-2 text-sm">
    //             <div className="w-full flex justify-between">
    //               <div>Deposit Value</div>
    //               <div className="text-neutral-500">
    //                 $0.2 -&gt; <span className="text-white">$0.21</span>
    //               </div>
    //             </div>

    //             <Collapsible.Root
    //               className="w-full"
    //               open={open}
    //               onOpenChange={setOpen}
    //             >
    //               <Collapsible.Trigger asChild>
    //                 <div className="w-full flex justify-between hover:cursor-pointer hover:bg-neutral-900 py-2 rounded-sm ">
    //                   <div className="flex">
    //                     <div className="underline">Total APR</div>
    //                     <ChevronDownIcon className="h-5 ml-1" />
    //                   </div>
    //                   <div className="text-neutral-500">
    //                     21.96% -&gt;{" "}
    //                     <span className="text-amber-500">30.15%</span>
    //                   </div>
    //                 </div>
    //               </Collapsible.Trigger>

    //               <Collapsible.Content className="py-2 flex flex-col gap-2 p-2">
    //                 <div className="w-full flex justify-between">
    //                   <div>Swap Fees APR</div>
    //                   <div className="text-black dark:text-white">13.76%</div>
    //                 </div>
    //                 <div className="w-full flex justify-between">
    //                   <div>Swap Base APR</div>
    //                   <div className="text-black dark:text-white">8.2%</div>
    //                 </div>
    //                 <div className="w-full flex justify-between">
    //                   <div>Farm Bonus APR</div>
    //                   <div className="text-neutral-500">
    //                     0% -&gt;{" "}
    //                     <span className="text-black dark:text-white">0%</span>
    //                   </div>
    //                 </div>
    //               </Collapsible.Content>
    //             </Collapsible.Root>
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
    //               <Button
    //                 type="submit"
    //                 variant="outline"
    //                 disabled={!approve}
    //                 loading={isLoadingApprove}
    //               >
    //                 Approve
    //               </Button>
    //             )} */}
    //             {/* {!!isApproved && ( */}
    //             <Button
    //               type="submit"
    //               variant="solid"
    //               // disabled={!addLiquidity}
    //               // loading={isLoadingAddLiquidity}
    //               className="!text-black dark:text-white"
    //             >
    //               Add Liquidity
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
      <div className="animate-in slide-in-from-right-1/4 duration-200">
        <div>
          <p className="font-semibold">Add more LP to your spNFT</p>
          <p className="text-sm text-muted-foreground">
            Stake your spNFT into genesis pool to earn extra yield
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">Amount</p>
            <p className="text-sm text-muted-foreground">
              Balance {formatEther(BigInt(balance))} LP
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <FormField
              control={form.control}
              name="lpToken"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              variant="outline"
              className="text-sm"
              onClick={() =>
                form.setValue("lpToken", formatEther(BigInt(balance)))
              }
            >
              MAX
            </Button>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide mt-6 mb-2">
              Estimates
            </p>
            <div className="flex justify-between">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                Deposit Value
              </p>
              <p className="text-sm">
                $
                {currencyFormat(
                  +formatEther(ownedLpInUSD ?? BigInt(0)) * +props.amount,
                  2,
                  0.01
                )}
              </p>
            </div>
            <Collapsible className="w-full">
              <CollapsibleTrigger className="w-full flex justify-between items-center group">
                <div className="flex text-muted-foreground group-hover:text-foreground text-sm items-center transition-colors">
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Total APR
                  </p>
                  <CaretDown
                    className={cn(
                      "flex ml-2 w-3 h-3",
                      "group-data-[state=open]:-rotate-90"
                    )}
                    weight="bold"
                  />
                </div>
                <p className="text-sm">{totalAPR}%</p>
              </CollapsibleTrigger>
              <CollapsibleContent className="CollapsibleContent">
                <div className="space-y-1 ml-2 mt-2">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Swap Fees APR
                    </p>
                    <p className="text-sm">{props.apr.fees}%</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Farm Base APR
                    </p>
                    <p className="text-sm">{props.apr.base}%</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Farm Bonus APR
                    </p>
                    <p className="text-sm">
                      {(props.apr.multiplier.boost +
                        props.apr.multiplier.lock) *
                        props.apr.base}
                      %
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => props.onClose()}
          >
            Cancel
          </Button>

          {(() => {
            if (!isApproved) {
              return (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
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
                type="submit"
                className="w-full text-white"
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
