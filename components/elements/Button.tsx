import React from "react";
import { Spinner } from "../elements/Spinner";
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

const Button = (props: ButtonProps) => {
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
    primary: "bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600",
    danger: "bg-red-600 hover:bg-red-700 disabled:hover:bg-red-600",
  };

  const variantMap = {
    solid: [`border-transparent text-gray-50`, colorsMap[colorScheme]],
    outline: [
      "border-dark-gray-400 text-gray-100",
      "hover:bg-dark-gray-500/75",
      "disabled:hover:bg-blue-600",
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
        "flex w-full items-center justify-center border transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        ...variantMap[variant],
        ...sizeMap[size],
        className
      )}
      {...rest}
    >
      {leftIcon && !loading ? leftIcon : null}
      {loading && (
        <Spinner
          className={classNames(
            loadingText ? "relative" : "absolute",
            loadingText ? `mr-2` : "mr-0"
          )}
          size="sm"
        />
      )}
      {loading
        ? loadingText || <span className="opacity-0">{children}</span>
        : children}
      {rightIcon && !loading ? rightIcon : null}
    </button>
  );
};

export default Button;
