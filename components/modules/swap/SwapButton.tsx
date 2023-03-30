import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import React, { FC } from "react";

export const SwapButton: FC = () => {
  return (
    <div className="left-0 right-0 my-3 flex items-center justify-center">
      {/* <Modal>
        <ModalOpenButton> */}
      <button
        // onClick={<Modal />}
        type="button"
        className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer"
      >
        <span>Swap</span>
      </button>
      {/* </ModalOpenButton>
        <ModalContents> */}
      {/* {({ close }) => <WalletGroupForm handleClose={close} />} */}
      {/* {({ close }) => (
        <div>
          <button onClick={() => close}></button>
        </div>
      )} */}
      {/* </ModalContents>
      </Modal> */}
    </div>
  );
};
