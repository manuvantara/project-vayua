import { atom } from "jotai";

export type Action = {
  id: number;
  action: {
    targetContractAddress: string;
    targetContractABI: any[];
    targetFunctionId: number;
    targetFunctionArguments: { [key: string]: string } | null;
  };
};
export const proposalActionsAtom = atom<Action[]>([]);
