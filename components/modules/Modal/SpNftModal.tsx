"use client";

import { cn, currencyFormat } from "@/shared/utils";
import { NEUTRO_HELPER_ABI, NFT_POOL_ABI } from "@/shared/abi";
import { formatEther } from "viem";
import { useMemo, useState } from "react";
import { useAccount, useContractReads, useNetwork } from "wagmi";
import {
  Lock as LockIcon,
  Lightning,
  FireSimple,
  Percent,
  DownloadSimple,
  UploadSimple,
  ArrowsSplit,
  ArrowsMerge,
  ArrowsLeftRight,
  Icon,
  CaretLeft,
  Wallet,
} from "@phosphor-icons/react";
import * as Tabs from "@radix-ui/react-tabs";
import AddToSpNftModal from "./AddToSpNftModal";
import WithdrawFromSpNftModal from "./WithdrawFromSpNftModal";
import LockSpNftModal from "./LockSpNftModal";
import { Response as GetNFTPositionResponse } from "@/shared/getters/getNFTPosition";
import dayjs from "dayjs";
import TransferPositionModal from "./TransferPositionModal";
import SplitPositionModal from "./SplitPositionModal";
import MergePositionModal from "./MergePositionModal";
import { ResponsiveDialog } from "../ResponsiveDialog";
import TokenLogo from "../TokenLogo";
import { NEUTRO_HELPER_CONTRACT } from "@/shared/helpers/contract";
import Countdown from "../Countdown";
import { Harvest } from "./HarvestSpNftModal";

type Props = {
  children: React.ReactNode;
  data: GetNFTPositionResponse;
};

type TabItems = {
  title: string;
  icon: Icon;
  content: React.ReactNode;
  hidden?: boolean;
  disabled?: boolean;
}[];

