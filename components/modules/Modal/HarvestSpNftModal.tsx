"use client";

import { Button } from "@/components/elements/Button";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { Response as GetNFTPositionResponse } from "@/shared/getters/getNFTPosition";
import { NFT_POOL_ABI } from "@/shared/abi";
import { waitForTransaction } from "@wagmi/core";
import { formatEther } from "viem";
import Xneutro from "@/pages/xneutro";

export function Harvest(
  props: GetNFTPositionResponse & { onClose: () => void }
) {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { config: harvestPositionConfig } = usePrepareContractWrite({
    address: props.id,
    abi: NFT_POOL_ABI,
    functionName: "harvestPosition",
    args: [BigInt(props.tokenId)],
  });

  const { isLoading: isHarvestPositionLoading, write: harvestPosition } =
    useContractWrite({
      ...harvestPositionConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      },
    });

  const { data: neutroAmount } = useContractRead({
    address: props.id,
    abi: NFT_POOL_ABI,
    functionName: "pendingRewards",
    args: [BigInt(props.tokenId)],
  });

  const neutroPercentage = BigInt(200);
  const xNeutroPercentage = BigInt(800);

  const neutroAmountFormatted =
    neutroAmount !== undefined ? neutroAmount : BigInt(0);

  const xNeutroAmount =
    (neutroAmountFormatted / neutroPercentage) * xNeutroPercentage;

  return (
    <div className="animate-in slide-in-from-right-1/4 duration-200">
      <div>
        <div className="font-semibold">Harvest your positions</div>
        <span className="text-sm text-muted-foreground">
          Collect your rewards
        </span>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wide mt-6 mb-2">
          Rewards breakdown
        </div>
        <div className="flex justify-between">
          <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
            NEUTRO
          </div>
          <span className="text-sm">{formatEther(neutroAmountFormatted)}</span>
        </div>
        <div className="flex justify-between">
          <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
            xNEUTRO
          </div>
          <span className="text-sm">{formatEther(xNeutroAmount)}</span>
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => props.onClose()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full"
          variant="outline"
          disabled={!harvestPosition}
          loading={isHarvestPositionLoading}
          onClick={() => harvestPosition?.()}
        >
          Harvest position
        </Button>
      </div>
    </div>
  );
}
