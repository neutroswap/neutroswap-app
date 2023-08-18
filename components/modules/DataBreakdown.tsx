import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import EthLogo from "@/public/logo/eth.svg";

export default function DataBreakdown() {
  const [openValue, setOpenValue] = useState<boolean>(false);
  const [openApr, setOpenApr] = useState<boolean>(false);
  const [openPendingRewards, setOpenPendingRewards] = useState<boolean>(false);

  return (
    <div className=" flex flex-col justify-center mb-6">
      <div className="w-full border-box bg-primary">
        <span className="text-neutral-500">Data breakdown</span>
      </div>

      <div className="flex w-full justify-between items-start">
        <Collapsible.Root
          className="w-full"
          open={openValue}
          onOpenChange={setOpenValue}
        >
          <Collapsible.Trigger asChild>
            <div className="flex justify-between items-start mt-3 w-full">
              <div className="flex items-center">
                <button className="text-xs flex gap-2 text-neutral-500">
                  Value
                  <ChevronDownIcon className="w-3 h-3 mt-1" />
                </button>
              </div>
              <span className="text-xs text-black dark:text-white">$0.01</span>
            </div>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <div>
              <div className="py-1 px-2 space-y-1 mt-3">
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs">USDT</span>
                    <div className="flex items-end gap-2">
                      <span className="text-xs">0.00001</span>
                      <EthLogo className="w-5 h-5 mb-0.5" />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs">ETH</span>
                    <div className="flex items-end gap-2">
                      <span className="text-xs">0.00001</span>
                      <EthLogo className="w-5 h-5 mb-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>

      <div className="flex w-full justify-between items-start">
        <Collapsible.Root
          className="w-full"
          open={openApr}
          onOpenChange={setOpenApr}
        >
          <Collapsible.Trigger asChild>
            <div className="flex justify-between items-start mt-3 w-full">
              <div className="flex items-center">
                <button className="text-xs flex gap-2 text-neutral-500">
                  APR
                  <ChevronDownIcon className="w-3 h-3 mt-1" />
                </button>
              </div>
              <span className="text-xs text-black dark:text-white">0.01%</span>
            </div>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <div>
              <div className="py-1 px-2 space-y-1 mt-3">
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs">Swap fees APR</span>
                    <div className="flex items-end gap-2">
                      <span className="text-xs">0.00001%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs">Farm base APR</span>
                    <div className="flex items-end gap-2">
                      <span className="text-xs">0.00001%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs">Farm bonus APR</span>
                    <div className="flex items-end gap-2">
                      <span className="text-xs">0.00001%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>

      <div className="flex w-full justify-between items-start">
        <Collapsible.Root
          className="w-full"
          open={openPendingRewards}
          onOpenChange={setOpenPendingRewards}
        >
          <Collapsible.Trigger asChild>
            <div className="flex justify-between items-start mt-3 w-full">
              <div className="flex items-center">
                <button className="text-xs flex gap-2 text-neutral-500">
                  Pending Rewards
                  <ChevronDownIcon className="w-3 h-3 mt-1" />
                </button>
              </div>
              <span className="text-xs text-black dark:text-white">$0.01</span>
            </div>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <div>
              <div className="py-1 px-2 space-y-1 mt-3">
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs">Farm rewards</span>
                    <div className="flex items-end gap-2">
                      <span className="text-xs">0.00001</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </div>
  );
}
