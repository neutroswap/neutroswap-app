// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import Logo from "@/public/logo.svg";
import { classNames } from "@/shared/helpers/classNamer";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import NumberInput from "@/components/elements/NumberInput";
import { BigNumber } from "ethers";
import { useState } from "react";

// const inter = Inter({ subsets: ['latin'] })

export default function Vault() {
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
    <div className="flex flex-col items-center justify-center min-w-[80%] py-10">
      <div>
        <Text h2 height={3} className="text-center">
          Neutro Vault
        </Text>
        <Text type="secondary" p className="text-center !mt-0">
          Earn more NEUTRO by locking your NEUTRO
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

      <div className="flex max-w-[80%] border space-x-5">
        <div className="p-10 bg-neutral-100/75 dark:bg-neutral-900/50">
          <div className="mb-3">
            <div className="text-lg font-medium">Neutro Vault</div>
            <div>
              The participants receive various benefits such as higher rewards
              according to lock duration, higher allocations in Neutro Launchpad
              and more.
            </div>
          </div>
          <div>
            <div className="text-lg font-medium">Considerations</div>
            <div>Everytime you stake, you lock time renews</div>
          </div>
        </div>

        <div>
          <div className="flex ">
            <div>Stake</div>
            <div>Lockup</div>
            <div>TVL</div>
            <div>Allocation</div>
            <div>Apr</div>
          </div>

          {/* {positions.map((position) => (
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
                      <div className="flex -space-x-1 relative z-0 overflow-hidden">
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
                      </span>
                    </div>
                    <ChevronUpIcon
                      className={`${
                        open ? "rotate-180 transform" : ""
                      } h-5 w-5 text-orange-400 mr-4`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="p-4 pt-6  rounded-md rounded-t-none border border-neutral-200 dark:border-neutral-900">
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
          ))} */}
        </div>
      </div>
    </div>
  );
}
