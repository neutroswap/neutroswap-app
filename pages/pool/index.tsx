import { Button, Fieldset, Input, Link, Note, Radio, Text, Textarea, useTheme } from "@geist-ui/core";
import { useState } from "react";
import NoContentDark from "@/public/states/empty/dark.svg"
import NoContentLight from "@/public/states/empty/light.svg"
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, QuestionMarkCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { BigNumber, BigNumberish } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
import { classNames } from "@/shared/helpers/classNames";
import { ArrowRightIcon, PlusIcon, PlusSmallIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Modal, ModalContents, ModalOpenButton } from "@/components/elements/Modal";
import NumberInput from "@/components/elements/NumberInput";
import { SwapButton } from "@/components/modules/swap/SwapButton";
import { SwitchTokensButton } from "@/components/modules/swap/SwitchTokensButton";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import { NEUTRO_FACTORY_ABI } from "@/shared/abi";
import { useContractRead } from "wagmi";
import { FACTORY_CONTRACT } from "@/shared/helpers/contract";

type PositionsResponse = {
  network_id: string,
  address: `0x${string}`,
  decimal: number,
  name: string,
  symbol: Array<string>,
  logo: Array<string>,
  balance: BigNumberish
}

export default function Pool() {
  const theme = useTheme();
  const [positions, setPositions] = useState<Array<PositionsResponse>>([]);
  // const [positions, setPositions] = useState([
  //   {
  //     network_id: '36d45ac3-284b-4ad8-8262-b4980294e8e6',
  //     address: '0xd0646b3FDeFb047d6C2bB7cc5475C7493BB83Ddc',
  //     decimal: 18,
  //     name: 'DONI-WETH',
  //     symbol: ['vLPN', 'USDT', 'WETH'],
  //     logo: [null, null, '/logo/eth.svg'],
  //     balance: BigNumber.from(0x038d7ea4c67c18)

  //   },
  //   {
  //     network_id: '36d45ac3-284b-4ad8-8262-b4980294e8e6',
  //     address: '0xd0646b3FDeFb047d6C2bB7cc5475C7493BB83Ddc',
  //     decimal: 18,
  //     name: 'vLPN-USDT-WETH',
  //     symbol: ['vLPN', 'USDT', 'WETH'],
  //     logo: [null, null, '/logo/eth.svg'],
  //     balance: BigNumber.from(0x038d7ea4c67c18)
  //   }
  // ]);


  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto text-center">
        <Text h2 height={2.5}>Liquidity Pool</Text>
        <Text type="secondary" p>Add or Remove liquidity to Neutroswap pool</Text>
      </div>
      <div className="flex justify-center items-center">
        <div className="mt-8 flex items-center text-center rounded-lg border border-neutral-200 dark:border-neutral-800/50 shadow-dark-sm dark:shadow-dark-lg w-full max-w-lg">
          {!positions.length && (
            <div className="flex flex-col items-center p-8">
              {theme.type === "light" && <NoContentLight className="w-40 h-40 opacity-75" />}
              {theme.type === "dark" && <NoContentDark className="w-40 h-40 opacity-75" />}
              <p className="text-neutral-500 w-3/4">You do not have any liquidity positions. Add some liquidity to start earning.</p>

              <Modal>
                <ModalOpenButton>
                  <Button className="!mt-2">Add Liquidity</Button>
                </ModalOpenButton>
                <ModalContents>
                  {({ close }) => (
                    <AddLiquidityModal />
                  )}
                </ModalContents>
              </Modal>
            </div>
          )}

          {!!positions.length && (
            <div className="p-8 w-full">
              {positions.map((position) => (
                <Disclosure key={position.address}>
                  {({ open }) => (
                    <div className="mb-4">
                      <Disclosure.Button className={classNames(
                        "flex justify-between items-center py-2 w-full bg-neutral-200 dark:bg-neutral-900 rounded-lg",
                        open && "rounded-b-none"
                      )}>
                        <div className="flex space-x-2 ml-4">
                          <div className="flex -space-x-1 relative z-0 overflow-hidden">
                            {position.logo.map((logo, index) => (
                              <>
                                {!logo && (
                                  <div className="relative z-30 inline-flex justify-center items-center h-6 w-6 rounded-full ring-2 ring-neutral-200 dark:ring-neutral-900 bg-neutral-500">
                                    <p className="p-0 m-0 text-xs text-white font-medium uppercase">{position.name.split('-')[index].slice(0, 2)}</p>
                                  </div>
                                )}
                                {!!logo && <img
                                  key={logo}
                                  className="relative z-30 inline-block h-6 w-6 rounded-full ring-2 ring-neutral-200 dark:ring-neutral-900"
                                  src={logo}
                                  alt=""
                                />}
                              </>
                            ))}
                          </div>
                          <span className="text-left font-semibold text-lg">{position.name}</span>
                        </div>
                        <ChevronUpIcon
                          className={`${open ? 'rotate-180 transform' : ''
                            } h-5 w-5 text-orange-400 mr-4`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="p-4 pt-6  rounded-md rounded-t-none border border-neutral-200 dark:border-neutral-900">
                        <dl className="inline-block">
                          <dt className="float-left text-left w-1/2">Total Pooled Tokens</dt>
                          <dd className="float-right text-right w-1/2">{formatEther(position.balance)}</dd>

                          <dt className="float-left text-left w-1/2">Total Pooled Tokens</dt>
                          <dd className="float-right text-right w-1/2">{formatEther(position.balance)}</dd>
                        </dl>
                        <div className="flex w-full justify-between gap-4 mt-4">
                          <Button
                            type="error-light"
                            scale={0.75}
                            className="!w-full"
                            ghost
                            icon={<TrashIcon />}
                          >
                            Remove Liquidity
                          </Button>
                          <Button
                            type="success-light"
                            scale={0.75}
                            className="!w-full"
                            icon={<PlusIcon />}
                          >
                            Add Liquidity
                          </Button>
                        </div>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const AddLiquidityModal: React.FC = () => {
  const [tokenOneAmount, setTokenOneAmount] = useState("");
  const [tokenTwoAmount, setTokenTwoAmount] = useState("");
  const [tokenOne, setTokenOne] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000");
  const [tokenTwo, setTokenTwo] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000");

  const { data: existingPool, isError, isLoading: isFetchingGetPair } = useContractRead({
    address: FACTORY_CONTRACT,
    abi: NEUTRO_FACTORY_ABI,
    functionName: 'getPair',
    args: [tokenOne, tokenTwo]
  })

  return (
    <div>
      <div className="flex items-center justify-between text-black dark:text-white mb-8">
        <div>
          <p className="text-xl font-bold m-0 mb-1">Add Liquidity</p>
          <p className="text-sm m-0">
            Configure and add liquidty
          </p>
        </div>
        <button type="button" onClick={() => close()}>
          <XCircleIcon className="h-6 w-6 text-cool-gray-500 hover:text-cool-gray-400" />
        </button>
      </div>

      <TokenPicker setToken={setTokenOne}>
        {({ selectedToken }) => (
          <div className={classNames(
            "py-1 px-4 rounded-lg rounded-b-none cursor-pointer transition-colors",
            "bg-neutral-50 dark:bg-neutral-900",
            "hover:bg-neutral-100 hover:dark:bg-neutral-800/60"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">0</p>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={`https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${selectedToken.ticker.toLowerCase()}.svg`}
                  className="h-7 mr-2"
                />
                <span className="text-sm text-black dark:text-white">{selectedToken.ticker}</span>
              </div>
              <ChevronRightIcon className="ml-4 w-4 h-4" />
            </div>
          </div>
        )}
      </TokenPicker>
      <TokenPicker setToken={setTokenTwo}>
        {({ selectedToken }) => (
          <div className={classNames(
            "py-1 px-4 rounded-lg rounded-t-none cursor-pointer transition-colors",
            "bg-neutral-50 dark:bg-neutral-900",
            "hover:bg-neutral-100 hover:dark:bg-neutral-800/60"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">1</p>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={`https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/${selectedToken.ticker.toLowerCase()}.svg`}
                  className="h-7 mr-2"
                />
                <span className="text-sm text-black dark:text-white">{selectedToken.ticker}</span>
              </div>
              <ChevronRightIcon className="ml-4 w-4 h-4" />
            </div>
          </div>
        )}
      </TokenPicker>
      {(!existingPool || existingPool !== '0x0000000000000000000000000000000000000000') && (
        <Button
          scale={1.25}
          className={classNames(
            "!w-full !mt-4 !bg-transparent !rounded-lg",
            "!border-neutral-300 dark:!border-neutral-700",
            "hover:!border-neutral-400 dark:hover:!border-neutral-600",
            "focus:!border-neutral-400 dark:focus:!border-neutral-600",
            "focus:hover:!border-neutral-400 dark:focus:hover:!border-neutral-600",
            "disabled:opacity-50 disabled:hover:!border-neutral-300 disabled:dark:hover:!border-neutral-700"
          )}
          disabled={isError}
          loading={isFetchingGetPair}
        >
          <span>Enter pool</span>
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Button>
      )}
      {existingPool === '0x0000000000000000000000000000000000000000' && (
        <div>
          <Button
            scale={1.25}
            className={classNames(
              "!w-full !mt-4 !bg-transparent !rounded-lg",
              "!border-neutral-300 dark:!border-neutral-700",
              "hover:!border-neutral-400 dark:hover:!border-neutral-600",
              "focus:!border-neutral-400 dark:focus:!border-neutral-600",
              "focus:hover:!border-neutral-400 dark:focus:hover:!border-neutral-600",
              "disabled:opacity-50 disabled:hover:!border-neutral-300 disabled:dark:hover:!border-neutral-700"
            )}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>Start adding liquidity</span>
          </Button>
          <p className="text-sm text-neutral-500 text-center">No pool found! But, you can create it now and start providing liquidity.</p>
        </div>
      )}
    </div>
  )
}
