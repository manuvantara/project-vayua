import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ClockIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import ReactMarkdown from "react-markdown";
import { parseMarkdownWithYamlFrontmatter } from "@/utils/parse-proposal-description";
import { useRouter } from "next/router";
import { useContractRead, useContractReads } from "wagmi";
import { governorAbi } from "@/utils/abi/openzeppelin-contracts";
import { useEffect } from "react";
import { shortenString } from "@/utils/shorten-address";
import Link from "next/link";
import CastVoteModal from "@/components/CastVoteModal";

const PROPOSAL_ID = "4";

const PROPOSAL_TITLE = "Proposal title";
const PROPOSAL_DESCRIPTION = `
---
title: Refill voteRefund balance
---

## Proposal Description

This proposal aims to implement the following changes:

- Update ContractA and ContractB with new functionalities.
- Transfer funds from the sender to ContractC.
- Call a method in ContractD with specific parameters.

### Targets

- ContractA
- ContractB
- ContractC
- ContractD

### Values

- ContractA: 100 tokens
- ContractB: 200 tokens
- ContractC: 500 tokens
- ContractD: 250 tokens

### Signatures

- ContractA: \`methodA(uint256)\`
- ContractB: \`methodB(uint256)\`
- ContractC: \`methodC(uint256)\`
- ContractD: \`methodD(uint256)\`

### Calldatas

- ContractA: \`123\`
- ContractB: \`456\`
- ContractC: \`789\`
- ContractD: \`101\`

### Timing

- Start Block: 1000
- End Block: 2000

This proposal is currently in the **Pending** state.
`;

const daoContract = {
  address: "...",
  abi: "...",
};

const MOCK_STATUS = "PENDING";

type MarkdownFrontmatter = {
  title?: string;
};

export default function ProposalPage() {
  const router = useRouter();

  // get the governance contract address from route
  const govAddress = router.query.organisationAddress as `0x${string}`;

  // get proposal id
  const proposalId = router.query.proposalId as string;

  // get description and title
  const { description } = router.query;
  const { title, proposalDescription } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(
      description ? (description as string) : ""
    );

  // get votes
  const { data: votes } = useContractRead({
    address: govAddress,
    abi: governorAbi,
    functionName: "proposalVotes",
    args: [proposalId ? BigInt(proposalId) : 0n],
  });

  // get proposer
  const proposer = router.query.proposer as `0x${string}`;

  // get proposal state
  const { data: state } = useContractRead({
    address: govAddress,
    abi: governorAbi,
    functionName: "state",
    args: [proposalId ? BigInt(proposalId) : 0n],
  });

  const proposalStateMap: ProposalState = {
    0: "Pending",
    1: "Active",
    2: "Canceled",
    3: "Defeated",
    4: "Succeeded",
    5: "Queued",
    6: "Expired",
    7: "Executed",
  };

  const proposalState = proposalStateMap[state ? state : -1] || "Unknown State";

  return (
    <div className="pt-20">
      <div className="flex flex-col p-6 shadow-lg rounded-md border border-border">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <h2 className="text-xl md:text-1xl font-semibold mt-1">
            <Link
              href={{
                pathname: `/organisations/${govAddress}`,
              }}
            >
              DAO {govAddress}
            </Link>
          </h2>
        </div>
      </div>
      <div className="flex flex-col p-6 shadow-lg rounded-md border border-border">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <div>
            <div>
              <Badge variant="warning" className="text-black">
                {proposalState}
              </Badge>
              <h1 className="text-xl md:text-2xl font-semibold mt-1">
                {title ||
                  `Proposal #${shortenString(proposalId ? proposalId : "")}`}
              </h1>
            </div>
            <div className="text-sm mt-2">
              by <span className="font-medium">{proposer}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {proposalState == "Active" ? (
              <div className="text-sm flex items-center font-medium text-muted-foreground">
                {/* <ClockIcon className="w-4 h-4 mr-2" />
                Voting starts in 2 days */}
                ...
              </div>
            ) : (
              <CastVoteModal govAddress={govAddress} proposalId={proposalId} />
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-6 mt-8 md:gap-4 md:mt-10">
        <div className="flex flex-col md:col-span-2 p-6 shadow-lg rounded-md border border-border">
          <h3 className="text-xl mb-2 font-semibold">Details</h3>
          <Tabs defaultValue="description" className="">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="code">Executable code</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <article className="prose-sm sm:prose mt-4">
                <ReactMarkdown>{proposalDescription}</ReactMarkdown>
              </article>
            </TabsContent>
            <TabsContent value="code">Code goes here</TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col p-6 md:col-span-1 shadow-lg rounded-md border border-border">
          <h3 className="text-xl mb-2 font-semibold">Votes</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-green-600">
                  For
                </TableHead>
                <TableHead className="text-center text-destructive">
                  Against
                </TableHead>
                <TableHead className="text-center">Abstain</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {votes ? (
                <TableRow className="text-center">
                  <TableCell>{votes[0].toString()}</TableCell>
                  <TableCell>{votes[1].toString()}</TableCell>
                  <TableCell>{votes[2].toString()}</TableCell>
                </TableRow>
              ) : (
                <TableRow className="text-center">
                  <TableCell>n/a</TableCell>
                  <TableCell>n/a</TableCell>
                  <TableCell>n/a</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
