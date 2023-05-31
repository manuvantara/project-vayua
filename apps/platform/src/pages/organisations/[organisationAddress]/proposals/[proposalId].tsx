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
import { ArrowLeft, ClockIcon } from "lucide-react";

import ReactMarkdown from "react-markdown";
import { parseMarkdownWithYamlFrontmatter } from "@/utils/parse-proposal-description";

import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { shortenAddress, shortenString } from "@/utils/shorten-address";

import CastVoteModal from "@/components/CastVoteModal";
import { MarkdownFrontmatter } from "@/types/proposals";
import { Button } from "@/components/ui/Button";
import { getStringHash } from "@/utils/hash-string";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

type ProposalStateInstructionsProps = {
  proposalState: string;
  govAddress: `0x${string}`;
  proposalId: string;
  voteStart: string;
};

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
      return <>Proposal canceled by proposer</>;
    case "Defeated":
      return <>Proposal defeated</>;
    case "Succeeded":
      return <>Proposal succeeded</>;
    case "Queued":
      return <>Proposal queued</>;
    case "Expired":
      return <>Proposal expired</>;
    case "Executed":
      return <>Proposal executed</>;
    default:
      return <>Unknown state instructions</>;
  }
}

export default function ProposalPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [proposalState, setProposalState] = useState("Unknown State");

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
  const votesContractRead = useContractRead({
    address: govAddress,
    abi: GOVERNOR_ABI,
    functionName: "proposalVotes",
    args: [proposalId ? BigInt(proposalId) : 0n],
  });

  // get proposer
  const proposer = router.query.proposer as `0x${string}`;

  // get proposal state
  const proposalStateMap: Record<number, string> = {
    0: "Pending",
    1: "Active",
    2: "Canceled",
    3: "Defeated",
    4: "Succeeded",
    5: "Queued",
    6: "Expired",
    7: "Executed",
  };

  const proposalStateRead = useContractRead({
    address: govAddress,
    abi: GOVERNOR_ABI,
    functionName: "state",
    args: [proposalId ? BigInt(proposalId) : 0n],
    onSettled(data) {
      setProposalState(proposalStateMap[data ? data : -1] || "Unknown State");
    },
  });

  const badgeVariantMap: Record<
    string,
    "success" | "warning" | "destructive" | "default" | "secondary"
  > = {
    Pending: "warning",
    Active: "success",
    Canceled: "destructive",
    Defeated: "destructive",
    Succeeded: "success",
    Queued: "success",
    Expired: "destructive",
    Executed: "success",
  };

  // get proposal vote start
  const voteStart = router.query.voteStart
    ? (router.query.voteStart as string)
    : "";

  // get targets, values and calldatas
  const targets = router.query.targets ? router.query.targets : [];
  const values = router.query.values ? router.query.values : [];
  const calldatas = router.query.calldatas ? router.query.calldatas : [];

  const isTargetsString = typeof targets === "string";

  // listen to cast vote event and read votes again if event was emitted
  useContractEvent({
    address: govAddress,
    abi: GOVERNOR_ABI,
    eventName: "VoteCast",
    listener(logs) {
      if (logs) {
        logs.map((log: any) => {
          const { args } = log;
          if (args.proposalId.toString() == proposalId) {
            votesContractRead.refetch();
          }
        });
      }
    },
  });

  // execute write to contract
  const executeWrite = useContractWrite({
    address: govAddress,
    abi: GOVERNOR_ABI,
    functionName: "execute",
    value: BigInt(values as string),
  });

  const {
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccessful,
  } = useWaitForTransaction({
    hash: executeWrite.data?.hash,
  });

  useEffect(() => {
    if (isTransactionSuccessful) {
      toast({
        description: "Execute action successfully applied.",
      });
    }
  }, [isTransactionSuccessful]);

  useContractEvent({
    address: govAddress,
    abi: GOVERNOR_ABI,
    eventName: "ProposalExecuted",
    listener(logs) {
      if (logs) {
        logs.map((log: any) => {
          const { args } = log;
          if (args.proposalId.toString() == proposalId) {
            proposalStateRead.refetch();
          }
        });
      }
    },
  });

  return (
    <div>
      <div>
        <Link
          className="inline-flex items-center text-muted-foreground"
          href={`/organisations/${govAddress}`}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
      </div>
      <div className="flex flex-col p-6 bg-white rounded-md border border-border mt-5">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
          <div>
            <div>
              <Badge variant={badgeVariantMap[proposalState]}>
                {proposalState}
              </Badge>
              <h1 className="text-xl md:text-2xl font-semibold mt-1">
                {title ||
                  `Proposal #${shortenString(proposalId ? proposalId : "")}`}
              </h1>
            </div>
            <div className="text-sm mt-2">
              by
              <Link
                href={`https://testnet-explorer.thetatoken.org/account/${proposer}`}
                target="_blank"
                className="border-b border-[#999] border-dashed"
              >
                {" "}
                {proposer ? shortenAddress(proposer) : null}
              </Link>
            </div>
          </div>
          <div className="flex gap-4 font-bold text-lg text-slate-500">
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
              <article className="prose-sm sm:prose p-5">
                <ReactMarkdown>{proposalDescription}</ReactMarkdown>
              </article>
            </TabsContent>
            <TabsContent value="code">
              {isTargetsString ? (
                <div className="p-5">
                  <h3 className="mb-2">Function 1:</h3>
                  <div className="border border-border p-5">
                    <div>
                      Calldatas: <br />
                      {calldatas ? shortenString(calldatas as string) : null}
                    </div>
                    <div className="mt-2">
                      Target: <br />
                      <Link
                        href={`https://testnet-explorer.thetatoken.org/account/${targets}`}
                        target="_blank"
                        className="border-b border-[#999] border-dashed"
                      >
                        {targets ? shortenAddress(targets) : null}
                      </Link>
                    </div>
                    <div className="mt-2">
                      Value: <br />
                      {values}
                    </div>
                    {proposalState == "Succeeded" && (
                      <Button
                        loading={isTransactionLoading || executeWrite.isLoading}
                        disabled={!executeWrite.write || !isConnected}
                        className="mt-5"
                        onClick={() =>
                          executeWrite.write({
                            args: [
                              [targets as `0x${string}`],
                              [BigInt(values as string)],
                              [calldatas as `0x${string}`],
                              getStringHash(
                                proposalDescription
                              ) as `0x${string}`,
                            ],
                          })
                        }
                      >
                        Execute
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                Array.isArray(targets) &&
                targets.length !== 0 && (
                  <div>
                    {targets.map((target, index) => (
                      <div key={index} className="p-5">
                        <h3 className="mb-2">Function {index + 1}:</h3>
                        <div className="border border-border p-5">
                          <div>
                            Calldatas: <br />
                            {calldatas[index]
                              ? shortenString(calldatas[index] as string)
                              : null}
                          </div>
                          <div className="mt-2">
                            Target: <br />
                            <Link
                              href={`https://testnet-explorer.thetatoken.org/account/${target}`}
                              target="_blank"
                              className="border-b border-[#999] border-dashed"
                            >
                              {target ? shortenAddress(target) : null}
                            </Link>
                          </div>
                          <div className="mt-2">
                            Value: <br />
                            {values[index]}
                          </div>
                        </div>
                        {proposalState == "Succeeded" && (
                          <Button
                            loading={
                              isTransactionLoading || executeWrite.isLoading
                            }
                            disabled={!executeWrite.write || !isConnected}
                            className="mt-5"
                            onClick={() =>
                              executeWrite.write({
                                args: [
                                  [target as `0x${string}`],
                                  [BigInt(values[index] as string)],
                                  [calldatas[index] as `0x${string}`],
                                  getStringHash(
                                    proposalDescription
                                  ) as `0x${string}`,
                                ],
                              })
                            }
                          >
                            Execute
                          </Button>
                        )}
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
                <TableHead className="text-center text-success">For</TableHead>
                <TableHead className="text-center text-destructive">
                  Against
                </TableHead>
                <TableHead className="text-center">Abstain</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {votesContractRead.data ? (
                <TableRow className="text-center">
                  <TableCell>{votesContractRead.data[1].toString()}</TableCell>
                  <TableCell>{votesContractRead.data[0].toString()}</TableCell>
                  <TableCell>{votesContractRead.data[2].toString()}</TableCell>
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
