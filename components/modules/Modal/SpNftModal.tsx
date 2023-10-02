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
import { XGRAIL_ABI } from "@/shared/abi";
import {
  NEXT_PUBLIC_DIVIDENDS_CONTRACT,
  NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT,
} from "@/shared/helpers/constants";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { waitForTransaction } from "@wagmi/core";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import Input from "@/components/elements/Input";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useNetwork,
} from "wagmi";
import Button from "@/components/elements/Button";
import { BigNumber } from "ethers";
import CirclePlus from "@/public/logo/pluscircle.svg";
import { XCircleIcon } from "@heroicons/react/24/solid";
import TokenDefault from "@/public/tokens_default.svg";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import {
  DEFAULT_CHAIN_ID,
  supportedChainID,
  SupportedChainID,
} from "@/shared/types/chain.types";
import { tokens } from "@/shared/statics/tokenList";
import { Token } from "@/shared/types/tokens.types";
import DeallocationLogo from "@/public/logo/deallocation.svg";
import MiniButton from "@/components/elements/MiniButton";
import * as Collapsible from "@radix-ui/react-collapsible";
import AddToSpNftModal from "./AddToSpNftModal";
import WithdrawFromSpNftModal from "./WithdrawFromSpNftModal";
import LockSpNftModal from "./LockSpNftModal";
import BoostSpNftModal from "./BoostSpNftModal";
import StakeNitroModal from "./StakeNitroModal";

export default function SpNftModal() {
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
        <button className="px-3 py-2 border rounded-md border-neutral-200 dark:border-neutral-800 mr-6 flex space-x-2">
          <span className="text-black dark:text-white text-sm font-semibold">
            Import token
          </span>
        </button>
      </ModalOpenButton>
      <ModalContents>
        {({ close }) => (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="box-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-full text-xl font-bold text-neutral-500">
                    Token Name
                  </div>
                  <XCircleIcon
                    onClick={() => close()}
                    className="h-6 cursor-pointer text-black dark:text-white opacity-50"
                  />
                </div>

                <div className="flex justify-center items-center mt-2 gap-2">
                  <span className="text-xl font-semibold">$0.1</span>
                  <span className="text-xl font-semibold"> &#x2014;</span>
                  <span className="text-amber-500 text-xl font-semibold">
                    9.27 %
                  </span>
                  <span className="text-xl font-semibold">APR</span>
                </div>
                <div className="flex justify-center">
                  <div className="text-neutral-500">
                    This position has{" "}
                    <span className="text-black dark:text-white">$0.01</span>{" "}
                    pending farming rewards
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="flex flex-row justify-center space-x-7 m-5">
                    <div className="flex flex-col items-center">
                      <AddToSpNftModal />
                      <div className="text-xs text-amber-500 mt-2 text-center">
                        Add
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <WithdrawFromSpNftModal />
                      <div className="text-xs text-amber-500 mt-2 text-center">
                        Withdraw
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <LockSpNftModal />
                      <div className="text-xs text-amber-500 mt-2 text-center">
                        Lock
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <BoostSpNftModal />
                      <div className="text-xs text-amber-500 mt-2 text-center whitespace-nowrap">
                        Yield Boost
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <StakeNitroModal />
                      <div className="text-xs text-sky-500 mt-2 text-center">
                        Stake in Nitro
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mb-5">
                  <Collapsible.Root
                    className="w-[300px]"
                    open={open}
                    onOpenChange={setOpen}
                  >
                    <Collapsible.Trigger asChild>
                      <div className="flex justify-center items-center">
                        <button className="text-xs flex gap-2 text-neutral-500">
                          More actions
                          <ChevronDownIcon className="w-3 h-3 mt-1" />
                        </button>
                      </div>
                    </Collapsible.Trigger>

                    <Collapsible.Content>
                      <div className="flex flex-row justify-center space-x-7 m-5">
                        <div className="flex flex-col items-center">
                          <MiniButton type="button">
                            <DeallocationLogo className="w-7 h-7 mx-auto text-amber-500" />
                          </MiniButton>
                          <div className="text-xs text-amber-500 mt-2 text-center">
                            Transfer
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <MiniButton type="button">
                            <DeallocationLogo className="w-7 h-7 mx-auto text-amber-500" />
                          </MiniButton>
                          <div className="text-xs text-amber-500 mt-2 text-center">
                            Split
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <MiniButton type="button">
                            <DeallocationLogo className="w-7 h-7 mx-auto text-amber-500" />
                          </MiniButton>
                          <div className="text-xs text-amber-500 mt-2 text-center">
                            Merge
                          </div>
                        </div>
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </div>

                <div className="items-start flex justify-start">
                  <div className="w-full border-box bg-primary">
                    <span className="text-neutral-500">Properties</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 mb-7">
                  <div>
                    <div className="flex justify-between items-center py-1 px-2">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <DeallocationLogo className="w-4 h-4" />
                          <div className="text-md text-neutral-500 mb-0">
                            Yield Booster
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">10%</div>
                        <span className="text-xs text-neutral-500">
                          Farm APR
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center py-1 px-2">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <DeallocationLogo className="w-4 h-4" />
                          <div className="text-md text-neutral-500 mb-0">
                            Unlocked
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">-</div>
                        {/* <span className="text-xs text-neutral-500">Farm APR</span> */}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center py-1 px-2">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <DeallocationLogo className="w-4 h-4" />
                          <div>
                            <div className="text-md text-neutral-500 mb-0">
                              Boosted
                            </div>
                            <span className="text-xs text-neutral-500">
                              2x multiplier
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          0.00001 xNEUTRO
                        </div>
                        <span className="text-xs text-neutral-500">
                          Boost Allocation
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center py-1 px-2">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center space-x-2">
                          <DeallocationLogo className="w-4 h-4" />
                          <div className="text-md text-neutral-500 mb-0">
                            Not staked in Nitro pools
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">-</div>
                        {/* <span className="text-xs text-neutral-500">Farm APR</span> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="items-start flex justify-start">
                  <div className="w-full border-box bg-primary">
                    <span className="text-neutral-500">Data breakdown</span>
                  </div>
                </div>

                <Button type="button" variant="outline" onClick={() => close()}>
                  Close
                </Button>
              </div>
            </form>
          </Form>
        )}
      </ModalContents>
    </Modal>
  );
}
