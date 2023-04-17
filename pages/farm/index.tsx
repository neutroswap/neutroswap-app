// import { Inter } from 'next/font/google'
import { Button, Input, Page, Text } from "@geist-ui/core";
import WalletIcon from "@/public/icons/wallet.svg";
import { Disclosure, RadioGroup } from "@headlessui/react";
import {
  ChevronUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Fragment, useState } from "react";
import { BigNumber } from "ethers";
import { classNames } from "@/shared/helpers/classNamer";
import NumberInput from "@/components/elements/NumberInput";

// const inter = Inter({ subsets: ['latin'] })

const TABS = ["All Farms", "My Farms"];

export default function Farm() {
  const [positions, setPositions] = useState([
    {
      network_id: "36d45ac3-284b-4ad8-8262-b4980294e8e6",
      address: "0xd0646b3FDeFb047d6C2bB7cc5475C7493BB83Ddc",
      decimal: 18,
      name: "DONI-WETH",
      symbol: ["vLPN", "USDT", "WETH"],
      logo: [null, null, "/logo/eth.svg"],
      balance: BigNumber.from(0x038d7ea4c67c18),
    },
    {
      network_id: "36d45ac3-284b-4ad8-8262-b4980294e8e6",
      address: "0xd0646b3FDeFb047d6C2bB7cc5475C7493BB83Ddc",
      decimal: 18,
      name: "vLPN-USDT-WETH",
      symbol: ["vLPN", "USDT", "WETH"],
      logo: [null, null, "/logo/eth.svg"],
      balance: BigNumber.from(0x038d7ea4c67c18),
    },
  ]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[80%] py-10">
      <div>
        <Text h2 height={3} className="text-center">
          Yield Farming
        </Text>
        <Text type="secondary" p className="text-center !mt-0">
          Earn yield by staking your LP Tokens
        </Text>
      </div>

      <div className="flex justify-between items-center min-w-[80%] mt-5 mb-10">
        <div className="flex flex-col px-10 py-7 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg shadow">
          <div className="mb-2 text-lg font-medium">Total Value Locked</div>
          <div className="text-center text-amber-600">$100,000,000</div>
        </div>
        <div className="flex flex-col px-10 py-7 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg shadow">
          <div className="mb-2 text-lg font-medium">Your Staked Assets</div>
          <div className="text-center text-amber-600">$100,000,000</div>
        </div>
        <div className="flex flex-col px-10 py-7 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg shadow">
          <div className="mb-2 text-lg font-medium">Unclaimed Rewards</div>
          <div className="text-center text-amber-600">$100,000,000</div>
        </div>
        <Button
          className={classNames(
            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm !text-base",
            "text-white dark:text-amber-600",
            "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]"
          )}
        >
          Harvest All
        </Button>
      </div>

      <div className="flex min-w-[80%] justify-between mb-10">
        <RadioGroup>
          <div className="flex w-full relative space-x-3">
            <>
              {TABS.map((tab, i) => (
                <RadioGroup.Option as={Fragment} key={i} value={tab}>
                  {({ checked }) => (
                    <div
                      className={classNames(
                        checked
                          ? "text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 shadow"
                          : "text-black dark:text-neutral-400 hover:bg-neutral-100 hover:dark:bg-white/[0.04]",
                        "z-[1] relative rounded-lg text-md h-8 px-3 py-1 text-center font-medium flex flex-grow items-center justify-center cursor-pointer"
                      )}
                    >
                      {tab}
                    </div>
                  )}
                </RadioGroup.Option>
              ))}
            </>
          </div>
        </RadioGroup>
        <div className="flex items-center w-1/3 bg-white dark:bg-neutral-800 shadow rounded-lg px-2">
          <input
            type="text"
            placeholder="Search by farm, name, symbol or address"
            className="bg-transparent p-2 rounded-md w-full placeholder-black dark:placeholder-neutral-600"
          />
          <MagnifyingGlassIcon className="flex inset-0 h-6 text-neutral-400" />
        </div>
      </div>

      <div className=" flex mb-3 min-w-[80%] justify-between  text-xl text-black dark:text-neutral-600">
        <div>Farm</div>
        <div>APR</div>
        <div>Liquidity</div>
        <div>Earnings</div>
      </div>
      {positions.map((position) => (
        <Disclosure key={position.address}>
          {({ open }) => (
            <div className="mb-4 min-w-[80%]">
              <Disclosure.Button
                className={classNames(
                  "flex justify-between items-center py-2 w-full bg-neutral-200 dark:bg-neutral-900 rounded-lg",
                  open && "rounded-b-none"
                )}
              >
                <div className="flex justify-between w-full ml-4">
                  <div>EOS-NEUTRO</div>
                  <div>1,000%</div>
                  <div>$1,000,000</div>
                  <div>
                    <div>0 NEUTRO</div>
                    <div>0</div>
                  </div>
                  {/* <div className="flex -space-x-1 relative z-0 overflow-hidden">
                    {position.logo.map((logo, index) => (
                      <>
                        {!logo && (
                          <div className="relative z-30 inline-flex justify-center items-center h-6 w-6 rounded-full ring-2 ring-neutral-200 dark:ring-neutral-900 bg-neutral-500">
                            <p className="p-0 m-0 text-xs text-white font-medium uppercase">
                              {position.name.split("-")[index].slice(0, 2)}
                            </p>
                          </div>
                        )}
                        {!!logo && (
                          <img
                            key={logo}
                            className="relative z-30 inline-block h-6 w-6 rounded-full ring-2 ring-neutral-200 dark:ring-neutral-900"
                            src={logo}
                            alt=""
                          />
                        )}
                      </>
                    ))}
                  </div>
                  <span className="text-left font-semibold text-lg">
                    {position.name}
                  </span> */}
                </div>
                <ChevronUpIcon
                  className={`${
                    open ? "rotate-180 transform" : ""
                  } h-5 w-5 text-orange-400 mr-4`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="p-4 pt-6  rounded-md rounded-t-none border border-neutral-200 dark:border-neutral-900">
                {/* Change here for content */}
                <div className="flex w-full space-x-5">
                  <div className="flex flex-col justify-between w-full space-y-3">
                    <div className="flex justify-between">
                      <div>Available:</div>
                      <div>0 LP ($0)</div>
                    </div>
                    <div className="flex bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
                      <NumberInput
                        placeholder="0.0"
                        className="bg-transparent !px-3 !py-2 !rounded-lg"
                      ></NumberInput>
                    </div>
                    <Button
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-amber-600",
                        "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                      )}
                    >
                      Stake LP Tokens
                    </Button>
                  </div>

                  <div className="flex flex-col justify-between w-full ">
                    <div className="flex justify-between">
                      <div>Deposited:</div>
                      <div>0 LP ($0)</div>
                    </div>
                    <div className="flex bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
                      <NumberInput
                        placeholder="0.0"
                        className="bg-transparent !px-3 !py-2 !rounded-lg"
                      ></NumberInput>
                    </div>
                    <Button
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-amber-600",
                        "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                      )}
                    >
                      Unstake LP Tokens
                    </Button>
                  </div>

                  <div className="flex flex-col justify-between w-full">
                    <div>Earned rewards:</div>
                    <div className="flex justify-center">1,000 $NEUTRO</div>
                    <Button
                      className={classNames(
                        "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                        "text-white dark:text-amber-600",
                        "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                        "!border !border-orange-600/50 dark:border-orange-400/[.12]"
                      )}
                    >
                      Harvest
                    </Button>
                  </div>
                </div>
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
