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
import React, { FC, useState } from "react";
import { Text } from "@geist-ui/core";
import tokenList from "../../../pages/swap/tokenList.json";
import { RadioGroup } from "@headlessui/react";

const tokens = [
  {
    ticker: "USDT",
    img: "https://cdn.moralis.io/eth/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
    name: "Tether USD",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
  },
  {
    ticker: "WETH",
    img: "https://cdn.moralis.io/eth/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    name: "Wrapped Ethereum",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    decimals: 18,
  },
  {
    ticker: "WBTC",
    img: "https://cdn.moralis.io/eth/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
    name: "Wrapped Bitcoin",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
  },
];

export const TokenPicker: FC = () => {
  const [selected, setSelected] = useState(tokens[0]);
  return (
    <div className="left-0 right-0 mt-[-9px] mb-[-9px] flex items-center justify-center">
      <Modal>
        <ModalOpenButton>
          <button
            // onClick={<Modal />}
            type="button"
            className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer"
          >
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
                <div className="w-full py-2">
                  <div className="w-full ">
                    <RadioGroup value={selected} onChange={setSelected}>
                      <RadioGroup.Label className="sr-only">
                        Server size
                      </RadioGroup.Label>
                      <div className="space-y-2">
                        {tokens.map((token) => (
                          <RadioGroup.Option
                            key={token.name}
                            value={token}
                            className={({ active, checked }) =>
                              `${
                                active
                                  ? "ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-300"
                                  : ""
                              }
                              ${
                                checked
                                  ? "bg-sky-900 bg-opacity-75 text-white"
                                  : "bg-white"
                              }
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                            }
                          >
                            {({ active, checked }) => (
                              <>
                                <div className="flex w-full items-center justify-between">
                                  <div className="flex items-center w-full">
                                    <img src={token.img} className="h-8 mr-3" />
                                    <div className="flex flex-col">
                                      <RadioGroup.Label
                                        as="p"
                                        className={`font-medium m-0 ${
                                          checked
                                            ? "text-white"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {token.ticker}
                                      </RadioGroup.Label>
                                      <RadioGroup.Description
                                        as="span"
                                        className={`inline ${
                                          checked
                                            ? "text-sky-100"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        <span>{token.name}</span>{" "}
                                      </RadioGroup.Description>
                                    </div>
                                  </div>
                                  {/* {checked && (
                                  <div className="shrink-0 text-white">
                                    <CheckIcon className="h-6 w-6" />
                                  </div>
                                )} */}
                                </div>
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalContents>
      </Modal>
    </div>
  );
};
