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
import ImportLogo from "@/public/logo/import.svg";

export default function MergePositionModal() {
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
          <span className="text-black dark:text-white text-sm font-semibold">
            Merge Position
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
                  <span className="text-amber-500 text-xl font-semibold">
                    Merge
                  </span>
                  <span className="text-xl font-semibold text-black dark:text-white">
                    multiple positions
                  </span>
                </div>

                <div className="flex justify-center">
                  <div className="text-neutral-500">
                    Regroup spNFTs into a single one.
                  </div>
                </div>

                <div className="items-start flex justify-start mt-8">
                  <div className="w-full border-box bg-primary">
                    <span className="text-neutral-500 text-lg">
                      Select positions
                    </span>
                  </div>
                </div>

                <div className="items-start flex justify-between mt-5">
                  <div className="text-xs text-neutral-500">
                    *USDT-USDC.e only
                  </div>
                  <button>
                    <span className="text-xs text-amber-500">Select all</span>
                  </button>
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
                    Merge
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
