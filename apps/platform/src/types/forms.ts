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
  votingDelay: string;
  votingPeriod: string;
  proposalThreshold: string;
  quorum: number;
};

export type CreateDAOFormValues = {
  name: string;
  desc: string;
};
