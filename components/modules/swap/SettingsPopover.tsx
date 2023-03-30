import { Popover, Transition, RadioGroup } from "@headlessui/react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/20/solid";
import { Fragment, useState, useCallback, useEffect } from "react";
import { classNames } from "@/shared/helpers/classNames";

const TABS = ["0.1", "0.5", "1.0"];

export default function SettingsPopover() {
  return (
    <Popover className="relative">
      <>
        <Popover.Button>
          <AdjustmentsHorizontalIcon className="h-5 cursor-pointer " />
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute top-10 right-0 z-50 -mr-2.5 min-w-20 md:m-w-22 md:-mr-5 bg-[#2D3036] rounded-lg w-80 shadow-lg">
            <div className="p-4 space-y-4">
              <div className="text-base font-bold text-high-emphesis">
                Settings
              </div>
              <div className="bg-[#060606] py-4 px-3 rounded-lg space-y-3">
                <div className="text-neutral-400">Slippage</div>
                <RadioGroup>
                  <div className="items-center relative bg-black/[0.08] dark:bg-white/[0.04] ring-4 ring-black/[0.08] dark:ring-white/[0.04] rounded-lg overflow-hidden flex gap-1">
                    <>
                      {TABS.map((tab, i) => (
                        <RadioGroup.Option as={Fragment} key={i} value={tab}>
                          {({ checked }) => (
                            <button
                              className={classNames(
                                checked
                                  ? "text-gray-900 dark:text-white bg-white dark:bg-[#2D3036]"
                                  : "text-gray-500 dark:text-neutral-400 hover:bg-gray-100 hover:dark:bg-white/[0.04]",
                                "z-[1] relative rounded-lg text-sm h-8 font-medium flex flex-grow items-center justify-center"
                              )}
                            >
                              {tab}%
                            </button>
                          )}
                        </RadioGroup.Option>
                      ))}

                      <div className="h-[28px] w-0.5 bg-gray-900/5 dark:bg-slate-200/5" />
                      <input
                        placeholder="Custom"
                        className="focus:dark:bg-[#2D3036] dark:text-neutral-400 focus:dark:text-white relative rounded-lg text-sm h-8 font-medium bg-transparent text-center w-[100px]"
                      />
                    </>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </>
    </Popover>
  );
}
