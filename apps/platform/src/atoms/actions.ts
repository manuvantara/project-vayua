import { atom } from 'jotai';

export type Action = {
  action: {
    targetContractABI: any[];
    targetContractAddress: string;
    targetFunctionArguments: { [key: string]: string } | null;
    targetFunctionId: number;
  };
  id: number;
};
export const proposalActionsAtom = atom<Action[]>([]);
