import { ethers } from "ethers";

export function getStringHash(input: string): `0x${string}` {
  const inputBytes = ethers.utils.toUtf8Bytes(input);
  return ethers.utils.keccak256(inputBytes) as `0x${string}`;
}
