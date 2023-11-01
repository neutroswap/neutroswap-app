import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const DEFAULT_DECIMAL = 2;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateAddress = (address: string, digit: number) => {
  return address.slice(0, digit + 2) + "••••" + address.slice(42 - digit, 42);
};

export const currencyFormat = (
  value: number,
  decimal?: number,
  min?: number
) => {
  if (min && value < min && value !== 0) return `< ${min}`;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: min ?? 2,
    maximumFractionDigits: decimal && value ? decimal : DEFAULT_DECIMAL,
  }).format(value);
};

export const currencyCompactFormat = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
};
