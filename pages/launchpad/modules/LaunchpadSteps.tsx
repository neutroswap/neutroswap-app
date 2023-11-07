'use client'

import { Content } from "@/.contentlayer/generated";
import { useLaunchpadPhase } from "@/shared/hooks/useLaunchpadPhase";
import { cn } from "@/shared/utils"
import { CheckIcon, ChevronRight } from "lucide-react"
import React from "react";
import { useMemo } from "react"

export const DEFAULT_LAUNCHPAD_PHASE = ['upcoming', 'whitelist', 'public', 'claim'] as const;
export type LaunchPhase = typeof DEFAULT_LAUNCHPAD_PHASE[number];

type Props = {
  data: Content
}

export default function LaunchpadSteps({ data }: Props) {
  const phase = useLaunchpadPhase(data);

  const currentIndex = DEFAULT_LAUNCHPAD_PHASE.indexOf(phase);

  const listOfPhases = useMemo(() => {
    let stages = [
      { name: 'Upcoming', href: '#', status: 'upcoming' },
      { name: 'Public Stage', href: '#', status: 'upcoming' },
      { name: 'Claim Ready', href: '#', status: 'upcoming' }
    ]
    if (data.whitelistMode) {
      stages = [
        { name: 'Upcoming', href: '#', status: 'upcoming' },
        { name: 'Whitelist Stage', href: '#', status: 'upcoming' },
        { name: 'Public Stage', href: '#', status: 'upcoming' },
        { name: 'Claim Ready', href: '#', status: 'upcoming' }
      ]
    }
    return stages;
  }, [data.whitelistMode])

  const phases = useMemo(() => {
    return listOfPhases.map((item, index) => {
      const offset = DEFAULT_LAUNCHPAD_PHASE.length - listOfPhases.length;
      if (index < currentIndex - offset) return { ...item, status: 'complete' }
      if (index === currentIndex - offset) return { ...item, status: 'current' }
      return { ...item, status: 'upcoming' }
    });
  }, [currentIndex, listOfPhases])

  return (
    <div className={cn(
      "px-8 py-3",
      "relative flex w-full items-center justify-between border rounded-lg bg-white dark:bg-slate-900/50 shadow shadow-slate-200 dark:shadow-black overflow-hidden",
    )}>
      {phases.map((item, index) => (
        <React.Fragment key={item.name}>
          <div className="flex items-center justify-center space-x-2 peer">
            <p
              className={cn(
                item.status === 'complete' && "bg-transparent border border-primary/70 text-primary",
                item.status === 'current' && "bg-primary/80 text-primary-foreground",
                item.status === 'upcoming' && "bg-muted text-muted-foreground",
                "px-1 text-xs font-semibold rounded-full"
              )}
            >
              {item.status === 'complete' && (
                <CheckIcon className="w-2.5 h-[1.125rem] stroke-[4]" />
              )}
              {item.status !== 'complete' && (index + 1)}
            </p>
            <p className={cn(
              item.status === 'complete' && "text-muted-foreground",
              item.status === 'current' && "text-primary dark:text-primary/80",
              item.status === 'upcoming' && "text-muted-foreground",
              "text-xs font-semibold uppercase tracking-wide"
            )}>{item.name}</p>
          </div>
          <ChevronRight className={cn(
            index === phases.length - 1 && "hidden",
            "w-4 h-4 text-muted-foreground"
          )} />
        </React.Fragment>
      ))}
    </div>
  )
}
