import { Button } from "@/components/elements/Button";
import { Form } from "@/components/elements/Form";
import MiniButton from "@/components/elements/MiniButton";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import {
  ChevronDownIcon,
  FireIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Slider } from "@/components/elements/Slider";

export default function StakeNitroModal() {
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
          <FireIcon className="w-7 h-7 mx-auto text-sky-500" />
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
                  Stake
                </span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  into a Nitro pool
                </span>
              </div>

              <div className="flex justify-center">
                <div className="text-neutral-500">
                  Deposit your spNFT into a Nitro to earn additional yield
                </div>
              </div>

              <div className="mb-2 font-medium bg-neutral-800 rounded-sm mt-2">
                <div className="flex px-2 py-4 justify-center">
                  No compatible Nitro pool
                </div>
              </div>

              <div className="mb-2 font-medium bg-neutral-800 rounded-sm mt-2 p-2">
                <div className="flex justify-between">
                  <div className="flex items-center ">Token Name</div>
                  <div className="flex flex-col items-center">
                    <div>Logo</div>
                    <div className="text-xs">Rewards</div>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex items-center ">
                    <CurrencyDollarIcon className="h-5 text-amber-500 mr-1" />
                    <span>
                      $953.7k
                      <span className="text-neutral-400 text-xs">
                        &nbsp;TVL
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center ">
                    <ReceiptPercentIcon className="h-5 text-amber-500 mr-1" />
                    <span>
                      $953.7k
                      <span className="text-neutral-400 text-xs">
                        &nbsp;TVL
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex mt-2 items-center text-neutral-400 text-xs">
                  <CalendarIcon className="h-4 mr-2" />
                  <span>Ends in 1 day</span>
                </div>

                <div className="flex mt-2 items-center text-neutral-400 text-xs">
                  <LockOpenIcon className="h-4 mr-2" />
                  <span>No requirement</span>
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
                  // variant="solid"
                  // disabled={!addLiquidity}
                  // loading={isLoadingAddLiquidity}
                  className="!text-black dark:text-white"
                >
                  Stake
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
