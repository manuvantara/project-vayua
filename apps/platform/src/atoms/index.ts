import { atom } from "jotai";

export const tokenTypeAtom = atom<"erc20" | "erc721">("erc20");

// Fixing compile server error, delete this line in the future and provide a proper export
export default 0;
