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
