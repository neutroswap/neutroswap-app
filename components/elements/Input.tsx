import { classNames } from "@/shared/helpers/classNamer";
import { ForwardRefRenderFunction, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: ForwardRefRenderFunction<HTMLInputElement, InputProps> = ({
  className,
  ...otherProps
}) => {
  return (
    <input
      className={classNames(
        "bg-transparent w-full bg-neutral-50 dark:bg-neutral-900/80 px-2 border border-neutral-200/80 dark:border-transparent py-2 rounded-md placeholder-neutral-400 dark:placeholder-neutral-600 text-sm",
        className
      )}
      {...otherProps}
    />
  );
};

export default Input;
