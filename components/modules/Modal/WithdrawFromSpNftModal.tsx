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
import { useDebounce } from "@/shared/hooks/useDebounce";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { useAccount } from "wagmi";

export default function WithdrawFromSpNftModal() {
  const { address } = useAccount();

  //useForm utils
  const form = useForm();
  const removeFromPosition = useWatch({
    control: form.control,
    name: "removeFromPosition",
  });
  const debouncedRemoveFromPosition = useDebounce(removeFromPosition, 500);

  return (
    <Modal>
      <ModalOpenButton>
        <MiniButton type="button">
          <ArrowUpTrayIcon className="w-7 h-7 mx-auto text-amber-500" />
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
                  Withdraw
                </span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  from your position
                </span>
              </div>

              <div className="flex justify-center">
                <div className="text-neutral-500">
                  Recover underlying tokens from a spNFT
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
                <div className="px-2 py-1">Options</div>
              </div>

              <div className="mt-4 font-medium bg-neutral-800 rounded-sm">
                <div className="px-2 py-1">Estimates</div>
              </div>

              <div className="flex flex-col px-2 mt-2 text-sm">
                <div className="w-full flex justify-between">
                  <div>Withdrawal Amount</div>
                  <div className="text-black dark:text-white">$0.2</div>
                </div>

                <div className="w-full flex justify-between">
                  <div>Remaining Amount</div>
                  <div className="text-black dark:text-white">$0.2</div>
                </div>
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
                  Withdraw
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
