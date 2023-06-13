import { atom } from 'jotai';

type Contract = {
  name: string;
  source: string;
};

export const tokenTypeAtom = atom<'erc20' | 'erc721'>('erc20');

export const tokenContractAtom = atom<Contract>({
  name: '',
  source: '',
});
export const governanceContractAtom = atom<Contract>({
  name: '',
  source: '',
});
