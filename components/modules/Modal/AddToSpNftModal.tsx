import Button from "@/components/elements/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import Input from "@/components/elements/Input";
import InputGroup from "@/components/elements/InputGroup";
import MiniButton from "@/components/elements/MiniButton";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import DeallocationLogo from "@/public/logo/deallocation.svg";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { formatEther } from "viem";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAccount, useContractRead } from "wagmi";
import useDebounceValue from "@/shared/hooks/useDebounceValue";

export default function AddToSpNftModal() {
  const { address } = useAccount();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  //useForm utils
  const form = useForm();
  const addToPosition = useWatch({
    control: form.control,
    name: "addToPosition",
  });
  const debouncedAddToPosition = useDebounceValue(addToPosition, 500);

  //Get LP Token balance & allowance
  // const [lpTokenBalance, setLpTokenBalance] = useState("0");
  // const [allowance, setAllowance] = useState("0");
  // const { refetch: refetchBalance, isFetching: isFetchingBalance } =
  //   useContractRead({
  //     enabled: Boolean(address!),
  //     watch: true,
  //     address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
  //     abi: XGRAIL_ABI,
  //     functionName: "balanceOf",
  //     args: [address!],
  //     onSuccess: (data) => {
  //       let balance = formatEther(data);
  //       setLpTokenBalance(balance);
  //     },
  //   });
  // const { refetch: refetchAllowance, isFetching: isFetchingAllowance } =
  //   useContractRead({
  //     enabled: Boolean(address!),
  //     watch: true,
  //     address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
  //     abi: XGRAIL_ABI,
  //     functionName: "getUsageApproval",
  //     args: [address!, NEXT_PUBLIC_DIVIDENDS_CONTRACT as `0x${string}`],
  //     onSuccess: (data) => {
  //       let allowance = formatEther(data);
  //       setAllowance(allowance);
  //     },
  //   });
  // const availableLpToken = useMemo(() => {
  //   if (!lpTokenBalance) return "0";
  //   return Number(lpTokenBalance).toFixed(2);
  // }, [lpTokenBalance]);
  // const isApproved = useMemo(() => {
  //   return +allowance >= +debouncedAddLiquidity;
  // }, [allowance, debouncedAddLiquidity]);

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
        <MiniButton type="button">
          <ArrowDownTrayIcon className="w-7 h-7 mx-auto text-amber-500" />
        </MiniButton>
      </ModalOpenButton>

      <ModalContents>
        {({ close }) => (
          <Form {...form}>
            {/* <form onSubmit={form.handleSubmit(onSubmit)}> */}
            <div className="box-border relative">
              <XCircleIcon
                onClick={() => close()}
                className="h-6 cursor-pointer text-black dark:text-white opacity-50 absolute right-0"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-full text-xl font-bold text-neutral-500 ">
                  Token Name
                </div>
              </div>

              <div className="flex justify-center items-center mt-2 gap-2">
                <span className="text-amber-500 text-xl font-semibold">
                  Add
                </span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  to your position
                </span>
              </div>

              <div className="flex justify-center">
                <div className="text-neutral-500">
                  Deposit more into this spNFT to increase your yield.
                </div>
              </div>

              <div className="mb-2 font-medium bg-neutral-800 rounded-sm mt-2">
                <div className="px-2 py-1">Amount</div>
              </div>

              <div className="text-xs text-neutral-500">
                You need to own ETH-USDC.e LP tokens to directly add more
                liquidity to this position. If that&apos;s not the case, head to
                the&nbsp;
                <Link
                  href="/pool"
                  className="text-neutral-500 hover:text-amber-500"
                >
                  liquidity page
                </Link>
                &nbsp;first.
              </div>

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
                            // onClick={() =>
                            //   form.setValue(
                            //     "addLiquidity",
                            //     availableLpToken
                            //   )
                            // }
                          >
                            MAX
                          </button>
                        }
                      >
                        <Input
                          type="number"
                          className="mt-2 !py-[12px]"
                          placeholder="0.00"
                          {...field}
                        ></Input>
                      </InputGroup>
                    </FormControl>
                  </FormItem>
                )}
              ></FormField>

              <div className="flex justify-end text-xs text-neutral-500 mt-2">
                <div>
                  <span>Wallet Balance:</span>
                  {/* <span> {availableXneutro} xNEUTRO</span> */}
                </div>
              </div>

              <div className="mt-4 font-medium bg-neutral-800 rounded-sm">
                <div className="px-2 py-1">Estimates</div>
              </div>

              <div className="flex flex-col px-2 mt-2 text-sm">
                <div className="w-full flex justify-between">
                  <div>Deposit Value</div>
                  <div className="text-neutral-500">
                    $0.2 -&gt; <span className="text-white">$0.21</span>
                  </div>
                </div>

                <Collapsible.Root
                  className="w-full"
                  open={open}
                  onOpenChange={setOpen}
                >
                  <Collapsible.Trigger asChild>
                    <div className="w-full flex justify-between hover:cursor-pointer hover:bg-neutral-900 py-2 rounded-sm ">
                      <div className="flex">
                        <div className="underline">Total APR</div>
                        <ChevronDownIcon className="h-5 ml-1" />
                      </div>
                      <div className="text-neutral-500">
                        21.96% -&gt;{" "}
                        <span className="text-amber-500">30.15%</span>
                      </div>
                    </div>
                  </Collapsible.Trigger>

                  <Collapsible.Content className="py-2 flex flex-col gap-2 p-2">
                    <div className="w-full flex justify-between">
                      <div>Swap Fees APR</div>
                      <div className="text-black dark:text-white">13.76%</div>
                    </div>
                    <div className="w-full flex justify-between">
                      <div>Swap Base APR</div>
                      <div className="text-black dark:text-white">8.2%</div>
                    </div>
                    <div className="w-full flex justify-between">
                      <div>Farm Bonus APR</div>
                      <div className="text-neutral-500">
                        0% -&gt;{" "}
                        <span className="text-black dark:text-white">0%</span>
                      </div>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={close}
                  className="!text-black !dark:text-white"
                >
                  Cancel
                </Button>
                {/* {!isApproved && (
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={!approve}
                    loading={isLoadingApprove}
                  >
                    Approve
                  </Button>
                )} */}
                {/* {!!isApproved && ( */}
                <Button
                  type="submit"
                  variant="solid"
                  // disabled={!addLiquidity}
                  // loading={isLoadingAddLiquidity}
                  className="!text-black dark:text-white"
                >
                  Add Liquidity
                </Button>
                {/* )} */}
              </div>
            </div>
            {/* </form> */}
          </Form>
        )}
      </ModalContents>
    </Modal>
  );
}
