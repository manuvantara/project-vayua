import { atom } from 'jotai';

type Contract = {
  name: string;
  source: string;
};

type ContractMap = Map<'governanceContract' | 'tokenContract', Contract>;

export const tokenTypeAtom = atom<'erc20' | 'erc721'>('erc20');

export const tokenContractAtom = atom<Contract>({
  name: '',
  source: '',
});
export const governanceContractAtom = atom<Contract>({
  name: '',
  source: '',
});

export const contractsAtom = atom<ContractMap>((get) => {
  const tokenContract = get(tokenContractAtom);
  const governanceContract = get(governanceContractAtom);
  const contracts = new Map();
  contracts.set('tokenContract', tokenContract);
  contracts.set('governanceContract', governanceContract);
  return contracts;
});
