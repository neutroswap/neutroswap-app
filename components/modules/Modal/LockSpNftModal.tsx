"use client";

import { Button } from "@/components/elements/Button";
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
    // <Modal>
    //   <ModalOpenButton>
    //     <MiniButton type="button">
    //       <LockClosedIcon className="w-7 h-7 mx-auto text-amber-500" />
    //     </MiniButton>
    //   </ModalOpenButton>

    //   <ModalContents>
    //     {({ close }) => (
    //       <>
    //         {/* <form onSubmit={form.handleSubmit(onSubmit)}> */}
    //         <div className="box-border relative">
    //           <XCircleIcon
    //             onClick={() => close()}
    //             className="h-6 cursor-pointer text-black dark:text-white opacity-50 absolute right-0"
    //           />
    //           <div className="flex items-center justify-between">
    //             <div className="flex items-center justify-center w-full text-xl font-bold text-neutral-500 ">
    //               Token Name
    //             </div>
    //           </div>

    //           <div className="flex justify-center items-center mt-2 gap-2">
    //             <span className="text-amber-500 text-xl font-semibold">
    //               Lock
    //             </span>
    //             <span className="text-xl font-semibold text-black dark:text-white">
    //               your position
    //             </span>
    //           </div>

    //           <div className="flex justify-center">
    //             <div className="text-neutral-500">
    //               Provide long-term liquidity to increase your yield
    //             </div>
    //           </div>

    //           <div className="mb-2 font-medium bg-neutral-800 rounded-sm mt-2">
    //             <div className="px-2 py-1">Settings</div>
    //           </div>

    //           <div className="flex px-2 mt-2 text-sm justify-between">
    //             <div>
    //               Lock Duration:{" "}
    //               <span className="text-amber-500">{lockDuration}</span> Days
    //             </div>
    //             <div
    //               className="cursor-pointer text-amber-500"
    //               onClick={handleSetMaxBonus}
    //             >
    //               Set max bonus
    //             </div>
    //           </div>

    //           <div className="mt-5 px-2 ">
    //             <Slider
    //               defaultValue={[0]}
    //               value={[lockDuration]}
    //               onValueChange={(e) => handleSliderChange(e)}
    //               max={180}
    //               step={1}
    //             />
    //           </div>

    //           <div className="flex justify-end text-xs text-neutral-500 mt-2 px-2">
    //             <div>
    //               <span>0% &nbsp;</span>
    //               <span>Lock Bonus</span>
    //             </div>
    //           </div>

    //           {lockDuration > 0 && (
    //             <>
    //               <div className="mt-4 font-medium bg-neutral-800 rounded-sm">
    //                 <div className="px-2 py-1">Estimates</div>
    //               </div>

    //               <div className="flex flex-col px-2 mt-2 text-sm">
    //                 <div className="w-full flex justify-between">
    //                   <div>Deposit Value</div>
    //                   <div className="text-neutral-500">
    //                     $0.2 -&gt; <span className="text-white">$0.21</span>
    //                   </div>
    //                 </div>

    //                 <Collapsible.Root
    //                   className="w-full"
    //                   open={open}
    //                   onOpenChange={setOpen}
    //                 >
    //                   <Collapsible.Trigger asChild>
    //                     <div className="w-full flex justify-between hover:cursor-pointer hover:bg-neutral-900 py-2 rounded-sm ">
    //                       <div className="flex">
    //                         <div className="underline">Total APR</div>
    //                         <ChevronDownIcon className="h-5 ml-1" />
    //                       </div>
    //                       <div className="text-neutral-500">
    //                         21.96% -&gt;{" "}
    //                         <span className="text-amber-500">30.15%</span>
    //                       </div>
    //                     </div>
    //                   </Collapsible.Trigger>

    //                   <Collapsible.Content className="py-2 flex flex-col gap-2 p-2">
    //                     <div className="w-full flex justify-between">
    //                       <div>Swap Fees APR</div>
    //                       <div className="text-black dark:text-white">
    //                         13.76%
    //                       </div>
    //                     </div>
    //                     <div className="w-full flex justify-between">
    //                       <div>Swap Base APR</div>
    //                       <div className="text-black dark:text-white">8.2%</div>
    //                     </div>
    //                     <div className="w-full flex justify-between">
    //                       <div>Farm Bonus APR</div>
    //                       <div className="text-neutral-500">
    //                         0% -&gt;{" "}
    //                         <span className="text-black dark:text-white">
    //                           0%
    //                         </span>
    //                       </div>
    //                     </div>
    //                   </Collapsible.Content>
    //                 </Collapsible.Root>
    //               </div>
    //             </>
    //           )}

    //           <div className="flex gap-2 mt-4">
    //             <Button
    //               type="button"
    //               variant="outline"
    //               onClick={close}
    //               className="!text-black !dark:text-white"
    //             >
    //               Cancel
    //             </Button>
    //             {/* {!isApproved && (
    //             <Button
    //               type="submit"
    //               variant="outline"
    //               disabled={!approve}
    //               loading={isLoadingApprove}
    //             >
    //               Approve
    //             </Button>
    //           )} */}
    //             {/* {!!isApproved && ( */}
    //             <Button
    //               type="submit"
    //               variant="solid"
    //               // disabled={!addLiquidity}
    //               // loading={isLoadingAddLiquidity}
    //               className="!text-black dark:text-white"
    //             >
    //               Lock
    //             </Button>
    //             {/* )} */}
    //           </div>
    //         </div>
    //         {/* </form> */}
    //       </>
    //     )}
    //   </ModalContents>
    // </Modal>
    <div className="p-4">
      <div>
        <p>Lock your spNFT</p>
        <p className="text-sm text-muted-foreground">
          Increase your yield by providing long-term liquidity
        </p>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm whitespace-nowrap leading-none">
              Lock Duration
            </p>
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
            <p className="w-16 text-sm flex justify-end">{duration} days</p>
          </div>
        </div>

        <div className="flex items-center justify-between space-x-4 mt-0.5">
          <button
            className={cn("text-xs font-semibold text-primary")}
            onClick={() => setDuration(multiplierSettings.maxLockDuration)}
          >
            Set Max
          </button>
          <p className="flex text-xs text-muted-foreground whitespace-nowrap justify-end">
            {lockBonusInPercent}% lock bonus{" "}
            {lockBonusInPercent / 100 + 1 > 1
              ? `(x${(lockBonusInPercent / 100 + 1).toFixed(2)})`
              : ""}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide mt-6 mb-2">
            Estimates
          </p>
          <div className="flex justify-between">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
              Deposit Value
            </p>
            <p className="text-sm">
              $
              {currencyFormat(
                +formatEther(ownedLpInUSD ?? BigInt(0)) * +props.amount,
                2,
                0.01
              )}
            </p>
          </div>
          <div className="w-full flex justify-between items-center group">
            <div className="flex text-muted-foreground group-hover:text-foreground text-sm items-center transition-colors">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Total APR
              </p>
            </div>
            <p className="text-sm">{totalAPR}%</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => props.onClose()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="outline"
          className="w-full text-black dark:text-white"
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
