import AllocateDividendModal from "@/components/modules/Modal/AllocateDividendModal";
import DeallocateDividendModal from "@/components/modules/Modal/DeallocateDividendModal";
import {
  useAccount,
  useContractReads,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { DIVIDENDS_ABI, NEUTRO_HELPER_ABI, XNEUTRO_ABI } from "@/shared/abi";
import { formatEther } from "viem";
import {
  DIVIDENDS_CONTRACT,
  NEUTRO_HELPER_CONTRACT,
  XNEUTRO_CONTRACT,
} from "@/shared/helpers/contract";
import { Token } from "@/shared/types/tokens.types";
import PendingDividends from "./PendingDividends";

interface Reward extends Omit<Token, "logo"> {
  logo: string[];
}

export default function UserDividends() {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const { data } = useContractReads({
    // enabled: Boolean(address),
    cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "totalAllocationAtPlugin",
        args: [DIVIDENDS_CONTRACT],
      } as const,
      {
        address: XNEUTRO_CONTRACT,
        abi: XNEUTRO_ABI,
        functionName: "getUsageApproval",
        args: [address!, DIVIDENDS_CONTRACT],
      } as const,
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "userAllocationInDividendsPlugin",
        args: [address!],
      } as const,
    ],
  });

  const userAllocationInPercent =
    !isNaN(Number(data?.[2]?.[0])) && !isNaN(Number(data?.[0]))
      ? ((Number(data?.[2]?.[0]) || 0) / (Number(data?.[0]) || 1)) * 100
      : 0;

  //Claim all button function
  const { config: harvestAllConfig, refetch: refetchHarvestAllConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address!),
      address: DIVIDENDS_CONTRACT,
      abi: DIVIDENDS_ABI,
      functionName: "harvestAllDividends",
    });

  return (
    <div className="col-span-5 mt-8 flex flex-col rounded border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg">
      <div>
        <div className="flex flex-row items-center w-full md:p-8 justify-between">
          <p className="m-4 sm:m-0 text-left font-semibold whitespace-nowrap">
            Your allocation
          </p>
          <div className="flex space-x-4 mr-4 sm:mr-0">
            <DeallocateDividendModal />
            <AllocateDividendModal />
          </div>
        </div>
        <div className="flex flex-col md:pl-8 m-0">
          <div className="grid grid-cols-2 gap-2">
            <div className="ml-4 sm:m-0">
              <span className="text-sm text-neutral-500">Total Allocation</span>
              <div className="mt-1 text-sm">
                {formatEther(data?.[2][0] ?? BigInt(0))} xNEUTRO
              </div>
            </div>
            <div className="ml-4 sm:m-0">
              <span className="text-sm text-neutral-500">Total Share</span>
              <div className="mt-1 text-sm">
                {userAllocationInPercent.toFixed(8)}%
              </div>
            </div>
            <div className="ml-4 sm:m-0">
              <span className="text-sm text-neutral-500">
                Manual Allocation
              </span>
              <div className="mt-1 text-sm">
                {formatEther(data?.[2][1] ?? BigInt(0))} xNEUTRO
              </div>
            </div>
            <div className="ml-4 sm:m-0">
              <span className="text-sm text-neutral-500">
                Redeem Allocation
              </span>
              <div className="mt-1 text-sm">
                {formatEther(data?.[2][2] ?? BigInt(0))} xNEUTRO
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-7 border-neutral-200/80 dark:border-neutral-800/80" />
      <PendingDividends />
    </div>
  );
}
