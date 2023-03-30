import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import React, { FC } from "react";

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
              <button onClick={() => close} className="flex justify-end">
                <input
                  type="text"
                  placeholder="Contract Address"
                  className="bg-white text-black p-2 rounded-md"
                />
                <button className="border p-2 rounded-md">Submit</button>
              </button>
            </div>
          )}
        </ModalContents>
      </Modal>
    </div>
  );
};
