import { useMemo } from "react";
import { Content } from "@/.contentlayer/generated";
import { LaunchPhase } from "@/pages/launchpad/modules/LaunchpadSteps";
import { LAUNCHPAD_POOL_ABI } from "../abi/launchpad-pool.abi";
import {useContractReads} from "wagmi";

export const useLaunchpadPhase = (data: Content) => {
  const launchpadPoolContract = {
    address: data.contract as `0x${string}`,
    abi: LAUNCHPAD_POOL_ABI
  } as const;

  // multicall only executed when phase === sale
  const { data: launchpadInfo } = useContractReads({
    enabled: !data.hasEnded,
    allowFailure: false,
    scopeKey: `launchpad-multicall-${data.contract}`,
    contracts: [
      {
        ...launchpadPoolContract,
        functionName: 'START_TIME',
      },
      {
        ...launchpadPoolContract,
        functionName: 'END_TIME',
      },
      {
        ...launchpadPoolContract,
        functionName: 'hasStarted',
      },
      {
        ...launchpadPoolContract,
        functionName: 'hasEnded',
      },
    ] as const,
  })

  // if not, just use the current
  const phase: LaunchPhase = useMemo(() => {
    if (!launchpadInfo) return 'upcoming'
    const [,, hasStarted, hasEnded] = launchpadInfo;
    if (hasEnded) return 'claim'
    if (hasStarted) return 'public'
    // else
    return 'upcoming';
  }, [launchpadInfo])

  return phase;
}
