import { Button } from "@/components/elements/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import { Input } from "@/components/elements/Input";
import InputGroup from "@/components/elements/InputGroup";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

export default function UnboostForm() {
  const [openBoost, setOpenBoost] = useState<boolean>(false);
  const [openApr, setOpenApr] = useState<boolean>(false);

  const form = useForm();
  const allocateXneutro = useWatch({
    control: form.control,
    name: "allocateXneutro",
  });
  const debouncedAllocateXneutro = useDebounceValue(allocateXneutro, 500);
  return (
    <Form {...form}>
      {/* <form onSubmit={form.handleSubmit(onSubmit)}> */}

      <div className="box-border relative">
        <div className="flex justify-between items-center mb-2 font-medium bg-neutral-800 rounded-sm mt-2 px-2 py-1">
          <div className="text-black dark:text-white">Amount</div>
          <div className="text-amber-500 text-xs cursor-pointer hover:underline">
            Get max bonus
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
          <Collapsible.Root
            className="w-full"
            open={openBoost}
            onOpenChange={setOpenBoost}
          >
            <Collapsible.Trigger asChild>
              <div className="w-full flex justify-between hover:cursor-pointer hover:bg-neutral-900 mt-2 rounded-sm ">
                <div className="flex">
                  <div className="underline">Boost Multiplier</div>
                  <ChevronDownIcon className="h-5 ml-1" />
                </div>
                <div className="text-neutral-500">
                  x1.04 -&gt;{" "}
                  <span className="text-black dark:text-white">x1.08</span>
                </div>
              </div>
            </Collapsible.Trigger>

            <Collapsible.Content className="py-2 flex flex-col gap-2 p-2">
              <div className="w-full flex justify-between">
                <div>Boost Allocation</div>
                <div className="text-neutral-500">
                  0.000004 -&gt;{" "}
                  <span className="text-black dark:text-white">
                    0.00001 xNEUTRO
                  </span>
                </div>
              </div>
              <div className="w-full flex justify-between">
                <div>Position Pool Share</div>
                <div className="text-black dark:text-white">0.00001%</div>
              </div>
              <div className="w-full flex justify-between">
                <div>Pool Boost Share</div>
                <div className="text-black dark:text-white">0.00002%</div>
              </div>
            </Collapsible.Content>
          </Collapsible.Root>

          <Collapsible.Root
            className="w-full"
            open={openApr}
            onOpenChange={setOpenApr}
          >
            <Collapsible.Trigger asChild>
              <div className="w-full flex justify-between hover:cursor-pointer hover:bg-neutral-900 rounded-sm ">
                <div className="flex">
                  <div className="underline">APR</div>
                  <ChevronDownIcon className="h-5 ml-1" />
                </div>
                <div className="text-neutral-500">
                  16.35% -&gt; <span className="text-amber-500">16.58%</span>
                </div>
              </div>
            </Collapsible.Trigger>

            <Collapsible.Content className="py-2 flex flex-col gap-2 p-2">
              <div className="w-full flex justify-between">
                <div>Farm Base APR</div>
                <div className="text-black dark:text-white">6.03%</div>
              </div>
              <div className="w-full flex justify-between">
                <div>Bonus APR</div>
                <div className="text-neutral-500">
                  0.23% -&gt; <span className="text-amber-500">0.46%</span>
                </div>
              </div>
              <div className="w-full flex justify-between">
                <div>Earned Fees APR</div>
                <div className="text-black dark:text-white">10.09%</div>
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
            variant="default"
            // disabled={!addLiquidity}
            // loading={isLoadingAddLiquidity}
            className="!text-black dark:text-white"
          >
            Unboost
          </Button>
          {/* )} */}
        </div>
      </div>
      {/* </form> */}
    </Form>
  );
}
