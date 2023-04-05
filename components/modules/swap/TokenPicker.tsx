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
import { classNames } from "@/shared/helpers/classNames";
import { RadioGroup } from "@headlessui/react";
import { XCircleIcon } from "@heroicons/react/24/solid";

const tokens = [
  {
    ticker: "USDT",
    img: "https://cdn.moralis.io/eth/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
    name: "Tether USD",
    address: "0x56b2b8007594260B443B6e906b5374dFf107132d",
    decimals: 6,
  },
  {
    ticker: "DAI",
    img: "https://cdn.moralis.io/eth/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    name: "Dai Stablecoin",
    address: "0x35c83c149fB3C15138f4B4a1A541529D26f10F6a",
    decimals: 18,
  },
  {
    ticker: "WETH",
    img: "https://cdn.moralis.io/eth/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    name: "Wrapped Ethereum",
    address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    decimals: 18,
  },
  {
    ticker: "WBTC",
    img: "https://cdn.moralis.io/eth/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
    name: "Wrapped Bitcoin",
    address: "0x8d34DaA036AD8359987e51dD522e8406909a5C2b",
    decimals: 8,
  },
  {
    ticker: "DONI",
    img: "https://cdn.moralis.io/eth/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    name: "Doni Token",
    address: "0x30Cf0E9f55Dc4Ce9C2c176D5baE85D25c0201569",
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
                                  <img src={token.img} className="h-8" />
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
