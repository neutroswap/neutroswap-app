import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import React, { FC, SyntheticEvent, useState } from "react";
import { classNames } from "@/shared/helpers/classNames";
import { RadioGroup } from "@headlessui/react";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { tokens } from "@/shared/statics/tokenList";
import { Token } from "@/shared/types/tokens.types";

type TokenPickerProps = {
  ticker?: string;
  img?: string;
  setTicker?: React.Dispatch<React.SetStateAction<string>>;
  setImg?: React.Dispatch<React.SetStateAction<string>>;
  selectedToken: Token;
  setSelectedToken: React.Dispatch<React.SetStateAction<Token>>;
  disabledToken: Token;
  children: ({ selectedToken }: { selectedToken: Token }) => React.ReactElement;
};

export const TokenPicker: FC<TokenPickerProps> = (props) => {
  const { selectedToken, setSelectedToken, children, disabledToken } = props;

  const handleChange = (value: Token) => {
    setSelectedToken(value);
  };

  const handleImageFallback = (
    ticker: string,
    event: SyntheticEvent<HTMLImageElement, Event>
  ) => {
    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${ticker}`;
  };

  return (
    <Modal>
      <ModalOpenButton>
        {children({ selectedToken })}
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
                          disabled={token.address === disabledToken.address}
                          className={({ active, checked, disabled }) =>
                            classNames(
                              "relative flex cursor-pointer rounded-lg px-5 py-2 focus:outline-none transition-colors duration-300",
                              disabled && "opacity-50 cursor-not-allowed",
                              !disabled && "hover:bg-neutral-100 dark:hover:bg-neutral-900",
                              checked && "bg-neutral-100 dark:bg-neutral-900",
                            )
                          }
                        >
                          {({ active, checked }) => (
                            <>
                              <div className="flex w-full items-center justify-between">
                                <div className="flex space-x-4 items-center w-full">
                                  <img
                                    alt={`${token.name} Icon`}
                                    src={`https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${token.symbol.toLowerCase()}.svg`}
                                    className="h-8 rounded-full"
                                    onError={(e) => {
                                      handleImageFallback(token.symbol, e);
                                    }}
                                  />
                                  <div className="flex flex-col">
                                    <RadioGroup.Label
                                      as="p"
                                      className="font-medium m-0 text-black dark:text-white"
                                    >
                                      {token.symbol}
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
