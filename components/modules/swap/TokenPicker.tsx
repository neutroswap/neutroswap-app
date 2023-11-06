import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import React, {
  ChangeEvent,
  FC,
  SyntheticEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { classNames } from "@/shared/helpers/classNamer";
import { RadioGroup } from "@headlessui/react";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { tokens } from "@/shared/statics/tokenList";
import { Token } from "@/shared/types/tokens.types";
import JsonSearch from "search-array";
import { debounce } from "lodash";
import { readContracts } from "wagmi";
import { ERC20_ABI } from "@/shared/abi";
import { formatEther, getAddress } from "viem";
import { Code, Spinner, useTheme } from "@geist-ui/core";
import { ThemeType } from "@/shared/hooks/usePrefers";
import NoContentDark from "@/public/states/empty/dark.svg";
import NoContentLight from "@/public/states/empty/light.svg";
import {
  DEFAULT_CHAIN_ID,
  supportedChainID,
  SupportedChainID,
} from "@/shared/types/chain.types";
import { useNetwork } from "wagmi";

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

  const theme = useTheme();
  const searchRef = useRef<any>(null);
  const { chain } = useNetwork();

  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // TODO: MOVE THIS HOOKS
  const chainSpecificTokens = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID];
    if (!supportedChainID.includes(chain.id.toString() as any))
      return tokens[DEFAULT_CHAIN_ID];
    return tokens[chain.id.toString() as SupportedChainID];
  }, [chain]);

  const [tokenList, setTokenList] = useState<Token[]>(chainSpecificTokens);

  const handleChange = (value: Token) => {
    setSelectedToken(value);
  };

  const handleImageFallback = (
    ticker: string,
    event: SyntheticEvent<HTMLImageElement, Event>
  ) => {
    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${ticker}`;
  };

  const resetTokenList = () => {
    setQuery("");
    setTokenList(chainSpecificTokens);
    searchRef.current.value = "";
  };

  const handleSearch = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true);
    // if Boolean(e.target.value) false, setQuery('')
    if (!Boolean(e.target.value)) {
      setQuery("");
      resetTokenList();
      return setIsSearching(false);
    }
    setQuery(e.target.value);
    // tokenList lookup based on e.target.value
    const fullTextSearch = new JsonSearch(chainSpecificTokens);
    const results: Token[] = fullTextSearch.query(e.target.value);
    // if found results from tokenlist update tokens
    if (!!results.length) {
      setTokenList(results);
      return setIsSearching(false);
    }
    // if not, do a contract read

    // ex: 0x9fC25190baC66D7be4639268220d1Bd363ca2698
    try {
      if (!getAddress(e.target.value)) throw new Error("Not an address");
      const [name, symbol, decimals] = await readContracts({
        allowFailure: false,
        contracts: [
          {
            address: getAddress(e.target.value),
            abi: ERC20_ABI,
            functionName: "name",
          },
          {
            address: getAddress(e.target.value),
            abi: ERC20_ABI,
            functionName: "symbol",
          },
          {
            address: getAddress(e.target.value),
            abi: ERC20_ABI,
            functionName: "decimals",
          },
        ],
      });
      setTokenList([
        {
          name: name,
          address: getAddress(e.target.value),
          symbol: symbol,
          logo: `https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${symbol.toLowerCase()}.svg`,
          decimal: Number(decimals),
        },
      ]);
      setIsSearching(false);
    } catch (error) {
      console.error(error);
      setTokenList([]);
      setIsSearching(false);
    }
    // TODO: offer user to import token;
  }, 500);

  return (
    <Modal onClose={() => resetTokenList()}>
      <ModalOpenButton>{children({ selectedToken })}</ModalOpenButton>
      <ModalContents>
        {({ close }) => (
          <div className="flex box-border">
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
                <MagnifyingGlassIcon className="flex inset-0 h-6 text-neutral-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search by name, symbol or address"
                  className="bg-transparent p-2 rounded-md w-full text-black dark:text-white"
                  onChange={handleSearch}
                />
                {!!query && (
                  <button
                    onClick={() => resetTokenList()}
                    className="flex items-center inset-0 p-1 text-neutral-500 text-xs font-semibold uppercase hover:scale-105 transition"
                  >
                    clear
                  </button>
                )}
              </div>
              <div className="w-full py-2">
                <div className="w-full ">
                  <RadioGroup
                    value={selectedToken}
                    onChange={handleChange}
                    onClick={() => {
                      resetTokenList();
                      close();
                    }}
                  >
                    <RadioGroup.Label className="sr-only">
                      Token Name
                    </RadioGroup.Label>
                    {isSearching && (
                      <div className="flex justify-center items-center py-6 mt-2">
                        <Spinner />
                      </div>
                    )}
                    {!isSearching && (
                      <div className="space-y-2 mt-2">
                        {!tokenList.length && (
                          <div className="flex flex-col items-center w-full py-6">
                            {(theme.type as ThemeType) === "nlight" && (
                              <NoContentLight className="w-40 h-40 opacity-75" />
                            )}
                            {(theme.type as ThemeType) === "ndark" && (
                              <NoContentDark className="w-40 h-40" />
                            )}
                            <p className="text-neutral-500 text-center w-3/4">
                              We cannot find any tokens with query{" "}
                              <Code>{query}</Code>. You can try to use contract
                              address instead of token name.
                            </p>
                          </div>
                        )}
                        {!!tokenList.length &&
                          tokenList.map((token) => (
                            <RadioGroup.Option
                              key={token.name}
                              value={token}
                              disabled={token.address === disabledToken.address}
                              className={({ active, checked, disabled }) =>
                                classNames(
                                  "relative flex cursor-pointer rounded-lg px-5 py-2 focus:outline-none transition-colors duration-300",
                                  disabled && "opacity-50 cursor-not-allowed",
                                  !disabled &&
                                    "hover:bg-neutral-100 dark:hover:bg-neutral-900",
                                  checked &&
                                    "bg-neutral-100 dark:bg-neutral-900"
                                )
                              }
                            >
                              {({ active, checked }) => (
                                <>
                                  <div className="flex w-full items-center justify-between">
                                    <div className="flex space-x-4 items-center w-full">
                                      <img
                                        alt={`${token.name} Icon`}
                                        src={token.logo}
                                        className="h-8 rounded-full"
                                        onError={(e) => {
                                          handleImageFallback(token.symbol, e);
                                        }}
                                      />
                                      <div className="flex flex-col">
                                        <RadioGroup.Label
                                          as="p"
                                          className="font-medium m-0 text-black dark:text-white text-left"
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
                    )}
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
