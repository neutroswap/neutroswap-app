import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { waitForTransaction } from "@wagmi/core";
import { NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT } from "../helpers/constants";
import { NFTPOOLFACTORY_ABI } from "../abi";

type Args = {
  pool: `0x${string}`;
  enabled: boolean;
  onSuccess?: () => Promise<void>;
};
export const useCreateNFTPool = ({ pool, enabled, onSuccess }: Args) => {
  const { chain } = useNetwork();

  const { config } = usePrepareContractWrite({
    enabled: enabled,
    address: NEXT_PUBLIC_NFT_POOL_FACTORY_CONTRACT as `0x${string}`,
    abi: NFTPOOLFACTORY_ABI,
    functionName: "createPool",
    args: [pool],
  });

  return useContractWrite({
    ...config,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      if (onSuccess) await onSuccess();
    },
  });
};
