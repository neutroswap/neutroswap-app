'use client'

import { cn } from "@/shared/utils"
import { ClockClockwise, CurrencyDollarSimple, GlobeHemisphereWest, ListPlus, Triangle } from "@phosphor-icons/react"
import { cva } from "class-variance-authority"
import { useLaunchpadPhase } from "@/shared/hooks/useLaunchpadPhase"
import { Content } from "@/.contentlayer/generated"

type Props = {
  data: Content,
  className?: string
}

const phaseTagVariants = cva(
  "max-w-fit flex items-center space-x-1 border rounded-lg px-1.5 py-0.5",
  {
    variants: {
      variant: {
        default: "text-muted-foreground border-border",
        upcoming: "text-yellow-700 dark:text-yellow-500 border-yellow-500/60 dark:border-yellow-300/20 bg-yellow-500/10",
        whitelist: "text-blue-700 dark:text-blue-500 border-blue-500/20 dark:border-blue-300/20 bg-blue-500/10",
        public: "text-blue-700 dark:text-blue-500 border-blue-500/20 dark:border-blue-300/20 bg-blue-500/10",
        claim: "text-emerald-600 dark:text-emerald-500 border-emerald-500/20 dark:border-emerald-300/20 bg-emerald-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const phaseTagIconVariants = {
  default: <Triangle className="h-5" weight="duotone" />,
  upcoming: <ClockClockwise className="h-5" weight="duotone" />,
  whitelist: <ListPlus className="h-5" weight="duotone" />,
  public: <GlobeHemisphereWest className="h-5" weight="duotone" />,
  claim: <CurrencyDollarSimple className="h-5" weight="duotone" />,
}

export default function PhaseTags({ data, className }: Props) {
  const phase = useLaunchpadPhase(data);
  return (
    <div className={cn(phaseTagVariants({
      variant: phase,
      className
    }))}>
      {phaseTagIconVariants[phase]}
      <p className="text-xs font-semibold mt-0.5 uppercase">{phase}</p>
    </div>
  )
}
