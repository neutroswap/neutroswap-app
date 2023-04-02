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
import { type } from "os";
// import EOSLogo from "@/logo/eos-eos-logo.png";

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
  // {
  //   ticker: "EOS",
  //   img: "EOSLogo",
  //   name: "EOS",
  //   address: "",
  //   decimals: 18,
  // },
];

type TokenPickerProps = {
  ticker?: string;
  img?: string;
  setTicker?: React.Dispatch<React.SetStateAction<string>>;
  setImg?: React.Dispatch<React.SetStateAction<string>>;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  // setTicker?: React.Dispatch<React.SetStateAction<string>>;
  // setImg?: React.Dispatch<React.SetStateAction<string>>;
  // setName?: React.Dispatch<React.SetStateAction<string>>;
  // setAddress?: React.Dispatch<React.SetStateAction<string>>;
  // setDecimals?: React.Dispatch<React.SetStateAction<number>>;
};

export const TokenPicker: FC<TokenPickerProps> = (props) => {
  const [selected, setSelected] = useState(tokens[0]);
  const [ticker, setTicker] = useState("Select a Token");
  const [img, setImg] = useState("");
  // const [token, setToken] = useState("");
  const [tokenOne, setTokenOne] = useState(null);
  const [tokenTwo, setTokenTwo] = useState(null);
  const [changeToken, setChangeToken] = useState(1);

  const { setToken } = props;

  const handleChange = (value: any) => {
    setSelected(value);
    setTicker(value.ticker);
    setToken(value.address);
    setImg(value.img);
  };

  return (
    <div className="left-0 right-0 mt-[-9px] mb-[-9px] flex items-center justify-center">
      <Modal>
        <ModalOpenButton>
          <button
            // onClick={<Modal />}
            type="button"
            className="flex items-center space-x-2 z-10 group bg-white hover:bg-white hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-lg cursor-pointer"
          >
            <div className="flex items-center">
              <img src={img} alt="" className="h-6 mr-2" />
              <span className="text-md">{ticker}</span>
            </div>
            <div>
              <ChevronDownIcon strokeWidth={3} className="w-4 h-4" />
            </div>
          </button>
        </ModalOpenButton>
        <ModalContents>
          {/* {({ close }) => <WalletGroupForm handleClose={close} />} */}
          {({ close }) => (
            <div className="flex">
              <div className="flex flex-col w-screen">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold">Select a token</span>
                  <XMarkIcon
                    onClick={() => close()}
                    className="h-8 cursor-pointer"
                  />
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
                    <RadioGroup
                      value={selected}
                      onChange={handleChange}
                      onClick={close}
                    >
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
