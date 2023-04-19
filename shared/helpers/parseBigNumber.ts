import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils.js";

export const parseBigNumber = (value?: string): BigNumber => {
  const parsedValue = (!!value && !!Number(value)) ? value : "0"
  return parseEther(parsedValue);
}