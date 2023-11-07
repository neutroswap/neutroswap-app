"use client";

import { useMediaQuery } from "usehooks-ts";
import { Drawer } from "vaul";
import { Dialog, DialogContent, DialogTrigger } from "../elements/dialog";
import React from "react";

type Props = {
  children: React.ReactNode;
};

function Root(props: {
  children: React.ReactNode[];
  shouldScaleBackground?: boolean;
}) {
  const { children, shouldScaleBackground = false } = props;
  const atLeastTablet = useMediaQuery("(min-width: 640px)");

  if (!atLeastTablet) {
    return (
      <Drawer.Root shouldScaleBackground={shouldScaleBackground}>
        {children}
      </Drawer.Root>
    );
  }

  return <Dialog>{children}</Dialog>;
}

function Trigger({ children }: { children: React.ReactNode }) {
  const atLeastTablet = useMediaQuery("(min-width: 640px)");

  if (!atLeastTablet) {
    return <Drawer.Trigger asChild>{children}</Drawer.Trigger>;
  }
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}

function Content({ children }: { children: React.ReactNode }) {
  const atLeastTablet = useMediaQuery("(min-width: 640px)");

  if (!atLeastTablet) {
    return (
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-slate-950/50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] mt-24 max-h-[96%] fixed bottom-0 left-0 right-0 outline-none dark:border-t overflow-hidden">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-secondary mt-4" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    );
  }

  return (
    <DialogContent className="p-0 gap-0 overflow-hidden transition-transform">
      {children}
    </DialogContent>
  );
}

export const ResponsiveDialog = Object.assign(
  {},
  {
    Root,
    Trigger,
    Content,
  }
);
