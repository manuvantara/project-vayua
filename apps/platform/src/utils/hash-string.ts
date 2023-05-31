import { ethers } from "ethers";

export function getStringHash(input: string) {
  const inputBytes = ethers.utils.toUtf8Bytes(input);
  return ethers.utils.keccak256(inputBytes);
}
