import { classNames } from "@/shared/helpers/classNamer";
import { Dialog, FocusTrap, Transition } from "@headlessui/react";
import { Dispatch, Fragment, ReactNode, SetStateAction, useState } from "react";

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
  onClose: (value: boolean) => void;
}

const OffloadedModal: React.FC<Props> = (props) => {
  const { isOpen, onClose } = props;
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-400/25 dark:bg-black/50 backdrop-blur-sm transition-opacity z-20" />
        </Transition.Child>

        <FocusTrap>
          <div className="fixed inset-0 z-20 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className={classNames(
                  "relative transform rounded-lg bg-white dark:bg-[#0C0C0C] px-4 pt-5 pb-4 text-left text-white transition-all",
                  "border border-neutral-300/80 dark:border-neutral-900",
                  "sm:my-8 min-w-[28rem] sm:max-w-xl sm:p-6"
                )}>
                  {props.children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </FocusTrap>
      </Dialog>
    </Transition.Root>
  )
}
export default OffloadedModal;
