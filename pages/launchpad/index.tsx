// import { Inter } from 'next/font/google'

import { Button, Page, Text } from "@geist-ui/core";
import Logo from "@/public/logo.svg";
import { Plus, Rocket } from "lucide-react";
import Link from "next/link";
import { classNames } from "@/shared/helpers/classNamer";
import Script from "next/script";

// const inter = Inter({ subsets: ['latin'] })

export default function Launchpad() {
  return (
    <>
      <Script async src="https://tally.so/widgets/embed.js" />
      <div className="flex flex-col items-center justify-center max-w-5xl mx-auto py-16">
        <div>
          <div className="flex items-center justify-center space-x-3">
            <Rocket className="w-7 h-7 md:w-8 md:h-8 text-primary mt-1" />
            <p className="m-0 text-center text-3xl md:text-4xl font-semibold">
              Launchpad
            </p>
          </div>
          <p className="m-0 text-center text-base text-neutral-400 mt-2">
            Participate in EOS EVM&apos;s Ecosystem Project Raises
          </p>
        </div>

        <div className="w-full">
          <div className="flex w-full py-2 justify-end items-center">
            <Button
              data-tally-open="3xYYDE"
              data-tally-layout="modal"
              data-tally-width="800"
              data-tally-auto-close="-2000"
              className={classNames(
                "!flex !items-center !py-5 !transition-all !w-full  !rounded-lg !cursor-pointer !justify-center !font-semibold !shadow-dark-sm",
                "text-white dark:text-primary",
                "!bg-primary hover:bg-primary/90 dark:bg-primary/10 dark:hover:bg-primary/[0.15]",
                "!border !border-orange-600/50 dark:border-orange-400/[.12]",
                "disabled:opacity-50"
              )}
            >
              Apply to Launch
            </Button>
          </div>
        </div>

        <div className="grid w-full h-80 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2 ">
          <div className="flex flex-col w-full items-center justify-center rounded-lg border-[3px] border-dashed">
            <Plus className="w-12 h-12 text-muted-foreground/50" />
            <p className="text-muted-foreground font-medium mt-2">
              Apply to launch your project here
            </p>
          </div>
          <div className="flex flex-col w-full items-center justify-center rounded-lg border-[3px] border-dashed">
            <Plus className="w-12 h-12 text-muted-foreground/50" />
            <p className="text-muted-foreground font-medium mt-2">
              Apply to launch your project here
            </p>
          </div>
          <div className="flex flex-col w-full items-center justify-center rounded-lg border-[3px] border-dashed">
            <Plus className="w-12 h-12 text-muted-foreground/50" />
            <p className="text-muted-foreground font-medium mt-2">
              Apply to launch your project here
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
