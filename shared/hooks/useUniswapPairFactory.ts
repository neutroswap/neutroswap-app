import { useCallback, useMemo } from "react";
import { getAddress } from "@ethersproject/address";
import {
  appendEthToContractAddress,
  UniswapPair,
  UniswapPairSettings,
  UniswapVersion
} from "simple-uniswap-sdk";
import {
  NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_FACTORY_CONTRACT,
  NEXT_PUBLIC_MULTICALL_CONTRACT,
  NEXT_PUBLIC_ROUTER_CONTRACT,
  NEXT_PUBLIC_RPC,
  NEXT_PUBLIC_WEOS_ADDRESS
} from "../helpers/constants";

type FactorySettings = {
  token0: `0x${string}`,
  token1: `0x${string}`,
  isNative: boolean,
  slippage: string,
  address?: string,
  pairs?: string,
}

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

/**  
* Hooks to conditionally create UniswapPair instance 
* @see https://github.com/joshstevens19/simple-uniswap-sdk
*  
* @return {UniswapPair} uniswapPair - a UniswapPair instance that can be use to simulate trade and etc.
*/
const useUniswapPairFactory = ({
  token0,
  token1,
  pairs,
  isNative,
  slippage,
  address
}: FactorySettings): UniswapPair => {
  let customNetworkData = useMemo(
    () => ({
      nameNetwork: "EOS EVM",
      multicallContractAddress: NEXT_PUBLIC_MULTICALL_CONTRACT as string,
      nativeCurrency: {
        name: "EOS",
        symbol: "EOS",
      },
      nativeWrappedTokenInfo: {
        chainId: Number(NEXT_PUBLIC_CHAIN_ID),
        contractAddress: NEXT_PUBLIC_WEOS_ADDRESS as string,
        decimals: 18,
        symbol: "WEOS",
        name: "Wrapped EOS",
      },
    }),
    []
  );

  let cloneUniswapContractDetailsV2 = useMemo(
    () => ({
      routerAddress: NEXT_PUBLIC_ROUTER_CONTRACT as string,
      factoryAddress: NEXT_PUBLIC_FACTORY_CONTRACT as string,
      pairAddress: pairs ?? NULL_ADDRESS,
    }),
    [pairs]
  );

  let formatWrappedToken = useCallback(
    (token: `0x${string}`, isPreferNative: boolean) => {
      if (getAddress(token) !== getAddress(customNetworkData.nativeWrappedTokenInfo.contractAddress))
        return token;
      if (!isPreferNative) return token;
      let appendedToken = appendEthToContractAddress(token);
      return appendedToken as `0x${string}`;
    },
    [customNetworkData]
  );

  const uniswapPair = useMemo(() => new UniswapPair({
    fromTokenContractAddress: formatWrappedToken(
      token0,
      isNative
    ),
    toTokenContractAddress: formatWrappedToken(
      token1,
      isNative
    ),
    ethereumAddress: address as string | undefined ?? NULL_ADDRESS,
    chainId: Number(NEXT_PUBLIC_CHAIN_ID),
    providerUrl: NEXT_PUBLIC_RPC as string,
    settings: new UniswapPairSettings({
      gasSettings: {
        getGasPrice: async () => {
          return "GWEI_GAS_PRICE";
        },
      },
      slippage: Number(slippage) / 100,
      deadlineMinutes: 15,
      disableMultihops: true,
      cloneUniswapContractDetails: {
        v2Override: cloneUniswapContractDetailsV2,
      },
      uniswapVersions: [UniswapVersion.v2],
      customNetwork: customNetworkData,
    }),
  }), [
    token0,
    token1,
    address,
    cloneUniswapContractDetailsV2,
    customNetworkData,
    formatWrappedToken,
    isNative,
    slippage
  ]);

  return uniswapPair
}

export default useUniswapPairFactory;
