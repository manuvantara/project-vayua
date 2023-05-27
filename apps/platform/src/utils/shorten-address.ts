import { getAddress } from "viem";

// You can find more helpers here: https://github.com/TrueFiEng/useDApp/blob/master/packages/core/src/helpers/address.ts

/**
 * @private - for internal use only
 **/
export function shortenString(str: string) {
  // If anyone pass something else but with string type, we throw an error to prevent unexpected behavior
  if (typeof str !== "string")
    throw new Error("Invalid input, string required");

  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
}

export function shortenAddress(address: string | `0x${string}`): string {
  try {
    const formattedAddress = getAddress(address);
    return shortenString(formattedAddress);
  } catch {
    throw new Error("Invalid input, address can't be parsed");
  }
}
