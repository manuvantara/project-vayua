import { keccak256, toBytes } from 'viem';

export function getStringHash(input: string): `0x${string}` {
  const inputBytes = toBytes(input);
  return keccak256(inputBytes) as `0x${string}`;
}
