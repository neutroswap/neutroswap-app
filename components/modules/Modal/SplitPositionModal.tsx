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
import { NEXT_PUBLIC_DIVIDENDS_CONTRACT } from "@/shared/helpers/constants";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { waitForTransaction } from "@wagmi/core";
import { formatEther, parseEther } from "viem";
import { Input } from "@/components/elements/Input";
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
import { Button } from "@/components/elements/Button";
import CirclePlus from "@/public/logo/pluscircle.svg";
import { XCircleIcon } from "@heroicons/react/24/solid";
import TokenDefault from "@/public/tokens_default.svg";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { TokenPicker } from "@/components/modules/Swap/TokenPicker";
import {
  DEFAULT_CHAIN_ID,
  supportedChainID,
  SupportedChainID,
} from "@/shared/types/chain.types";
import { tokens } from "@/shared/statics/tokenList";
import { Token } from "@/shared/types/tokens.types";
import ImportLogo from "@/public/logo/import.svg";
import MiniButton from "@/components/elements/MiniButton";
import DeallocationLogo from "@/public/logo/deallocation.svg";

export default function SplitPositionModal() {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [isLoading, setIsLoading] = useState<boolean>(false);

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
          <DeallocationLogo className="w-7 h-7 mx-auto text-amber-500" />
        </MiniButton>
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
                  <span className="text-amber-500 text-xl font-semibold">
                    Split
                  </span>
                  <span className="text-xl font-semibold text-black dark:text-white">
                    your position
                  </span>
                </div>

                <div className="flex justify-center">
                  <div className="text-neutral-500">
                    Break your spNFT in two smaller positions.
                  </div>
                </div>

                <div className="items-start flex justify-start mt-8">
                  <div className="w-full border-box bg-primary">
                    <span className="text-neutral-500">Amount to split</span>
                  </div>
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
                              //     "allocateXneutro",
                              //     availableXneutro
                              //   )
                              // }
                            >
                              MAX
                            </button>
                          }
                        >
                          <Input
                            type="number"
                            className="mt-2"
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
                    <span>splittable amount:</span>
                    <span> USDC</span>
                    <span>&#x2010;</span>
                    <span>USDC.e</span>
                  </div>
                </div>

                <div className="flex justify-between mt-7 mx-auto items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => close()}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="outline"
                    //   disabled={!approve}
                    //   loading={isLoadingApprove}
                  >
                    Split
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </ModalContents>
    </Modal>
  );
}
