export enum ProposalState {
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Executed = 7,
  Expired = 6,
  Pending = 0,
  Queued = 5,
  Succeeded = 4,
}

export type MarkdownFrontmatter = {
  title?: string;
};

export type Proposal = {
  calldatas: `0x${string}` | `0x${string}`[];
  description: string;
  proposalId: `0x${string}`;
  proposer: `0x${string}`;
  signatures: string | string[];
  targets: `0x${string}` | `0x${string}`[];
  values: string | string[];
  voteEnd: string;
  voteStart: string;
};
