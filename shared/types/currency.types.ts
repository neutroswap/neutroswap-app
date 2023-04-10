import { BigNumber } from "ethers"

export type Currency = {
  /* For tokens with weird decimals like USDC */
  decimal: number,
  /* Return currency in BigNumber format */
  raw: BigNumber,
  /* Display currency in 2 decimal place */
  formatted: string
}
