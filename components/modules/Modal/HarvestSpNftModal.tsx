"use client";

import { Button } from "@geist-ui/core";
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
import { classNames } from "@/shared/helpers/classNamer";

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

  const { data: totalRewards } = useContractRead({
    address: props.id,
    abi: NFT_POOL_ABI,
    functionName: "pendingRewards",
    args: [BigInt(props.tokenId)],
  });

  const xNeutroPercentage = BigInt(80);

  const totalRewardsFormatted =
    totalRewards !== undefined ? totalRewards : BigInt(0);

  const xNeutroAmount =
    (totalRewardsFormatted * xNeutroPercentage) / BigInt(100);
  const neutroAmount = totalRewardsFormatted - xNeutroAmount;

  return (
    <div className="animate-in slide-in-from-right-1/4 duration-200">
      <div>
        <div className="font-semibold text-foreground">
          Harvest your spNFT&apos;s Yield
        </div>
        <span className="text-sm text-muted-foreground">
          Collect the rewards you&apos;ve farmed from your spNFT
        </span>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-foreground font-semibold uppercase tracking-wide mt-6 mb-2">
          Rewards breakdown
        </div>
        <div className="flex justify-between">
          <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
            NEUTRO
          </div>
          <span className="text-sm">{formatEther(neutroAmount)}</span>
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
          className={classNames(
            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
            "text-white dark:text-primary",
            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
            "disabled:opacity-50"
          )}
          onClick={() => props.onClose()}
        >
          Cancel
        </Button>
        <Button
          className={classNames(
            "!flex !items-center !py-5 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-base",
            "text-white dark:text-primary !normal-case",
            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
            "disabled:opacity-50"
          )}
          disabled={!harvestPosition}
          loading={isHarvestPositionLoading}
          onClick={() => harvestPosition?.()}
        >
          Harvest Position
        </Button>
      </div>
    </div>
  );
}
