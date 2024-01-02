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
import {
  NEXT_PUBLIC_DIVIDENDS_CONTRACT,
  NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT,
} from "@/shared/helpers/constants";
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
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import {
  DEFAULT_CHAIN_ID,
  supportedChainID,
  SupportedChainID,
} from "@/shared/types/chain.types";
import { tokens } from "@/shared/statics/tokenList";
import { Token } from "@/shared/types/tokens.types";
import { XNEUTRO_ABI } from "@/shared/abi";
import { XNEUTRO_CONTRACT } from "@/shared/helpers/contract";

export default function NewPositionModal() {
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

  const { data: balanceData } = useContractRead({
    enabled: Boolean(address),
    watch: true,
    address: XNEUTRO_CONTRACT,
    abi: XNEUTRO_ABI,
    functionName: "balanceOf",
    args: [address!],
  });

  const availableXneutro = useMemo(() => {
    if (!balanceData) return "0";
    return `${Number(formatEther(balanceData)).toFixed(2)}`;
  }, [balanceData]);

  const chainSpecificTokens = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID.id];
    if (!supportedChainID.includes(chain.id.toString() as any))
      return tokens[DEFAULT_CHAIN_ID.id];
    return tokens[chain.id as SupportedChainID];
  }, [chain]);

  const [token0, setToken0] = useState<Token>(chainSpecificTokens[0]);
  const [token1, setToken1] = useState<Token>(chainSpecificTokens[1]);

  return (
    <Modal>
      <ModalOpenButton>
        <button className="px-3 py-2 border rounded-md bg-amber-500 border-neutral-200 dark:border-neutral-800 mr-6 flex space-x-2">
          <CirclePlus className="w-4 h-4 mt-[0.15rem]" />
          <span className="text-black dark:text-white text-sm font-semibold">
            New position
          </span>
        </button>
      </ModalOpenButton>
      <ModalContents>
        {({ close }) => (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="box-border">
                <div className="flex items-center justify-between ">
                  <span className="text-xl font-bold text-black dark:text-white">
                    Create position
                  </span>
                  <XCircleIcon
                    onClick={() => close()}
                    className="h-6 cursor-pointer text-black dark:text-white opacity-50"
                  />
                </div>
                <div className="flex flex-col mt-2 mx-auto items-center justify-center p-6">
                  <TokenPicker
                    selectedToken={token0}
                    setSelectedToken={setToken0}
                    disabledToken={token1}
                  >
                    {({ selectedToken: selectedToken }) => (
                      <button className="flex flex-col items-center">
                        <div className="flex flex-row items-center space-x-4">
                          <div className="flex items-center">
                            <img
                              src={selectedToken.logo}
                              alt="Selected Token 0"
                              className="h-6 mr-2 mt-2"
                            />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-base text-neutral-500">
                              Token
                            </span>
                            <div className="flex flex-row space-x-1">
                              <span className="text-xs text-black dark:text-white">
                                {selectedToken.symbol}
                              </span>
                              <ChevronDownIcon className="w-4 h-4 text-neutral-500" />
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                  </TokenPicker>
                </div>
                <div className="flex flex-col">
                  <div className="mt-2 text-black dark:text-white font-semibold">
                    Amount
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
                </div>
                <div className="flex justify-end text-xs text-neutral-500 mt-2">
                  <div>
                    <span>wallet balance: {""}</span>
                    <span>{availableXneutro} xNEUTRO</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2 mx-auto items-center space-x-3 mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => close()}
                  >
                    Cancel
                  </Button>

                  {(() => {
                    //   if (!isApproved) {
                    return (
                      <Button
                        type="submit"
                        variant="outline"
                        //   disabled={!approve}
                        //   loading={isLoadingApprove}
                      >
                        Approve
                      </Button>
                    );
                    //   }
                    return (
                      <Button
                        type="submit"
                        variant="outline"
                        //   disabled={!allocate}
                        //   loading={isLoadingAllocate}
                      >
                        Allocate
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </form>
          </Form>
        )}
      </ModalContents>
    </Modal>
  );
}
