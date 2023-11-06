export type Currency = {
  /* For tokens with weird decimals like USDC */
  decimal: number;
  /* Return currency in BigNumber format */
  raw: bigint;
  /* Display currency in 2 decimal place */
  formatted: string;
};