export default function SPNFTSettingsModal(props: Props) {
  const { children } = props;
  const now = dayjs().unix();
  const isRemoveActive = dayjs
    .unix(now)
    .isBefore(dayjs.unix(+props.data.endLockTime));
  const items: TabItems = useMemo(
    () => [
      {
        title: "Overview",
        icon: DownloadSimple,
        content: <Overview {...props.data} />,
        hidden: true,
      },
      {
        title: "Add",
        icon: DownloadSimple,
        content: (
          <AddToSpNftModal
            {...props.data}
            onClose={() => setSelected("Overview")}
          />
        ),
      },
      {
        title: "Remove",
        icon: UploadSimple,
        content: (
          <WithdrawFromSpNftModal
            {...props.data}
            onClose={() => setSelected("Overview")}
          />
        ),
        disabled: isRemoveActive,
      },
      {
        title: "Transfer",
        icon: ArrowsLeftRight,
        content: <TransferPositionModal />,
        disabled: true,
      },
      {
        title: "Split",
        icon: ArrowsSplit,
        content: <SplitPositionModal />,
        disabled: true,
      },
      {
        title: "Merge",
        icon: ArrowsMerge,
        content: <MergePositionModal />,
        disabled: true,
      },
      {
        title: "Harvest",
        icon: Wallet,
        content: (
          <Harvest {...props.data} onClose={() => setSelected("Overview")} />
        ),
      },
      {
        title: "Lock",
        icon: LockIcon,
        content: (
          <LockSpNftModal
            {...props.data}
            onClose={() => setSelected("Overview")}
          />
        ),
      },
    ],
    [props.data]
  );

  const [selected, setSelected] = useState(items[0].title);

  return (
    <ResponsiveDialog.Root shouldScaleBackground>
      <ResponsiveDialog.Trigger>{children}</ResponsiveDialog.Trigger>
      <ResponsiveDialog.Content>
        <Tabs.Root
          className="flex flex-col-reverse max-w-lg text-muted-foreground"
          value={selected}
          onValueChange={(value) => setSelected(value)}
        >
          {selected === items[0].title && (
            <div className="relative flex flex-nowrap border-t border-border/60 overflow-y-hidden overflow-x-auto">
              <Tabs.List aria-label="tabs" className="flex w-full">
                {items.map((item) => {
                  const { title, hidden, disabled, icon: Icon } = item;
                  return (
                    <Tabs.Trigger
                      key={title}
                      value={title}
                      disabled={disabled}
                      className={cn(
                        "flex flex-col items-center w-full p-3 text-foreground hover:text-foreground data-[state=active]:text-primary focus:outline-ring rounded transition group",
                        hidden && "sr-only",
                        disabled &&
                          "opacity-50 cursor-not-allowed text-muted-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 mb-2 text-primary",
                          disabled && "text-muted-foreground"
                        )}
                      />
                      <span className="text-xs font-semibold leading-none -mb-px">
                        {title}
                      </span>
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>
            </div>
          )}

          {items.map(({ title, content }) => (
            <Tabs.Content
              key={title}
              value={title}
              className="w-full focus-visible:outline-none text-muted-foreground"
            >
              <div className="px-4 py-2 border-b border-border/60">
                {selected === items[0].title && (
                  <div className="flex items-center">
                    <div className="flex items-center -space-x-2 mr-2">
                      <TokenLogo
                        className="w-6 h-6"
                        src={props.data.assets.token0.logo}
                      />
                      <TokenLogo
                        className="w-6 h-6"
                        src={props.data.assets.token1.logo}
                      />
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-1 mr-2">
                        <span className="font-semibold">
                          {props.data.assets.token0.name}
                        </span>
                        <span className="font-semibold text-muted-foreground">
                          /
                        </span>
                        <span className="font-semibold">
                          {props.data.assets.token1.name}
                        </span>
                      </div>
                      <span className="text-muted-foreground tracking-wide">
                        #ID-{props.data.tokenId}
                      </span>
                    </div>
                  </div>
                )}

                {selected !== items[0].title && (
                  <button
                    className="flex items-center gap-1 group"
                    onClick={() => setSelected(items[0].title)}
                  >
                    <CaretLeft
                      className="w-3 h-3 group-hover:-translate-x-0.5 transition"
                      weight="bold"
                    />
                    <span className="mt-px text-sm ">Back to overview</span>
                  </button>
                )}
              </div>

              <div className="w-full p-4">{content}</div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </ResponsiveDialog.Content>
    </ResponsiveDialog.Root>
  );
}

function Overview(props: GetNFTPositionResponse) {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const lockDurationEpoch = Math.floor(parseInt(props.endLockTime));
  const { base, nitro, multiplier } = props.apr;
  const bonus = (multiplier.lock + multiplier.boost) * base;
  const total = Object.values(multiplier).reduce(
    (prev, curr) => prev + curr,
    base + nitro + bonus
  );

  const { data } = useContractReads({
    enabled: Boolean(address),
    cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "getTokenPrice",
        args: [props.lpToken],
      } as const,
      {
        address: props.id,
        abi: NFT_POOL_ABI,
        functionName: "pendingRewards",
        args: [BigInt(props.tokenId)],
      } as const,
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "getNeutroPrice",
      } as const,
    ],
  });

  const neutroPrice = +formatEther(data?.[2] ?? BigInt(0));
  const pendingRewards = +formatEther(data?.[1] ?? BigInt(0));
  const totalValue = +formatEther(data?.[0] ?? BigInt(0));

  const now = dayjs().unix();
  const isLockActive = dayjs.unix(now).isBefore(dayjs.unix(+props.endLockTime));

  const properties = [
    {
      name: "Yield-bearing",
      description: "This spNFT is eligible to yield NEUTRO incentives",
      icon: <Percent className={cn("w-6 h-6")} weight="duotone" />,
      apr: props.apr.base,
      isActive: props.settings.yield_bearing,
    },
    {
      name: "Lock Bonus",
      description:
        "A lock will provide a yield bonus based on its duration's multiplier",
      icon: <LockIcon className={cn("w-6 h-6")} weight="duotone" />,
      apr: props.apr.multiplier.lock,
      duration: 0,
      multiplier:
        props.apr.multiplier.lock === 0 ? 1 : props.apr.multiplier.lock,
      isActive: isLockActive,
    },
    {
      name: "Yield Booster",
      description: "You allocated xNEUTRO to this spNFT",
      icon: <Lightning className={cn("w-6 h-6")} weight="duotone" />,
      apr: props.apr.multiplier.boost,
      multiplier: props.apr.multiplier.boost,
      isActive: props.settings.boost,
    },
    {
      name: "Nitro Pool",
      description: "The spNFT is staked on a incentivized nitro pool",
      icon: <FireSimple className={cn("w-6 h-6")} weight="duotone" />,
      apr: props.apr.nitro,
      isActive:
        props.settings.nitro !== "0x0000000000000000000000000000000000000000",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col pt-0 w-full",
        "animate-in fade-in-0 slide-in-from-left-1/4 duration-200"
      )}
    >
      <div className="flex divide-x divide-border/60 rounded-lg border border-border/60 mt-1">
        <div className="flex flex-col w-full p-2 text-center items-center justify center">
          <div className="text-foreground text-xs font-semibold uppercase tracking-wide">
            Value
          </div>
          <span className="text-sm font-semibold">
            ${currencyFormat(totalValue * +props.amount, 2, 0.01)}
          </span>
        </div>
        <div className="flex flex-col w-full p-2 text-center items-center justify center">
          <div className="text-foreground text-xs font-semibold uppercase tracking-wide">
            APR
          </div>
          <span className="text-sm font-semibold">
            {currencyFormat(total, 2, 0.01)}%
          </span>
        </div>
        <div className="flex flex-col w-full p-2 text-center items-center justify center">
          <div className="text-foreground text-xs font-semibold uppercase tracking-wide">
            Earnings
          </div>
          <span className="text-sm font-semibold">
            ${(currencyFormat(pendingRewards * neutroPrice), 2, 0.01)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border/50 mt-2">
        {properties.map((item) => (
          <div key={item.name} className="flex justify-between py-2 sm:py-4">
            <div className="flex gap-4 items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg aspect-square bg-secondary dark:bg-secondary/40",
                  item.isActive ? "text-primary" : "text-muted-secondary"
                )}
              >
                {item.icon}
              </div>
              <div>
                <div className="font-semibold text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground w-60 font-medium">
                  {item.description}
                </div>
              </div>
            </div>
            <div>
              {item.name === "Lock Bonus" || item.name === "Yield Booster" ? (
                <div className="text-sm text-right">
                  Multiplier: x{item.multiplier}
                </div>
              ) : (
                <div className="text-sm text-right">
                  {currencyFormat(item.apr, 2, 0.01)}% APR
                </div>
              )}
              {item.name === "Lock Bonus" && lockDurationEpoch > now ? (
                <div className="text-sm text-right">
                  <Countdown targetEpochTime={lockDurationEpoch} />
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
