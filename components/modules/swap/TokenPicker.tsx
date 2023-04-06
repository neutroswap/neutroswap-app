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
import React, { FC, SyntheticEvent, useState } from "react";
import { classNames } from "@/shared/helpers/classNames";
import { RadioGroup } from "@headlessui/react";
import { XCircleIcon } from "@heroicons/react/24/solid";

const tokens = [
  {
    ticker: "WEOS",
    img: "/logo/EOS.png",
    name: "Wrapped EOS",
    address: "0x6ccc5ad199bf1c64b50f6e7dd530d71402402eb6",
    decimals: 18,
  },
  {
    ticker: "USDC",
    img: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024",
    name: "USD Circle",
    address: "0x4ceaC0A4104D29f9d5f97F34B1060A98A5eAf21d",
    decimals: 6,
  },
  {
    ticker: "WETH",
    img: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/weth.svg",
    name: "Wrapped Ethereum",
    address: "0x3d7b65FB8f005a3Dd257C33A93340216dbe6F180",
    decimals: 18,
  },
  {
    ticker: "NEUTRO",
    img: "https://cdn.moralis.io/eth/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    name: "Neutroswap Token",
    address: "0x4D0BfAF503fE1e229b1B4F8E4FC1952803ec843f",
    decimals: 18,
  },
];

type TokenDetails = {
  ticker: string;
  img: string;
  name: string;
  address: string;
  decimals: number;
};

type TokenPickerProps = {
  ticker?: string;
  img?: string;
  setTicker?: React.Dispatch<React.SetStateAction<string>>;
  setImg?: React.Dispatch<React.SetStateAction<string>>;
  setToken: React.Dispatch<React.SetStateAction<`0x${string}`>>;
  children: ({
    selectedToken,
  }: {
    selectedToken: TokenDetails;
  }) => React.ReactElement;
};

export const TokenPicker: FC<TokenPickerProps> = (props) => {
  const { setToken, children } = props;
  const [selectedToken, setSelectedToken] = useState(tokens[0]);

  const handleChange = (value: any) => {
    setSelectedToken(value);
    setToken(value.address);
  };

  const handleImageFallback = (ticker: string, event: SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${ticker}`;
  }

  return (
    <Modal>
      <ModalOpenButton>
        {children({ selectedToken: selectedToken })}
      </ModalOpenButton>
      <ModalContents>
        {({ close }) => (
          <div className="flex">
            <div className="flex flex-col w-screen">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-black dark:text-white">
                  Select a token
                </span>
                <XCircleIcon
                  onClick={() => close()}
                  className="h-6 cursor-pointer text-black dark:text-white opacity-50"
                />
              </div>
              <div className="flex items-center px-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg z-0">
                <MagnifyingGlassIcon className="flex inset-0 h-6  text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by name, symbol or address"
                  className="bg-transparent p-2 rounded-md w-full"
                />
              </div>
              <div className="w-full py-2">
                <div className="w-full ">
                  <RadioGroup
                    value={selectedToken}
                    onChange={handleChange}
                    onClick={close}
                  >
                    <RadioGroup.Label className="sr-only">
                      Token Name
                    </RadioGroup.Label>
                    <div className="space-y-2 mt-2">
                      {tokens.map((token) => (
                        <RadioGroup.Option
                          key={token.name}
                          value={token}
                          className={({ active, checked }) =>
                            classNames(
                              "relative flex cursor-pointer rounded-lg px-5 py-2 focus:outline-none transition-colors duration-300",
                              "hover:bg-neutral-100 dark:hover:bg-neutral-900",
                              checked && "bg-neutral-100 dark:bg-neutral-900"
                            )
                          }
                        >
                          {({ active, checked }) => (
                            <>
                              <div className="flex w-full items-center justify-between">
                                <div className="flex space-x-4 items-center w-full">
                                  <img
                                    alt={`${token.name} Icon`}
                                    src={`https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${token.ticker.toLowerCase()}.svg`}
                                    className="h-8 rounded-full" onError={(e) => { handleImageFallback(token.ticker, e) }}
                                  />
                                  <div className="flex flex-col">
                                    <RadioGroup.Label
                                      as="p"
                                      className="font-medium m-0 text-black dark:text-white"
                                    >
                                      {token.ticker}
                                    </RadioGroup.Label>
                                    <RadioGroup.Description
                                      as="span"
                                      className="inline !m-0 text-gray-500"
                                    >
                                      {token.name}
                                    </RadioGroup.Description>
                                  </div>
                                </div>
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
  );
};
