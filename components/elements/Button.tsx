// import React from "react";
// import { Spinner } from "../elements/Spinner";
// import { classNames } from "../../shared/helpers/classNamer";

// interface IButtonProps {
//   /* Shows loading spinner */
//   loading?: boolean;
//   /* Makes button disabled */
//   disabled?: boolean;
//   /* Makes button active */
//   active?: boolean;
//   /* The label to show in the button when loading is true */
//   loadingText?: string;
//   /* Set the original html type of button */
//   type?: "button" | "reset" | "submit";
//   /* Adds icon before button label */
//   leftIcon?: React.ReactElement;
//   /* Adds icon after button label */
//   rightIcon?: React.ReactElement;
//   /* Set the button color */
//   colorScheme?: "primary" | "danger";
//   /* Size of the button */
//   size?: "xs" | "sm" | "md" | "lg" | "xl";
//   /** Controls button appearance */
//   variant?: "solid" | "outline";
//   /* React node */
//   children?: React.ReactNode;
// }
// export interface ButtonProps
//   extends React.ButtonHTMLAttributes<HTMLButtonElement>,
//     IButtonProps {}

// const Button = (props: ButtonProps) => {
//   const {
//     disabled,
//     type,
//     active,
//     className,
//     rightIcon,
//     leftIcon,
//     loading,
//     loadingText,
//     children,
//     variant = "solid",
//     size = "md",
//     colorScheme = "primary",
//     ...rest
//   } = props;

//   const colorsMap = {
//     primary: "bg-amber-500 hover:bg-amber-600 disabled:hover:bg-amber-500",
//     danger: "bg-red-600 hover:bg-red-700 disabled:hover:bg-red-600",
//   };

//   const variantMap = {
//     solid: [`border-transparent text-neutral-500`, colorsMap[colorScheme]],
//     outline: [
//       "border-dark-gray-400 dark:text-gray-100",
//       "hover:bg-dark-gray-500/75",
//       "disabled:hover:bg-amber-600 disabled:hover:text-amber-100",
//     ],
//   };

//   const sizeMap = {
//     xs: ["py-1.5 text-xs rounded"],
//     sm: ["py-0.5 px-0.5 rounded-lg text-xs font-semibold"],
//     md: ["p-3 text-sm rounded-lg font-semibold"],
//     lg: [""],
//     xl: [""],
//   };

//   return (
//     <button
//       disabled={disabled || loading}
//       aria-disabled={disabled || loading}
//       type={type}
//       data-active={active ? "true" : undefined}
//       className={classNames(
//         "flex mt-2 w-full items-center justify-center border transition-colors",
//         "disabled:opacity-50 disabled:cursor-not-allowed",
//         ...variantMap[variant],
//         ...sizeMap[size],
//         className
//       )}
//       {...rest}
//     >
//       {leftIcon && !loading ? leftIcon : null}
//       {loading && (
//         <Spinner
//           className={classNames(
//             loadingText ? "relative" : "absolute",
//             loadingText ? `mr-2` : "mr-0"
//           )}
//           size="sm"
//         />
//       )}
//       {loading
//         ? loadingText || <span className="opacity-0">{children}</span>
//         : children}
//       {rightIcon && !loading ? rightIcon : null}
//     </button>
//   );
// };

// export default Button;

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-accent-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /* Shows loading spinner */
  loading?: boolean;
  /* The label to show in the button when loading is true */
  loadingText?: string;
  /* Adds icon before button label */
  leftIcon?: React.ReactElement;
  /* Adds icon after button label */
  rightIcon?: React.ReactElement;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      loadingText,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={props.disabled || loading}
      >
        {leftIcon && !loading ? leftIcon : null}
        {loading && (
          <Spinner
            className={cn(
              loadingText ? "relative" : "absolute",
              loadingText ? `mr-2` : "mr-0"
            )}
            size="sm"
          />
        )}
        {loading
          ? loadingText || <span className="opacity-0">Loading</span>
          : props.children}
        {rightIcon && !loading ? rightIcon : null}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
