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
import ImportLogo from "@/public/logo/import.svg";

export default function ImportTokenModal() {
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
        <button className="px-3 py-2 border rounded-md border-neutral-200 dark:border-neutral-800 mr-6 flex space-x-2">
          <ImportLogo className="w-4 h-4 mt-[0.20rem]" />
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
                  <div className="text-xl font-bold text-neutral-500">
                    Import a token
                  </div>
                  <XCircleIcon
                    onClick={() => close()}
                    className="h-6 cursor-pointer text-black dark:text-white opacity-50"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="importToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          className="mx-auto m-8"
                          //   ref={searchRef}
                          placeholder="Search by address"
                          // onChange={handleSearchAll}
                        ></Input>
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>
                <div className="flex flex-col items-start mb-4">
                  <span className="text-md font-semibold text-neutral-500">
                    Searched tokens
                  </span>
                  <span className="text-xs text-neutral-500">
                    No result found
                  </span>
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
