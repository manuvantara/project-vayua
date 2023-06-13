export type DelegateVoteFormValues = {
  delegatee: `0x${string}`;
};

export type SettingsFormValues = {
  avatar: string;
  bio: string;
  location: string;
  name: string;
  website: string;
};

export type TokenFormValues = {
  // Only for ERC721
  baseURI: string;
  mintNewTokens: boolean;
  premintAmount: number | string;
  tokenName: string;
  tokenSymbol: string;
  tokenType: 'erc20' | 'erc721';
};

export type GovernanceFormValues = {
  name: string;
  proposalThreshold: string;
  quorum: number;
  votingDelay: {
    number: number;
    timeInterval: string;
  };
  votingPeriod: {
    number: number;
    timeInterval: string;
  };
};

export type CreateDAOFormValues = {
  desc: string;
  name: string;
};

export type SearchDAOFormValues = {
  address: string;
};
