import { isWrappedNative } from './../statics/tokenList';
import { useAccount, useNetwork, usePrepareContractWrite, useContractWrite } from "wagmi";
import {Token} from "@/shared/types/tokens.types"
import { parseUnits } from "viem";
import dayjs from "dayjs";
import { waitForTransaction } from '@wagmi/core';
import { NEXT_PUBLIC_ROUTER_CONTRACT } from '../helpers/constants';
import { NEUTRO_ROUTER_ABI } from '../abi';

type Args = {
  token0: Token
  token1: Token
  token0Amount: string
  token1Amount: string
  token0Min: bigint
  token1Min: bigint
  isPreferNative: boolean
  onSuccess?: () => Promise<void>;
}
export const useAddLiquidity = ({
  token0,
  token1,
  token0Amount,
  token1Amount,
  token0Min,
  token1Min,
  isPreferNative,
  onSuccess
}: Args) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { config: addLiquidityETHConfig, isFetching: isSimulatingAddLiquidityETH } = usePrepareContractWrite({
    enabled: Boolean(
      address &&
      token0Min !== BigInt(0) &&
      token1Min !== BigInt(0) &&
      Number(token0Amount) &&
      Number(token1Amount) &&
      isPreferNative
    ),
    address: NEXT_PUBLIC_ROUTER_CONTRACT as `0x${string}`,
    abi: NEUTRO_ROUTER_ABI,
    functionName: "addLiquidityETH",
    args: [
      // token (address)
      isWrappedNative(token0.address) ? token1.address : token0.address,
      // amountTokenDesired
      isWrappedNative(token0.address) ? parseUnits(token1Amount, token1.decimal) : parseUnits(token0Amount, token0.decimal),
      // amountTokenMin
      isWrappedNative(token0.address) ? token1Min : token0Min,
      // amountETHMin
      isWrappedNative(token0.address) ? token0Min : token1Min,
      // to
      address!,
      // deadline
      BigInt(dayjs().add(5, 'minutes').unix())
    ],
    value: isWrappedNative(token0.address) ? parseUnits(token0Amount, token0.decimal) : parseUnits(token1Amount, token1.decimal),
  });
  const { isLoading: isAddingLiquidityETH, write: addLiquidityETH } = useContractWrite({
    ...addLiquidityETHConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      if (onSuccess) await onSuccess();
    }
  });

  const { config: addLiquidityConfig, isFetching: isSimulatingAddLiquidity } =
    usePrepareContractWrite({
      enabled: Boolean(
        address &&
        token0Min !== BigInt(0) &&
        token1Min !== BigInt(0) &&
        Number(token0Amount) &&
        Number(token1Amount) &&
        !isPreferNative
      ),
      address: NEXT_PUBLIC_ROUTER_CONTRACT as `0x${string}`,
      abi: NEUTRO_ROUTER_ABI,
      functionName: "addLiquidity",
      args: [
        token0.address,
        token1.address,
        parseUnits(token0Amount, token0.decimal),
        parseUnits(token1Amount, token1.decimal),
        token0Min,
        token1Min,
        address!,
        BigInt(dayjs().add(5, 'minutes').unix())
      ],
    });
  const { isLoading: isAddingLiquidity, write: addLiquidity } =
    useContractWrite({
      ...addLiquidityConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
        if (onSuccess) await onSuccess();
      }
    });

  if (!isPreferNative) {
    return {
      isSimulating: isSimulatingAddLiquidity,
      isLoading: isAddingLiquidity,
      write: addLiquidity
    }
  }

  return {
    isSimulating: isSimulatingAddLiquidityETH,
    isLoading: isAddingLiquidityETH,
    write: addLiquidityETH
  }
}
