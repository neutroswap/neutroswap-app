"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { classNames } from "@/shared/helpers/classNamer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip";

const callAll =
  (...fns: any) =>
  (...args: any) =>
    fns.forEach((fn: any) => fn && fn(...args));

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { defaultValue = [33] } = props;

  const [value, setValue] = React.useState<number[]>(defaultValue);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (props.value) setValue(props.value);
  }, [props.value]);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={classNames(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
      onValueChange={callAll(
        (value: any) => setValue(value),
        props.onValueChange
      )}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-900">
        <SliderPrimitive.Range className="absolute h-full bg-primary dark:bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={classNames(
          "block h-3 w-3 rounded-full hover:scale-125 transition-all",
          "bg-primary dark:bg-primary",
          "disabled:pointer-events-none disabled:opacity-50",
          "border-1.5 border-neutral-400 dark:border-neutral-800",
          "focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-offset-2 dark:focus:ring-neutral-500 dark:focus:ring-offset-neutral-900"
        )}
      />
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
