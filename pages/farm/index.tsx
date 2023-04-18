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
import { Fragment, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { classNames } from "@/shared/helpers/classNamer";
import NumberInput from "@/components/elements/NumberInput";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { NEXT_PUBLIC_FARM_CONTRACT } from "@/shared/helpers/constants";
import { ERC20_ABI, NEUTRO_FARM_ABI } from "@/shared/abi";
import { formatEther } from "ethers/lib/utils.js";

// const inter = Inter({ subsets: ['latin'] })

const TABS = ["All Farms", "My Farms"];

type FarmResponse = {
  name: string;
  totalLiq: string;
  rps: string;
  apr: string;
  pid: 0;
  logo0: string;
  logo1: string;
  lpToken: `0x${string}`;
  staked: string;
  reward: string;
};

export default function Farm() {
  const { address } = useAccount();
  const [farms, setFarms] = useState<any>([]);
  const [userFarms, setUserFarms] = useState<any>([]);
  const [combinedData, setCombinedData] = useState<FarmResponse[]>([]);
  const [tvl, setTvl] = useState<string>("");
  const [totalStaked, setTotalStaked] = useState<string>("");

  useEffect(() => {
    async function loadListFarm() {
      const response = await fetch("/api/getListFarm", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const fetched = await response.json();
      const tvl = fetched.data.tvl;
      const data = fetched.data.farms.map((details: any) => ({
        name: details.name,
        totalLiq: details.details.totalLiquidity,
        rps: details.details.rps,
        apr: details.details.apr,
        pid: details.pid,
        logo0: details.token0Logo,
        logo1: details.token1Logo,
        lpToken: details.lpToken,
      }));
      setFarms(data);
      setTvl(tvl);
    }
    loadListFarm();
  }, []);

  useEffect(() => {
    async function loadUserFarm() {
      const response = await fetch(`/api/getUserFarm?userAddress=${address}`, {
        // const response = await fetch(
        //   `/api/getUserFarm?userAddress=0x222Da5f13D800Ff94947C20e8714E103822Ff716`,
        //   {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const fetched = await response.json();
      const totalStaked = fetched.data.holdings;
      const data = fetched.data.farms.map((details: any) => ({
        name: details.name,
        staked: details.details.totalStaked,
        reward: details.details.pendingTokens,
      }));
      setUserFarms(data);
      setTotalStaked(totalStaked);
      console.log("getUserFarm Data = ", data);
    }
    loadUserFarm();
  }, [address]);

  useEffect(() => {
    function combineData() {
      const combinedData = farms.map((farm: any) =>
        Object.assign(
          {},
          farm,
          userFarms.find((userFarm: any) => farm.name === userFarm.name)
        )
      );
      setCombinedData(combinedData);
      console.log("Combined Data =", combinedData);
    }
    combineData();
  }, [farms, userFarms]);

  // Problem fetching all the farms PID
  const { config: harvestMany } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    chainId: 15557,
    functionName: "harvestMany",
    args: [[BigNumber.from(0)]],
  });

  const { write: harvestAll } = useContractWrite(harvestMany);

  // Problem: Input amount & PID selection

  // Problem: Input amount & PID selection
  // const { config: withdraw } = usePrepareContractWrite({
  //   address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
  //   abi: NEUTRO_FARM_ABI,
  //   functionName: "withdraw",
  //   args: [pid, 0],
  // });

  // const { write: unstake } = useContractWrite(withdraw);

  // Problem: PID selection
  // const { config: rewards } = usePrepareContractWrite({
  //   address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
  //   abi: NEUTRO_FARM_ABI,
  //   chainId: 15557,
  //   functionName: "deposit",
  //   args: [pid, null],
  // });
  // console.log(rewards);
  // // const { write: claim } = useContractWrite(rewards);
  // const { write: claim } = useContractWrite({
  //   ...rewards,
  //   onError(error) {
  //     console.log("Error", error);
  //   },
  // });

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
          <div className="text-center text-amber-600">${tvl}</div>
        </div>
        <div className="flex flex-col px-10 py-7 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg shadow">
          <div className="mb-2 text-lg font-medium">Your Staked Assets</div>
          <div className="text-center text-amber-600">${totalStaked}</div>
        </div>
        <div className="flex flex-col px-10 py-7 bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg shadow">
          <div className="mb-2 text-lg font-medium">Unclaimed Rewards</div>
          <div className="text-center text-amber-600">$100,000,000</div>
        </div>
        <Button
          onClick={() => harvestAll?.()}
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

      {/* <div className="flex min-w-[80%] justify-between">
        <div>Farm</div>
        <div>TVL</div>
        <div>Rewards</div>
        <div>APR</div>
      </div> */}

      {combinedData.map((data) => (
        <Comp key={data.pid} data={data} />
      ))}
    </div>
  );
}

const Comp = ({ data }: { data: FarmResponse }) => {
  const { address } = useAccount();

  const [isLpTokenApproved, setIsLpTokenApproved] = useState(false);

  const { refetch: refetchAllowance } = useContractRead({
    address: data.lpToken,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address!, NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`],
    onSuccess(value) {
      setIsLpTokenApproved(+formatEther(value) > 0);
    },
  });

  const { config: approveLpTokenConfig } = usePrepareContractWrite({
    address: data.lpToken,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
      BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });
  const { isLoading: isApprovingLpToken, write: approveLpToken } =
    useContractWrite({
      ...approveLpTokenConfig,
      onSuccess(result) {
        result.wait().then((receipt) => console.log(receipt));
      },
    });

  const { config: stakeConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_FARM_CONTRACT as `0x${string}`,
    abi: NEUTRO_FARM_ABI,
    chainId: 15557,
    functionName: "deposit",
    args: [BigNumber.from(data.pid), BigNumber.from(1)],
    onError(error) {
      console.log("Error", error);
    },
  });
  console.log("StakeConfig =", stakeConfig);

  const { write: stake } = useContractWrite({
    ...stakeConfig,
    onError(error) {
      console.log("Error", error);
    },
  });
  return (
    <Disclosure key={data.name}>
      {({ open }) => (
        <div className="mb-4 min-w-[80%]">
          <Disclosure.Button
            className={classNames(
              "flex justify-between items-center py-2 w-full bg-neutral-200 dark:bg-neutral-900 rounded-lg",
              open && "rounded-b-none"
            )}
          >
            <div className="flex justify-between items-center w-full ml-4">
              <div className="flex space-x-1 items-center">
                <img src={data.logo0} alt="logo0" className="h-7" />
                <img src={data.logo1} alt="logo1" className="h-7" />
                <div>{data.name}</div>
              </div>
              <div>{data.totalLiq}</div>
              <div>{(Number(data.rps) * 86400).toFixed(3)} NEUTRO / day</div>
              <div>{data.apr}%</div>
              <ChevronUpIcon
                className={`${
                  open ? "rotate-180 transform" : ""
                } h-5 w-5 text-orange-400 mr-4`}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className="p-4 pt-6  rounded-md rounded-t-none border border-neutral-200 dark:border-neutral-900">
            <div className="flex w-full space-x-5">
              <div className="flex flex-col justify-between w-full space-y-3">
                <div className="flex justify-between">
                  <div>Available:</div>
                  <div>0.0 LP ($0)</div>
                </div>
                <div className="flex justify-between items-center bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
                  <NumberInput
                    placeholder="0.0"
                    className="bg-transparent !px-3 !py-2 !rounded-lg"
                  ></NumberInput>
                  <div className="mr-3 text-sm text-amber-600 cursor-pointer">
                    MAX
                  </div>
                </div>
                {!isLpTokenApproved && (
                  <Button
                    disabled={!approveLpToken}
                    onClick={() => approveLpToken?.()}
                    className={classNames(
                      "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                      "text-white dark:text-amber-600",
                      "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                      "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    Approve LP Tokens
                  </Button>
                )}
                {isLpTokenApproved && (
                  <Button
                    disabled={!stake}
                    onClick={() => stake?.()}
                    className={classNames(
                      "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
                      "text-white dark:text-amber-600",
                      "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
                      "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    Stake LP Tokens
                  </Button>
                )}
              </div>

              <div className="flex flex-col justify-between w-full ">
                <div className="flex justify-between">
                  <div>Deposited:</div>
                  <div>{data.staked} LP ($0)</div>
                </div>
                <div className="flex justify-between items-center bg-neutral-100/75 dark:bg-neutral-900/50 rounded-lg">
                  <NumberInput
                    placeholder="0.0"
                    className="bg-transparent !px-3 !py-2 !rounded-lg"
                  ></NumberInput>
                  <div className="mr-3 text-sm text-amber-600 cursor-pointer">
                    MAX
                  </div>
                </div>

                <Button
                  // onClick={() => {
                  //   setPid(data.pid);
                  //   unstake?.();
                  // }}
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
                <div className="flex justify-center">
                  {parseFloat(data.reward).toFixed(3)} $NEUTRO
                </div>
                <Button
                  // onClick={() => {
                  //   setPid(data.pid);
                  //   claim?.();
                  // }}
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
  );
};
