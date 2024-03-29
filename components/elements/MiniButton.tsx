import React from "react";
import { classNames } from "../../shared/helpers/classNamer";

interface IButtonProps {
  /* Shows loading spinner */
  loading?: boolean;
  /* Makes button disabled */
  disabled?: boolean;
  /* Makes button active */
  active?: boolean;
  /* The label to show in the button when loading is true */
  loadingText?: string;
  /* Set the original html type of button */
  type?: "button" | "reset" | "submit";
  /* Adds icon before button label */
  leftIcon?: React.ReactElement;
  /* Adds icon after button label */
  rightIcon?: React.ReactElement;
  /* Set the button color */
  colorScheme?: "primary" | "danger";
  /* Size of the button */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Controls button appearance */
  variant?: "solid" | "outline";
  /* React node */
  children?: React.ReactNode;
}
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    IButtonProps {}

const MiniButton = (props: ButtonProps) => {
  const {
    disabled,
    type,
    active,
    className,
    rightIcon,
    leftIcon,
    loading,
    loadingText,
    children,
    variant = "solid",
    size = "md",
    colorScheme = "primary",
    ...rest
  } = props;

  const colorsMap = {
    primary: "bg-gray-800 hover:bg-gray-900 disabled:hover:bg-gray-800",
    danger: "bg-red-600 hover:bg-red-700 disabled:hover:bg-red-600",
  };

  const variantMap = {
    solid: [`border-transparent text-neutral-500`, colorsMap[colorScheme]],
    outline: [
      "border-dark-gray-400 dark:text-gray-100",
      "hover:bg-dark-gray-500/75",
      "disabled:hover:bg-amber-600 disabled:hover:text-amber-100",
    ],
  };

  const sizeMap = {
    xs: ["py-1.5 text-xs rounded"],
    sm: ["py-0.5 px-0.5 rounded-lg text-xs font-semibold"],
    md: ["p-3 text-sm rounded-lg font-semibold"],
    lg: [""],
    xl: [""],
  };

  return (
    <button
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      type={type}
      data-active={active ? "true" : undefined}
      className={classNames(
        "flex mt-2 w-16 h-16 items-center justify-center border transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        ...variantMap[variant],
        ...sizeMap[size],
        className
      )}
      {...rest}
    >
      <span className="flex items-center justify-center">
        {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
        {children}
      </span>
    </button>
  );
};

export default MiniButton;
