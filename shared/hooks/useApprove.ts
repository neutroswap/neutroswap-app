import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { ERC20_ABI } from "../abi";
import { waitForTransaction } from "@wagmi/core";

type Args = {
  address: `0x${string}`;
  spender: `0x${string}`;
  onSuccess?: () => Promise<void>;
};
export const useApprove = ({ address, spender, onSuccess }: Args) => {
  const { config } = usePrepareContractWrite({
    address: address,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [
      spender,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
  });

  return useContractWrite({
    ...config,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      if (onSuccess) await onSuccess();
    },
  });
};
