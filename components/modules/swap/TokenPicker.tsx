import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import React, { FC } from "react";
import { Text } from "@geist-ui/core";

export const TokenPicker: FC = () => {
  return (
    <div className="left-0 right-0 mt-[-9px] mb-[-9px] flex items-center justify-center">
      <Modal>
        <ModalOpenButton>
          <button
            // onClick={<Modal />}
            type="button"
            className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer"
          >
            {/* <img src="/logo/eth.svg" /> */}
            <span>ETH</span>
            <div>
              <ChevronDownIcon strokeWidth={3} className="w-4 h-4 " />
            </div>
          </button>
        </ModalOpenButton>
        <ModalContents>
          {/* {({ close }) => <WalletGroupForm handleClose={close} />} */}
          {({ close }) => (
            <div className="flex">
              <div onClick={() => close} className="flex flex-col w-screen">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold">Select a token</span>
                  <XMarkIcon className="h-8" />
                </div>
                <div className="flex  items-center px-2 bg-white rounded-lg z-0">
                  <MagnifyingGlassIcon className="flex inset-0 h-6  text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by name, symbol or address"
                    className="bg-white  p-2 rounded-md dark:text-neutral-600 w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </ModalContents>
      </Modal>
    </div>
  );
};
