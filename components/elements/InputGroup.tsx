import { classNames } from "@/shared/helpers/classNamer";
import { PropsWithChildren } from "react";

interface InputGroupProps {
  prefix?: JSX.Element;
  suffix?: JSX.Element;
  className?: string;
}

export default function InputGroup({
  children,
  prefix,
  suffix,
  className,
}: PropsWithChildren<InputGroupProps>) {
  return (
    <div className={classNames("relative", className)}>
      {prefix && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center z-10">
          {prefix}
        </div>
      )}

      {children}

      {suffix && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          {suffix}
        </div>
      )}
    </div>
  );
}
