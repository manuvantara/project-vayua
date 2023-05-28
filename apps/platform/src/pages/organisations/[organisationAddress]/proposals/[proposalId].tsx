import { useRouter } from "next/router";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ClockIcon, ArrowUpLeft } from "lucide-react";

import ReactMarkdown from "react-markdown";
import { parseMarkdownWithYamlFrontmatter } from "@/utils/parse-proposal-description";

import { useContractRead } from "wagmi";
import { governorAbi } from "@/utils/abi/openzeppelin-contracts";
import { shortenString } from "@/utils/shorten-address";

import CastVoteModal from "@/components/CastVoteModal";

function ProposalStateInstructions({
  proposalState,
  govAddress,
  proposalId,
  voteStart,
}: ProposalStateInstructionsProps) {
  switch (proposalState) {
    case "Active":
      return <CastVoteModal govAddress={govAddress} proposalId={proposalId} />;
    case "Pending":
      return (
        <>
          <ClockIcon className="w-4 h-4 mr-2" />
          Voting starts at {voteStart} block
        </>
      );
    case "Canceled":
      return <>The proposal was canceled by proposer</>;
    case "Defeated":
      return <>The proposal was defeated</>;
    case "Succeeded":
      return <>The proposal succeeded</>;
    case "Queued":
      return <>The proposal is queued</>;
    case "Expired":
      return <>The proposal expired</>;
    case "Executed":
      return <>The proposal was executed</>;
    default:
      return <>Unknown state instructions</>;
  }
}

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

  // get proposal vote start
  const voteStart = router.query.voteStart
    ? (router.query.voteStart as string)
    : "";

  // get targets and values
  const targets = router.query.targets ? router.query.targets : [];
  const values = router.query.values ? router.query.values : [];
  const isTargetsString = typeof targets === "string";
  const isValuesString = typeof values === "string";

  return (
    <div>
      <div className="flex flex-col p-6 bg-white rounded-md border border-border mt-5">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold mt-1">
            <Link
              href={{
                pathname: `/organisations/${govAddress}`,
              }}
            >
              <div className="flex items-center">
                <ArrowUpLeft className="w-10 h-10 mr-2" />
                DAO
              </div>

              <div className="text-sm mt-2">
                <span className="font-medium">{govAddress}</span>
              </div>
            </Link>
          </h2>
        </div>
      </div>
      <div className="flex flex-col p-6 bg-white rounded-md border border-border mt-5">
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
            <ProposalStateInstructions
              proposalState={proposalState}
              govAddress={govAddress}
              proposalId={proposalId}
              voteStart={voteStart}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 items-start mt-5 md:gap-5 md:grid-cols-3">
        <div className="flex flex-col p-6 bg-white rounded-md border border-border md:col-span-2">
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
            <TabsContent value="code">
              {isTargetsString && isValuesString ? (
                <div>
                  <h3>Function 1:</h3>
                  <p>
                    Target:
                    <br />
                    {targets}
                  </p>
                  <p>
                    Value:
                    <br />
                    {values}
                  </p>
                </div>
              ) : (
                Array.isArray(targets) &&
                Array.isArray(values) &&
                targets.length !== 0 && (
                  <div>
                    {targets.map((target, index) => (
                      <div key={index}>
                        <h3>Function {index + 1}:</h3>
                        <p>
                          Target:
                          <br />
                          {target}
                        </p>
                        <p>
                          Value:
                          <br />
                          {values[index]}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col p-6 bg-white rounded-md border border-border md:col-span-1">
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
