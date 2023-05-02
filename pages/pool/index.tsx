import { Text, Button, Loading, useTheme } from "@geist-ui/core";
import { useEffect, useMemo, useState } from "react";
import NoContentDark from "@/public/states/empty/dark.svg";
import NoContentLight from "@/public/states/empty/light.svg";
import { Disclosure } from "@headlessui/react";
import {
  ChevronRightIcon,
  ChevronUpIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { BigNumberish, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
import { classNames } from "@/shared/helpers/classNamer";
import { ArrowRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import { NEUTRO_FACTORY_ABI } from "@/shared/abi";
import { useAccount, useContract, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { FACTORY_CONTRACT } from "@/shared/helpers/contract";
import { useRouter } from "next/router";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { Token } from "@/shared/types/tokens.types";
import { tokens } from "@/shared/statics/tokenList";
import { decimalFormat } from "@/shared/helpers/decimalFormat";
import Link from "next/link";
import { ThemeType } from "@/shared/hooks/usePrefers";
import { DEFAULT_CHAIN_ID, SupportedChainID, supportedChainID } from "@/shared/types/chain.types";

import PoolIcon from "@/public/icons/pool.svg"

type PositionsResponse = {
  network_id: string;
  address: `0x${string}`;
  decimal: number;
  name: string;
  symbol: Array<string>;
  logo: Array<string>;
  userBalance: BigNumberish;
  token0: Token;
  token1: Token;
  poolShare: string;
};

export default function Pool() {
  const theme = useTheme();
  const { address } = useAccount();

  const [positions, setPositions] = useState<Array<PositionsResponse>>([]);
  const [isFetchingPool, setIsFetchingPool] = useState(false);

  useEffect(() => {
    if (!address) return;
    (async () => {
      setIsFetchingPool(true);
      const req = await fetch(`/api/getUserLP?userAddress=${address}`)
      // const req = await fetch(`/api/getUserLP?userAddress=0x222da5f13d800ff94947c20e8714e103822ff716`);
      const response = await req.json();
      setPositions(response.data);
      setIsFetchingPool(false);
    })();
  }, [address]);

  return (
    <div className="py-16">
      <div>
        <div className="flex justify-center items-center space-x-3">
          <PoolIcon className="w-7 h-7 md:w-8 md:h-8 text-neutral-700 dark:text-neutral-300 mt-1" />
          <p className="m-0 text-center text-3xl md:text-4xl font-semibold">
            Liquidity Pool
          </p>
        </div>
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Add or Remove liquidity to Neutroswap pool
        </p>
      </div>
      <div className="flex justify-center items-center">
        <div className="mt-8 flex items-center text-center rounded-lg md:border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm md:dark:shadow-dark-lg w-full max-w-3xl">
          {!positions.length && !isFetchingPool && (
            <div className="flex flex-col items-center w-full md:p-8">
              {theme.type as ThemeType === "nlight" && (
                <NoContentLight className="w-40 h-40 opacity-75" />
              )}
              {theme.type as ThemeType === "ndark" && (
                <NoContentDark className="w-40 h-40 opacity-75" />
              )}
              <p className="text-neutral-500 w-3/4">
                You do not have any liquidity positions. Add some liquidity to
                start earning.
              </p>

              <Modal>
                <ModalOpenButton>
                  <Button className="!mt-2">Add Liquidity</Button>
                </ModalOpenButton>
                <ModalContents>
                  {({ close }) => <AddLiquidityModal handleClose={close} />}
                </ModalContents>
              </Modal>
            </div>
          )}

          {!positions.length && isFetchingPool && (
            <div className="flex py-40 w-full">
              <Loading scale={3} />
            </div>
          )}

          {!!positions.length && (
            <div className="md:p-8 w-full">
              {positions.map((position) => (
                <Link key={position.address} href={`/pool/${position.address}`}>
                  <div
                    className={classNames(
                      "mb-4 flex flex-col justify-center w-full rounded-lg group transition",
                      "bg-transparent dark:bg-neutral-900/75 hover:dark:bg-neutral-800/60",
                      "border border-neutral-200 dark:border-transparent",
                      "text-black dark:text-white"
                    )}
                  >
                    <div className="flex items-center justify-between py-3 px-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex -space-x-2 relative z-0">
                            <img
                              alt={`${position.token0.symbol} Icon`}
                              src={position.token0.logo}
                              className="h-6 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
                              onError={(e) => {
                                handleImageFallback(position.token0.symbol, e);
                              }}
                            />
                            <img
                              alt={`${position.token1.symbol} Icon`}
                              src={position.token1.logo}
                              className="h-6 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
                              onError={(e) => {
                                handleImageFallback(position.token1.symbol, e);
                              }}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-left font-medium text-lg">
                              {position.token0.symbol}
                            </span>
                            <span className="text-left font-medium text-lg opacity-25">
                              /
                            </span>
                            <span className="text-left font-medium text-lg">
                              {position.token1.symbol}
                            </span>
                          </div>
                        </div>
                        <div className="flex text-sm space-x-4">
                          <div className="flex space-x-2">
                            <span className="opacity-50">Pool share</span>
                            <span className="font-semibold">
                              {decimalFormat(
                                Number(formatEther(position.poolShare)) * 100,
                                2
                              )}
                              %
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <span className="opacity-50">Owned LP token</span>
                            <span className="font-semibold">
                              {decimalFormat(
                                Number(formatEther(position.userBalance)),
                                2
                              )}{" "}
                              {position.symbol}
                            </span>
                          </div>

                          {/* NOTE: Show token0 and token1 balance in each pool */}
                          {/* <div className="flex space-x-2"> */}
                          {/*   <span className="opacity-50">{position.token0.symbol}</span> */}
                          {/*   <span className="font-semibold">{0} {position.token0.symbol}</span> */}
                          {/* </div> */}
                          {/* <div className="flex space-x-2"> */}
                          {/*   <span className="opacity-50">{position.token1.symbol}</span> */}
                          {/*   <span className="font-semibold">{0} {position.token1.symbol}</span> */}
                          {/* </div> */}
                        </div>
                      </div>
                      <ChevronRightIcon className="w-6 h-6 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </Link>
              ))}

              <Modal>
                <ModalOpenButton>
                  <Button className="!mt-2">Add Liquidity</Button>
                </ModalOpenButton>
                <ModalContents>
                  {({ close }) => <AddLiquidityModal handleClose={close} />}
                </ModalContents>
              </Modal>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const AddLiquidityModal: React.FC<{ handleClose: () => void }> = ({
  handleClose,
}) => {
  const router = useRouter();
  const { chain } = useNetwork();

  // TODO: MOVE THIS HOOKS
  const chainSpecificTokens = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID];
    if (!supportedChainID.includes(chain.id.toString() as any)) return tokens[DEFAULT_CHAIN_ID];
    return tokens[chain.id.toString() as SupportedChainID]
  }, [chain]);

  const [token0, setToken0] = useState<Token>(chainSpecificTokens[0]);
  const [token1, setToken1] = useState<Token>(chainSpecificTokens[1]);

  const {
    data: existingPool,
    isError,
    isLoading: isFetchingGetPair,
  } = useContractRead({
    address: FACTORY_CONTRACT,
    abi: NEUTRO_FACTORY_ABI,
    functionName: "getPair",
    args: [token0.address, token1.address],
  });

  const { config: createPairConfig } = usePrepareContractWrite({
    address: FACTORY_CONTRACT,
    abi: NEUTRO_FACTORY_ABI,
    functionName: "createPair",
    args: [token0.address, token1.address],
  });
  const { isLoading: isCreatingPair, write: createPair } =
    useContractWrite({
      ...createPairConfig,
      address: token1.address,
      onSuccess: async (result) => {
        const tx = await result.wait();
        const decodedResult = ethers.utils.defaultAbiCoder.decode(
          ['address', 'uint256'],
          tx.logs[0].data
        )
        router.push(`/pool/${decodedResult[0]}`);
      },
    });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-black dark:text-white mb-8">
        <div>
          <p className="text-left text-xl font-semibold m-0">Add Liquidity</p>
          <p className="text-sm m-0 opacity-50">
            Select token pair to add liquidty
          </p>
        </div>
        <button type="button" onClick={handleClose}>
          <XCircleIcon className="h-6 w-6 text-cool-gray-500 hover:text-cool-gray-400 opacity-30" />
        </button>
      </div>

      <TokenPicker
        selectedToken={token0}
        setSelectedToken={setToken0}
        disabledToken={token1}
      >
        {({ selectedToken }) => (
          <div
            className={classNames(
              "py-1 px-4 rounded-2xl rounded-b-none cursor-pointer transition-colors group",
              "bg-neutral-100 dark:bg-neutral-900",
              "hover:bg-neutral-200/75 hover:dark:bg-neutral-800/60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-600">
                  1
                </p>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={selectedToken.logo}
                  className="h-7 mr-2 rounded-full"
                  onError={(event) => {
                    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${selectedToken.symbol}`;
                  }}
                />
                <span className="text-sm font-semibold text-black dark:text-white">
                  {selectedToken.symbol}
                </span>
              </div>
              <ChevronRightIcon className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-all text-black dark:text-white" />
            </div>
          </div>
        )}
      </TokenPicker>
      <TokenPicker
        selectedToken={token1}
        setSelectedToken={setToken1}
        disabledToken={token0}
      >
        {({ selectedToken }) => (
          <div
            className={classNames(
              "py-1 px-4 rounded-2xl rounded-t-none cursor-pointer transition-colors group",
              "bg-neutral-100 dark:bg-neutral-900",
              "hover:bg-neutral-200/75 hover:dark:bg-neutral-800/60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-600">
                  2
                </p>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={selectedToken.logo}
                  className="h-7 mr-2 rounded-full"
                  onError={(event) => {
                    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${selectedToken.symbol}`;
                  }}
                />
                <span className="text-sm font-semibold text-black dark:text-white">
                  {selectedToken.symbol}
                </span>
              </div>
              <ChevronRightIcon className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-all text-black dark:text-white" />
            </div>
          </div>
        )}
      </TokenPicker>
      {(!existingPool ||
        existingPool !== "0x0000000000000000000000000000000000000000") && (
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
            onClick={() => router.push(`/pool/${existingPool}`)}
          >
            <span>Enter pool</span>
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        )}
      {existingPool === "0x0000000000000000000000000000000000000000" && (
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
            disabled={!createPair}
            loading={isCreatingPair}
            onClick={() => createPair?.()}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>Start adding liquidity</span>
          </Button>
          <p className="max-w-3xl mx-auto text-sm text-neutral-400 dark:text-neutral-600 text-center">
            No pool found! But, you can create it now and start providing
            liquidity.
          </p>
        </div>
      )}
    </div>
  );
};
