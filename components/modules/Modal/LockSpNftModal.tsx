"use client";

import { Button } from "@geist-ui/core";
import { Form } from "@/components/elements/Form";
import MiniButton from "@/components/elements/MiniButton";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { ChevronDownIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/elements/Collapsible";
import { Slider } from "@/components/elements/Slider";
import { Response as GetNFTPositionResponse } from "@/shared/getters/getNFTPosition";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import { NEUTRO_HELPER_ABI, NFT_POOL_ABI } from "@/shared/abi";
import { waitForTransaction } from "@wagmi/core";
import { NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT } from "@/shared/helpers/constants";
import { cn, currencyFormat } from "@/shared/utils";
import { formatEther } from "viem";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { CaretDown } from "@phosphor-icons/react";
import { NEUTRO_HELPER_CONTRACT } from "@/shared/helpers/contract";
import { classNames } from "@/shared/helpers/classNamer";
dayjs.extend(relativeTime);
dayjs.extend(duration);

export default function LockSpNftModal(
  props: GetNFTPositionResponse & { onClose: () => void }
) {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [lockDuration, setLockDuration] = useState(0);

  const handleSliderChange = (event: number[]) => {
    setLockDuration(Number(event));
  };

  const handleSetMaxBonus = () => {
    setLockDuration(180);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    if (!address) return new Error("Not connected");

    // if (!isApproved) {
    //   approve?.();
    // }

    // if (isApproved) {
    //   allocate?.();
  };

  const DAY_IN_SECONDS = 86400;
  const now = dayjs().unix();
  const remainingTimeInSeconds = +props.endLockTime - now;
  const remainingTimeInDays = Math.ceil(
    remainingTimeInSeconds / DAY_IN_SECONDS
  );

  const [multiplierSettings, setMultiplierSettings] = useState({
    maxGlobalMultiplier: 0,
    maxLockDuration: 0,
    maxLockMultiplier: 0,
    maxBoostMultiplier: 0,
  });
  const { multiplier, ...apr } = props.apr;
  const totalAPR = Object.values(apr).reduce((prev, curr) => {
    return prev + curr;
  });

  const [duration, setDuration] = useState(
    remainingTimeInDays >= 0 ? remainingTimeInDays : 0
  );
  const debouncedDuration = useDebounceValue(duration, 500);

  const handleDurationChange = (event: number[]) => {
    setDuration(Number(event));
  };

  useContractRead({
    enabled: Boolean(props.id),
    address: props.id,
    abi: NFT_POOL_ABI,
    functionName: "getMultiplierSettings",
    onSuccess: (data) => {
      const [
        maxGlobalMultiplier,
        maxLockDuration,
        maxLockMultiplier,
        maxBoostMultiplier,
      ] = data;
      setMultiplierSettings({
        maxGlobalMultiplier: Number(maxGlobalMultiplier),
        maxLockDuration: dayjs
          .duration(Number(maxLockDuration), "seconds")
          .asDays(),
        maxLockMultiplier: Number(maxLockMultiplier),
        maxBoostMultiplier: Number(maxBoostMultiplier),
      });
    },
  });

  const { config: lockPositionConfig } = usePrepareContractWrite({
    address: props.id,
    abi: NFT_POOL_ABI,
    functionName: "lockPosition",
    args: [
      BigInt(props.tokenId),
      BigInt(dayjs.duration(Number(debouncedDuration), "days").asSeconds()),
    ],
  });

  const { isLoading: isLockPositionLoading, write: lockPosition } =
    useContractWrite({
      ...lockPositionConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      },
    });

  const { data: ownedLpInUSD } = useContractRead({
    address: NEUTRO_HELPER_CONTRACT,
    abi: NEUTRO_HELPER_ABI,
    functionName: "getTotalValueOfLiquidity",
    args: [props.lpToken],
  });

  // in percent
  const lockBonusInPercent = useMemo(() => {
    const percent =
      (multiplierSettings.maxLockMultiplier * duration) /
      multiplierSettings.maxLockDuration /
      100;
    return Number(percent.toFixed(2));
  }, [duration, multiplierSettings]);

  const afterLock =
    (lockBonusInPercent / 100 + 1) *
    (props.apr.multiplier.boost + props.apr.multiplier.lock) *
    props.apr.base;

  return (
    <div className="animate-in slide-in-from-right-1/4 duration-200">
      <div>
        <div className="font-semibold text-foreground">Lock your spNFT</div>
        <span className="text-sm text-muted-foreground">
          Increase your yield by providing long-term liquidity
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <div className="text-sm whitespace-nowrap leading-none">
              Lock Duration
            </div>
          </div>
          <Slider
            defaultValue={[remainingTimeInDays]}
            value={[duration]}
            onValueChange={handleDurationChange}
            max={multiplierSettings.maxLockDuration}
            step={1}
            min={Math.max(remainingTimeInDays, 0)}
          />
          <div>
            <span className="w-16 text-sm flex justify-end">
              {duration} days
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between space-x-4 mt-0.5">
          <button
            className={cn("text-xs font-semibold text-primary")}
            onClick={() => setDuration(multiplierSettings.maxLockDuration)}
          >
            Set Max
          </button>
          <span className="flex text-xs text-muted-foreground whitespace-nowrap justify-end">
            {lockBonusInPercent}% lock bonus{" "}
            {lockBonusInPercent / 100 + 1 > 1
              ? `(x${(lockBonusInPercent / 100 + 1).toFixed(2)})`
              : ""}
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-foreground font-semibold uppercase tracking-wide mt-6 mb-2">
            Estimates
          </div>
          <div className="flex justify-between">
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
              Deposit Value
            </div>
            <span className="text-sm">
              $
              {currencyFormat(
                +formatEther(ownedLpInUSD ?? BigInt(0)) * +props.amount,
                2,
                0.01
              )}
            </span>
          </div>
          <div className="w-full flex justify-between items-center group">
            <div className="flex text-muted-foreground group-hover:text-foreground text-sm items-center transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wide">
                Total APR
              </div>
            </div>
            <span className="text-sm">{totalAPR}%</span>
          </div>
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
            "text-white dark:text-primary",
            "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
            "!border !border-orange-600/50 dark:border-orange-400/[.12]",
            "disabled:opacity-50"
          )}
          loading={isLockPositionLoading}
          disabled={!lockPosition}
          onClick={() => lockPosition?.()}
        >
          Lock Position
        </Button>
      </div>
    </div>
  );
}
