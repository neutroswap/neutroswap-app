import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";

export const parseBigNumber = (value?: string, decimal?: number): BigNumber => {
  const parsedValue = (!!value && !!Number(value)) ? value : "0"
  return parseUnits(parsedValue, decimal ?? 18);
}
