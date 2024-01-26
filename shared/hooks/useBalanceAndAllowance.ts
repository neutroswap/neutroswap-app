import { useAccount, useContractReads, useNetwork } from "wagmi";
import { ERC20_ABI } from "../abi";
import { NEXT_PUBLIC_ROUTER_CONTRACT } from "@/shared/helpers/constants";

export const useBalanceAndAllowance = (
  token: `0x${string}`,
  spender?: `0x${string}`
) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { data, refetch } = useContractReads({
    enabled: Boolean(address),
    scopeKey: `${token}_balance_and_allowance`,
    blockTag: "latest",
    // cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: token,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [
          address!,
          spender ?? (NEXT_PUBLIC_ROUTER_CONTRACT as `0x${string}`),
        ],
      } as const,
      {
        address: token,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address!],
      } as const,
    ],
  });
  if (!data)
    return {
      allowance: BigInt(0),
      balance: BigInt(0),
      refetch,
    };

  return {
    allowance: data[0],
    balance: data[1],
    refetch,
  };
};
