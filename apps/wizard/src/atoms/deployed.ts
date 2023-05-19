import { atom } from "jotai";

type DeployedAddress = `0x${string}`;

export const deployedTokenAddressAtom = atom<DeployedAddress | null>(null);
export const deployedGovernorAddressAtom = atom<DeployedAddress | null>(null);
