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
  usePrepareContractWrite,
  usePublicClient,
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
import { GetServerSideProps } from "next";
import ClientOnly from "@/components/ClientOnly";
import { timestampToDate } from "@/utils/timestamp-to-date";

type ProposalStateInstructionsProps = {
  proposalState: string;
  organisationAddress: `0x${string}`;
  proposalId: string;
  voteStart: string;
  isTransactionLoading: boolean;
  isConnected: boolean;
  executeWrite: (() => void) | undefined;
  executeLoading: boolean;
};

function setExecuteWriteArgs(
  targets: `0x${string}` | `0x${string}`[],
  values: string | string[],
  calldatas: `0x${string}` | `0x${string}`[],
  description: string
) {
  const properDescription = getStringHash(description) as `0x${string}`;

  const properTargets = Array.isArray(targets) ? targets : [targets];
  const properValues = Array.isArray(values)
    ? values.map((val) => BigInt(val))
    : [BigInt(values)];
  const properCalldatas = Array.isArray(calldatas) ? calldatas : [calldatas];

  return [
    properTargets,
    properValues,
    properCalldatas,
    properDescription,
  ] as const;
}

function ProposalStateInstructions({
  proposalState,
  organisationAddress,
  proposalId,
  voteStart,
  isTransactionLoading,
  isConnected,
  executeWrite,
  executeLoading,
}: ProposalStateInstructionsProps) {
  switch (proposalState) {
    case "Active":
      return (
        <CastVoteModal
          organisationAddress={organisationAddress}
          proposalId={proposalId}
        />
      );
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
      return (
        <>
          {proposalState == "Succeeded" && (
            <Button
              loading={isTransactionLoading || executeLoading}
              disabled={!executeWrite || !isConnected}
              className="mt-5"
              onClick={executeWrite}
            >
              Execute
            </Button>
          )}
        </>
      );
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

type ProposalPageProps = {
  organisationAddress: `0x${string}`;
  targets: `0x${string}` | `0x${string}`[];
  values: string | string[];
  calldatas: `0x${string}` | `0x${string}`[];
  description: string;
  proposalId: `0x${string}`;
  proposer: `0x${string}`;
  voteStart: string;
};

export default function ProposalPage({
  organisationAddress,
  targets,
  values,
  calldatas,
  description,
  proposalId,
  proposer,
  voteStart,
}: ProposalPageProps) {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [voteDate, setVoteDate] = useState<string>("");
  const [proposalState, setProposalState] = useState("Unknown State");

  const { title, proposalDescription } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(
      description ? (description as string) : ""
    );

  // get votes
  const votesContractRead = useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "proposalVotes",
    args: [proposalId ? BigInt(proposalId) : 0n],
  });

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
    address: organisationAddress,
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

  const isTargetsString = typeof targets === "string";

  // listen to cast vote event and read votes again if event was emitted
  useContractEvent({
    address: organisationAddress,
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

  // get vote start in format of date
  async function blockNumberToTimestamp(stringifiedBlockNumber: string) {
    // convert stringified blockNumber to bigint
    const blockNumber = BigInt(stringifiedBlockNumber);

    // get the block
    const block = await publicClient.getBlock({
      blockNumber: blockNumber,
    });

    // return stringified timestamp
    return block.timestamp.toString();
  }

  useEffect(() => {
    async function getVoteDate() {
      try {
        const timestamp = await blockNumberToTimestamp(voteStart);
        setVoteDate(timestampToDate(timestamp, true));
      } catch (error) {
        console.log(error);
      }
    }

    if (voteStart) {
      getVoteDate();
    }
  }, [voteStart]);

  // execute write to contract
  const { config: executeWriteConfig } = usePrepareContractWrite({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "execute",
    value: isTargetsString
      ? BigInt(values as string)
      : (values as string[])
          .map((val) => BigInt(val))
          .reduce((acc, curr) => acc + curr, BigInt(0)),
    args: setExecuteWriteArgs(targets, values, calldatas, description),
  });

  const executeWrite = useContractWrite(executeWriteConfig);

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
    address: organisationAddress,
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
          href={`/organisations/${organisationAddress}`}
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
            <div className="text-sm mt-2">Vote starts {voteDate}</div>
          </div>
          <div className="flex gap-4 font-bold text-lg text-slate-500">
            <ProposalStateInstructions
              proposalState={proposalState}
              organisationAddress={organisationAddress}
              proposalId={proposalId}
              voteStart={voteStart}
              isTransactionLoading={isTransactionLoading}
              isConnected={isConnected}
              executeWrite={executeWrite.write}
              executeLoading={executeWrite.isLoading}
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
            <ClientOnly>
              <TableBody>
                {votesContractRead.data ? (
                  <TableRow className="text-center">
                    <TableCell>
                      {votesContractRead.data[1].toString()}
                    </TableCell>
                    <TableCell>
                      {votesContractRead.data[0].toString()}
                    </TableCell>
                    <TableCell>
                      {votesContractRead.data[2].toString()}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow className="text-center">
                    <TableCell>n/a</TableCell>
                    <TableCell>n/a</TableCell>
                    <TableCell>n/a</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </ClientOnly>
          </Table>
        </div>
      </div>
    </div>
  );
}

// Using arrow function to infer type
export const getServerSideProps: GetServerSideProps = async ({
  params,
  query,
}) => {
  // Better than useRouter hook because on the client side we will always have the address
  const organisationAddress = params?.organisationAddress as `0x${string}`;
  const proposalId = (params?.proposalId as string) || "";

  const targets = query?.targets
    ? (query?.targets as `0x${string}` | `0x${string}`[])
    : [];

  const values = query?.values ? (query?.values as string | string[]) : [];

  const calldatas = query?.calldatas
    ? (query?.calldatas as `0x${string}` | `0x${string}`[])
    : [];

  const description = (query?.description as `0x${string}`) || "";

  const proposer = (query?.proposer as `0x${string}`) || "";

  const voteStart = (query?.voteStart as string) || "";

  return {
    props: {
      organisationAddress,
      targets,
      values,
      calldatas,
      description,
      proposalId,
      proposer,
      voteStart,
    },
  };
};
