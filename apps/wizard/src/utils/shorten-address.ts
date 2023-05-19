import { getAddress } from "viem";

// You can find more helpers here: https://github.com/TrueFiEng/useDApp/blob/master/packages/core/src/helpers/address.ts

/**
 * @private - for internal use only
 **/
export function shortenString(str: string) {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
}

export function shortenAddress(address: string): string {
  try {
    const formattedAddress = getAddress(address);
    return shortenString(formattedAddress);
  } catch {
    throw new Error("Invalid input, address can't be parsed");
  }
}
