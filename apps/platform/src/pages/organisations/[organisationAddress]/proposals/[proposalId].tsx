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
  // const { data, isError, isLoading } = useContractReads({
  //     contracts: [
  //         {

  const { title, proposalDescription } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(PROPOSAL_DESCRIPTION);

  return (
    <div className="pt-20">
      <div className="flex flex-col p-6 shadow-lg rounded-md border border-border">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <div>
            <div>
              <Badge variant="warning">{MOCK_STATUS}</Badge>
              <h1 className="text-xl md:text-2xl font-semibold mt-1">
                {title || `Proposal #${PROPOSAL_ID}`}
              </h1>
            </div>
            <div className="text-sm mt-2">
              by <span className="font-medium">0x1234...5678</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {MOCK_STATUS === "PENDING" ? (
              <div className="text-sm flex items-center font-medium text-muted-foreground">
                <ClockIcon className="w-4 h-4 mr-2" />
                Voting starts in 2 days
              </div>
            ) : (
              <Button>Vote</Button>
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
              <TableRow className="text-center">
                <TableCell>100</TableCell>
                <TableCell>40</TableCell>
                <TableCell>10</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
