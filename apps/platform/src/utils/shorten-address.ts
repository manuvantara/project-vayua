import { getAddress } from "viem";

// You can find more helpers here: https://github.com/TrueFiEng/useDApp/blob/master/packages/core/src/helpers/address.ts

// /**
//  * @private - for internal use only
//  **/
export function shortenText(text: string, prefixLength: number = 8, suffixLength: number = 8, delimiter: string = "...") {
  // If anyone pass something else but with string type, we throw an error to prevent unexpected behavior
  
  // // TODO: ...
  // if (text.length === 0) {
  //   return text;
  // }

  // if (text.length === 1) {
  //   "...4"
  //   "1234" -> "1..."
  //   "12345" -> "1...5"
  // }

  return text.substring(0, prefixLength) + delimiter + text.substring(text.length - suffixLength);
}

// TODO: what's the point of having string or 0xstring?
export function shortenAddress(text: string, prefixLength: number = 8, suffixLength: number = 8, delimiter: string = "..."): string {
  const address = getAddress(text);

  return shortenText(address, prefixLength, suffixLength, delimiter);
}
