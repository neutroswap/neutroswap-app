"use client";

import {
  ArrowSquareOut,
  Book,
  ChartDonut,
  ChartPieSlice,
  Dna,
  Icon,
  Lightning,
  SealCheck,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils";
import React from "react";
import { BadgePercent, Waves } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

const poolRoutes: {
  title: string;
  href: string;
  icon: Icon;
  description: string;
  hidden?: boolean;
}[] = [
  {
    title: "All Positions",
    href: "/positions",
    icon: ChartDonut,
    description: "Manage all staking positions",
  },
  {
    title: "Liquidity Pools",
    href: "/pool",
    icon: Waves,
    description: "List of available pool in NEUTRO ecosystem",
  },
];

const xNEUTRORoutes: {
  title: string;
  href: string;
  icon: Icon;
  description: string;
  hidden?: boolean;
}[] = [
  {
    title: "All Allocations",
    href: "/xneutro",
    icon: ChartPieSlice,
    description: "Manage all xNEUTRO allocations",
  },
  {
    title: "Earn Dividends",
    href: "/dividend",
    icon: BadgePercent,
    description:
      "Earn dividends from protocol earnings by allocating your xNEUTRO",
  },
  {
    title: "Get Whitelisted on Launchpad",
    href: "/launchpad",
    icon: SealCheck,
    description:
      "Get perks and benefits from every project on NEUTRO's launchpad",
    hidden: true,
  },
  {
    title: "Boost Staking Yield",
    href: "/yieldbooster",
    icon: Lightning,
    description:
      "Boost your staking yield up to 100% by adding xNEUTRO to any incentivized pool",
  },
];

export function Navigation() {
  return (
    <NavigationMenu delayDuration={0} className="hidden sm:flex">
      <NavigationMenuList className="flex items-center space-x-4 mt-4">
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(navigationMenuTriggerStyle())}
            href="/"
          >
            <span>Swap</span>
          </NavigationMenuLink>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Pool</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px]">
              {poolRoutes.map((route) => (
                <ListItem
                  key={route.title}
                  title={route.title}
                  href={route.href}
                  icon={route.icon}
                  className={route.hidden ? "hidden" : ""}
                >
                  {route.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(navigationMenuTriggerStyle())}
            href="/farm"
          >
            <span>Farm V1</span>
          </NavigationMenuLink>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(navigationMenuTriggerStyle())}
            href="/vault"
          >
            <span>Vault</span>
          </NavigationMenuLink>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>xNEUTRO</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px]">
              {xNEUTRORoutes.map((route) => (
                <ListItem
                  key={route.title}
                  title={route.title}
                  href={route.href}
                  icon={route.icon}
                  className={route.hidden ? "hidden" : ""}
                >
                  {route.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(navigationMenuTriggerStyle())}
            href="https://analytics.neutroswap.io/"
            target="_blank"
          >
            <span>Analytics</span>
          </NavigationMenuLink>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(navigationMenuTriggerStyle())}
            href="/launchpad"
          >
            <span>Launchpad</span>
          </NavigationMenuLink>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon: Icon }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li className={className}>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 text-accent-foreground hover:text-primary rounded-md py-4 px-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 focus:bg-accent focus:text-accent-foreground group"
          )}
          {...props}
        >
          <div className="flex items-center space-x-4">
            <Icon
              className="min-w-[1.75rem] min-h-[1.75rem] stroke-1 text-muted-foreground/75 group-hover:text-primary"
              weight="light"
            />
            <div>
              <div className="text-sm font-semibold leading-none tracking-tight uppercase">
                {title}
              </div>
              <span className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                {children}
              </span>
            </div>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
