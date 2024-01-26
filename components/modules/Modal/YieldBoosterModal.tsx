"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { cn, currencyFormat } from "@/shared/utils";
import { ResponsiveDialog } from "../ResponsiveDialog";
import TokenLogo from "../TokenLogo";
import { DownloadSimple, UploadSimple, Icon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Response as GetNFTPositionResponse } from "@/shared/getters/getNFTPosition";
import { useAccount, useContractReads, useNetwork } from "wagmi";
import { formatEther } from "viem";
import dayjs from "dayjs";
import { Boost } from "./Boost";
import { Unboost } from "./Unboost";

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

export default function YieldBoosterModal(props: Props) {
  const { children } = props;
  const items: TabItems = useMemo(
    () => [
      {
        title: "Boost",
        icon: UploadSimple,
        content: <Boost {...props.data} onClose={() => setSelected("Boost")} />,
      },
      {
        title: "Unboost",
        icon: DownloadSimple,
        content: (
          <Unboost {...props.data} onClose={() => setSelected("Boost")} />
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
                      "flex flex-col items-center w-full p-3 text-muted-foreground hover:text-foreground data-[state=active]:text-primary focus:outline-ring rounded transition group",
                      hidden && "sr-only",
                      disabled &&
                        "opacity-50 cursor-not-allowed hover:text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mb-2")} />
                    <span className="text-xs font-semibold leading-none -mb-px">
                      {title}
                    </span>
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </div>

          {items.map(({ title, content }) => (
            <Tabs.Content
              key={title}
              value={title}
              className="w-full focus-visible:outline-none text-muted-foreground box-border"
            >
              <div className="px-4 py-2 border-b border-border/60">
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
                  <div className="flex items-center text-foreground">
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
              </div>

              {selected === "Boost" && title === "Boost" && (
                <div className="w-full p-4">{content}</div>
              )}
              {selected === "Unboost" && title === "Unboost" && (
                <div className="w-full p-4">{content}</div>
              )}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </ResponsiveDialog.Content>
    </ResponsiveDialog.Root>
  );
}
