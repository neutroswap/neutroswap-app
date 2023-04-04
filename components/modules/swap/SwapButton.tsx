import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import React, { FC, useEffect, useState } from "react";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
} from "wagmi";
import { ethers } from "ethers";
import { NEUTRO_ROUTER_ABI } from "@/shared/helpers/abi/index";
import { ROUTER_CONTRACT } from "@/shared/helpers/contract";
import { Fetcher, Pair, TokenAmount, Token, ChainId } from "@uniswap/sdk";

export const SwapButton: FC = () => {
  const { address, isConnected } = useAccount();
  // const { amountsOut, setAmountsOut } = useState();

  // useEffect(() => {
  //   const getAmountsOut = async () => {
  //     try {
  //       const amounts = await amountsOut?.toString();
  //       setAmountsOut(amounts!);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   getAmountsOut();
  // }, []);

  // const { dataAmountsOut } = useContractRead({
  //   address: "0xC397DAD720B0b1d38Ee5e5Ab5689F88866b9f107",
  //   abi: RouterABI,
  //   functionName: "getAmountsOut",
  //   args: [
  //     ethers.utils.parseEther("0.00000001"),
  //     [
  //       "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  //       "0x30Cf0E9f55Dc4Ce9C2c176D5baE85D25c0201569",
  //     ],
  //   ],
  // });
  // console.log(dataAmountsOut);

  const { config } = usePrepareContractWrite({
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: "swapExactETHForTokens",
    args: [
      9974701255,
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

  // const { configExactTokensForETH } = usePrepareContractWrite({
  //   address: ROUTER_CONTRACT,
  //   abi: NEUTRO_ROUTER_ABI,
  //   functionName: "swapExactTokensForETH",
  //   args: [
  //     9974900500,
  //     9950062996,
  //     [
  //       "0x30Cf0E9f55Dc4Ce9C2c176D5baE85D25c0201569",
  //       "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  //     ],
  //     "0x523b9D1Ae36c28d1e480c6a0494E306a250bEA26",
  //     1711818405,
  //   ],
  // });

  // const { configExactTokensForTokens } = usePrepareContractWrite({
  //   address: ROUTER_CONTRACT,
  //   abi: NEUTRO_ROUTER_ABI,
  //   functionName: "swapExactTokensForTokens",
  //   args: [
  //     9974900500,
  //     9950062996,
  //     [
  //       "0x30Cf0E9f55Dc4Ce9C2c176D5baE85D25c0201569",
  //       "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  //     ],
  //     "0x523b9D1Ae36c28d1e480c6a0494E306a250bEA26",
  //     1711818405,
  //   ],
  // });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div className="flex flex-col w-full">
      <div className="left-0 right-0 my-3 flex items-center justify-center w-full">
        {/* <Modal>
        <ModalOpenButton> */}
        <button
          onClick={(e) => {
            e.preventDefault();
            write?.();
          }}
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
