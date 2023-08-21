import Button from "@/components/elements/Button";
import { Form } from "@/components/elements/Form";
import MiniButton from "@/components/elements/MiniButton";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { LockClosedIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useNetwork } from "wagmi";

export default function LockSpNftModal() {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm();

  const onSubmit = async () => {
    setIsLoading(true);
    if (!address) return new Error("Not connected");

    // if (!isApproved) {
    //   approve?.();
    // }

    // if (isApproved) {
    //   allocate?.();
  };

  return (
    <Modal>
      <ModalOpenButton>
        <MiniButton type="button">
          <LockClosedIcon className="w-7 h-7 mx-auto text-amber-500" />
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
                  Lock
                </span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  your position
                </span>
              </div>

              <div className="flex justify-center">
                <div className="text-neutral-500">
                  Provide long-term liquidity to increase your yield
                </div>
              </div>

              <div className="mb-2 font-medium bg-neutral-800 rounded-sm mt-2">
                <div className="px-2 py-1">Settings</div>
              </div>

              <div className="flex justify-end text-xs text-neutral-500 mt-2">
                <div>
                  <span>0%</span>
                  <span>Lock Bonus</span>
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
                  Lock
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
