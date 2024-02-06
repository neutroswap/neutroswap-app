"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Envelope, EnvelopeOpen, Icon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { cn } from "@/shared/utils";
import { WrapEosToWeos } from "../swap/WrapEosToWeos";
import { UnwrapWeosToEos } from "../swap/UnwrapWeosToEos";

type TabItems = {
  title: string;
  icon: Icon;
  content: React.ReactNode;
  hidden?: boolean;
  disabled?: boolean;
}[];

export default function WrapUnwrapModal(props: any) {
  const { children } = props;
  const items: TabItems = useMemo(
    () => [
      {
        title: "Wrap",
        icon: Envelope,
        content: <WrapEosToWeos onClose={() => setSelected("Wrap")} />,
      },
      {
        title: "Unwrap",
        icon: EnvelopeOpen,
        content: <UnwrapWeosToEos onClose={() => setSelected("Wrap")} />,
      },
    ],
    []
  );

  const [selected, setSelected] = useState(items[0].title);

  return (
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
          {selected === "Wrap" && title === "Wrap" && (
            <div className="w-full p-4">{content}</div>
          )}
          {selected === "Unwrap" && title === "Unwrap" && (
            <div className="w-full p-4">{content}</div>
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
