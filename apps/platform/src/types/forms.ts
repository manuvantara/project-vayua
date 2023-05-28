export type DelegateVoteFormValues = {
  delegatee: `0x${string}`;
};

export type ProfileSettingsFormValues = {
  name: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  extra: string;
};

export type TokenFormValues = {
  tokenType: "erc20" | "erc721";
  tokenName: string;
  tokenSymbol: string;
  mintNewTokens: boolean;
  premintAmount: string;
  // Only for ERC721
  baseURI: string;
};

export type GovernanceFormValues = {
  name: string;
  votingDelay: {
    number: number;
    timeInterval: string;
  };
  votingPeriod: {
    number: number;
    timeInterval: string;
  };
  proposalThreshold: string;
  quorum: number;
};

export type CreateDAOFormValues = {
  name: string;
  desc: string;
};
