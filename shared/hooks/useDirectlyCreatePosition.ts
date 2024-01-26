import { NEXT_PUBLIC_POSITION_HELPER_CONTRACT } from './../helpers/constants';
import { useAccount, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { waitForTransaction } from '@wagmi/core';
// import useConfig from "./useConfig";
import { Token } from "@/shared/types/tokens.types";
import { isWrappedNative, tokens } from "@/shared/statics/tokenList";
import { parseUnits } from "viem";
import dayjs from "dayjs";
import { POSITION_HELPER_ABI } from "../abi";

type Args = {
  pool?: `0x${string}`
  token0: Token
  token1: Token
  token0Amount: string
  token1Amount: string
  token0Min: bigint
  token1Min: bigint
  isPreferNative: boolean
  lockDuration: bigint,
  onSuccess?: () => Promise<void>;
}

export const useDirectlyCreatePosition = ({
  pool,
  token0,
  token1,
  token0Amount,
  token1Amount,
  token0Min,
  token1Min,
  isPreferNative,
  lockDuration,
  onSuccess
}: Args) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  // isPreferNative
  const { config: addLiquidityETHWithNFTConfig, isFetching: isSimulatingAddLiquidityETHWithNFT } = usePrepareContractWrite({
    enabled: Boolean(
      pool &&
      address &&
      token0Min !== BigInt(0) &&
      token1Min !== BigInt(0) &&
      Number(token0Amount) &&
      Number(token1Amount) &&
      isPreferNative
    ),
    address: NEXT_PUBLIC_POSITION_HELPER_CONTRACT as `0x${string}`,
    abi: POSITION_HELPER_ABI,
    functionName: "addLiquidityETHAndCreatePosition",
    args: [
      // token (address)
      isWrappedNative(token0.address) ? token1.address : token0.address,
      // amountTokenDesired
      isWrappedNative(token0.address) ? parseUnits(token1Amount, token1.decimal) : parseUnits(token0Amount, token0.decimal),
      // amountTokenMin
      isWrappedNative(token0.address) ? token1Min : token0Min,
      // amountETHMin
      isWrappedNative(token0.address) ? token0Min : token1Min,
      // deadline
      BigInt(dayjs().add(5, 'minutes').unix()),
      // to
      address!,
      // nft pool
      pool!,
      // lock duration
      lockDuration
    ],
    value: isWrappedNative(token0.address) ? parseUnits(token0Amount, token0.decimal) : parseUnits(token1Amount, token1.decimal),
  });
  const { isLoading: isAddingLiquidityETHWithNFT, write: addLiquidityETHAndCreatePosition } = useContractWrite({
    ...addLiquidityETHWithNFTConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      if (onSuccess) await onSuccess();
    }
  });

  // !isPreferNative
  const { config: addLiquidityWithNFTConfig, isFetching: isSimulatingAddLiquidityWithNFT } =
    usePrepareContractWrite({
      enabled: Boolean(
        pool &&
        address &&
        token0Min !== BigInt(0) &&
        token1Min !== BigInt(0) &&
        Number(token0Amount) &&
        Number(token1Amount) &&
        !isPreferNative
      ),
      address: NEXT_PUBLIC_POSITION_HELPER_CONTRACT as `0x${string}`,
      abi: POSITION_HELPER_ABI,
      functionName: "addLiquidityAndCreatePosition",
      args: [
        // tokenA
        token0.address,
        // tokenB
        token1.address,
        // amountADesired
        parseUnits(token0Amount, token0.decimal),
        // amountBDesired
        parseUnits(token1Amount, token1.decimal),
        // amountAMin
        token0Min,
        // amountBMin
        token1Min,
        // deadline
        BigInt(dayjs().add(5, 'minutes').unix()),
        // to
        address!,
        // nft pool
        pool!,
        // lock duration
        lockDuration
      ],
    });
  const { isLoading: isAddingLiquidityWithNFT, write: addLiquidityAndCreatePosition } =
    useContractWrite({
      ...addLiquidityWithNFTConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        if (onSuccess) await onSuccess();
      }
    });

  if (!isPreferNative) {
    return {
      isSimulating: isSimulatingAddLiquidityWithNFT,
      isLoading: isAddingLiquidityWithNFT,
      write: addLiquidityAndCreatePosition
    }
  }

  return {
    isSimulating: isSimulatingAddLiquidityETHWithNFT,
    isLoading: isAddingLiquidityETHWithNFT,
    write: addLiquidityETHAndCreatePosition
  }
}
