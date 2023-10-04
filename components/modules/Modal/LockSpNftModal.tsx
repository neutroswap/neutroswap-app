import Button from "@/components/elements/Button";
import { Form } from "@/components/elements/Form";
import MiniButton from "@/components/elements/MiniButton";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { ChevronDownIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Slider } from "@/components/elements/Slider";

export default function LockSpNftModal() {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [lockDuration, setLockDuration] = useState(0);

  const handleSliderChange = (event: number[]) => {
    setLockDuration(Number(event));
  };

  const handleSetMaxBonus = () => {
    setLockDuration(180);
  };

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
          <>
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

              <div className="flex px-2 mt-2 text-sm justify-between">
                <div>
                  Lock Duration:{" "}
                  <span className="text-amber-500">{lockDuration}</span> Days
                </div>
                <div
                  className="cursor-pointer text-amber-500"
                  onClick={handleSetMaxBonus}
                >
                  Set max bonus
                </div>
              </div>

              <div className="mt-5 px-2 ">
                <Slider
                  defaultValue={[0]}
                  value={[lockDuration]}
                  onValueChange={(e) => handleSliderChange(e)}
                  max={180}
                  step={1}
                />
              </div>

              <div className="flex justify-end text-xs text-neutral-500 mt-2 px-2">
                <div>
                  <span>0% &nbsp;</span>
                  <span>Lock Bonus</span>
                </div>
              </div>

              {lockDuration > 0 && (
                <>
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
                          <div className="text-black dark:text-white">
                            13.76%
                          </div>
                        </div>
                        <div className="w-full flex justify-between">
                          <div>Swap Base APR</div>
                          <div className="text-black dark:text-white">8.2%</div>
                        </div>
                        <div className="w-full flex justify-between">
                          <div>Farm Bonus APR</div>
                          <div className="text-neutral-500">
                            0% -&gt;{" "}
                            <span className="text-black dark:text-white">
                              0%
                            </span>
                          </div>
                        </div>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </div>
                </>
              )}

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
          </>
        )}
      </ModalContents>
    </Modal>
  );
}
