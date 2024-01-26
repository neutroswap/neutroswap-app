import { classNames } from "@/shared/helpers/classNamer";
import { PropsWithChildren } from "react";

export function Card({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={classNames(
        "rounded border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm dark:shadow-dark-lg shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent(props: PropsWithChildren<{ padding?: boolean }>) {
  const { children, padding = true } = props;
  return (
    <div
      className={classNames(
        "flex flex-col flex-1 gap-8",
        padding && "p-4 sm:p-6"
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={classNames(
        "border-b border-neutral-200 dark:border-neutral-800 p-4 sm:px-6 sm:py-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardFooter(props: PropsWithChildren<{ border?: boolean }>) {
  const { children, border = true } = props;
  return (
    <div
      className={classNames(
        border &&
          "border-t border-neutral-200 dark:border-neutral-800 px-4 py-4 sm:px-6",
        !border && "pt-4 sm:pt-6"
      )}
    >
      {children}
    </div>
  );
}
