import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import React, { FC } from "react";

export const SwapButton: FC = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="left-0 right-0 my-3 flex items-center justify-center w-full">
        {/* <Modal>
        <ModalOpenButton> */}
        <button
          type="button"
          className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer w-full justify-center"
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
      {/* <div>
        <div className="flex justify-between mb-2">
          <div>Price Impact</div>
          <div>+0.15%</div>
        </div>
        <div className="flex justify-between mb-2">
          <div>Est. received</div>
          <div>100 ETH</div>
        </div>
        <div className="flex justify-between mb-2">
          <div>Min. received</div>
          <div>100 ETH</div>
        </div>
        <div className="flex justify-between mb-2">
          <div>Network fee</div>
          <div>~$0.01</div>
        </div>
        <div className="flex justify-between mb-2">
          <div>Recipient</div>
          <div>{address}</div>
        </div>
      </div> */}
    </div>
  );
};
