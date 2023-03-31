import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import React, { FC } from "react";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ethers } from "ethers";
import RouterABI from "../../../shared/helpers/abis/router.json";

export const SwapButton: FC = () => {
  const { address, isConnected } = useAccount();

  const { config } = usePrepareContractWrite({
    address: "0xC397DAD720B0b1d38Ee5e5Ab5689F88866b9f107",
    abi: RouterABI,
    functionName: "swapETHForExactTokens",
    args: [
      9974900500,
      [
        "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        "0x30Cf0E9f55Dc4Ce9C2c176D5baE85D25c0201569",
      ],
      "0x523b9D1Ae36c28d1e480c6a0494E306a250bEA26",
      1711818405,
    ],
    overrides: {
      value: ethers.utils.parseEther("0.00000001"),
    },
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  return (
    <div className="left-0 right-0 my-3 flex items-center justify-center">
      {/* <Modal>
        <ModalOpenButton> */}
      <button
        onClick={(e) => {
          e.preventDefault();
          write?.();
        }}
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
