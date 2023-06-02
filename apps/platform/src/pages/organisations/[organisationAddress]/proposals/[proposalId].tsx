import type { GetServerSideProps } from "next";
import type { MarkdownFrontmatter } from "@/types/proposals";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ArrowLeft, CalendarOff, Check, ClockIcon, Vote } from "lucide-react";

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
import { shortenAddress, shortenText } from "@/utils/shorten-address";
import { Button } from "@/components/ui/Button";
import { getStringHash } from "@/utils/hash-string";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { timestampToDate } from "@/utils/timestamp-to-date";
import CastVoteModal from "@/components/CastVoteModal";
import Image from "next/image";
import { Progress } from "@/components/ui/Progress";
import { badgeVariantMap, proposalStateMap } from "@/utils/proposal-states";

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
    case "Succeeded":
      return (
        <Button
          loading={isTransactionLoading || executeLoading}
          disabled={!executeWrite || !isConnected}
          className="mt-5"
          onClick={executeWrite}
        >
          Execute
        </Button>
      );
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
  voteEnd: string;
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
  voteEnd,
}: ProposalPageProps) {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [voteDate, setVoteDate] = useState("");
  const [voteEndDate, setVoteEndDate] = useState("");
  const [proposalState, setProposalState] = useState("Unknown State");

  const { title, proposalDescription } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(description);

  // get votes
  const votesContractRead = useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "proposalVotes",
    args: [proposalId ? BigInt(proposalId) : 0n],
  });

  const proposalStateRead = useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "state",
    args: [proposalId ? BigInt(proposalId) : 0n],
    onSettled(data) {
      setProposalState(proposalStateMap[data ? data : -1] || "Unknown State");
    },
  });

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
    async function getVoteDate(voteBlockNumber: string) {
      try {
        const timestamp = await blockNumberToTimestamp(voteBlockNumber);
        return timestampToDate(timestamp, true);
      } catch (error) {
        console.log(error);
        return "Unknown Date";
      }
    }

    if (voteStart) {
      getVoteDate(voteStart).then((date) => setVoteDate(date));
    }

    if (voteEnd) {
      getVoteDate(voteEnd).then((date) => setVoteEndDate(date));
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

  const renderProposalState = useCallback(() => {
    switch (proposalState) {
      case "Pending":
        return (
          <>
            <ClockIcon className="w-4 h-4 mr-2" />
            Voting starts at {voteStart} block
          </>
        );
      case "Active":
        return (
          <CastVoteModal
            organisationAddress={organisationAddress}
            proposalId={proposalId}
          />
        );
      case "Succeeded":
        return (
          <Button
            loading={isTransactionLoading || executeWrite.isLoading}
            disabled={!executeWrite || !isConnected}
            className="mt-5"
            onClick={executeWrite.write}
          >
            Execute
          </Button>
        );
    }
  }, [proposalState, voteStart, organisationAddress, proposalId, isTransactionLoading, executeWrite, isConnected]);

  return (
    <div className="relative">
      <Image
        fill
        src="/gradient-2.jpg"
        className="absolute left-1/2 z-[-1] top-0 max-w-none opacity-20 -translate-y-1/4 translate-x-[-30%] w-[160%] h-auto filter blur-[100px]"
        alt="gradient"
      />
      <div>
        <Link
          className="inline-flex items-center text-muted-foreground"
          href={`/organisations/${organisationAddress}`}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
      </div>
      <div className="grid items-start grid-cols-3 gap-6 mt-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex relative flex-col p-6 bg-white rounded-md border">
            <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
              <div>
                <Badge
                  className="absolute -top-3 left-0"
                  variant={badgeVariantMap[proposalState]}
                >
                  {proposalState}
                </Badge>
                <h1 className="text-xl font-semibold">
                  {title || `Proposal #${shortenText(proposalId)}`}
                </h1>
              </div>
              <div className="flex gap-4 font-medium text-destructive">
                {renderProposalState()}
              </div>
            </div>
            <div className="flex justify-between flex-2 w-full">
              <div className="text-sm mt-2 space-x-1">
                <span>by</span>
                <Link
                  href={`https://testnet-explorer.thetatoken.org/account/${proposer}`}
                  target="_blank"
                  className="border-b border-[#999] border-dashed"
                >
                  {shortenAddress(proposer)}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-6 bg-white rounded-md border border-border">
            <h3 className="text-xl mb-2 font-semibold">Votes</h3>
            <div className="flex flex-col gap-4">
              <div>
                <span>
                  {/*https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn*/}
                  {Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                    compactDisplay: "short",
                  }).format(Number(votesContractRead.data?.[1] ?? 0))}
                </span>
                <Progress
                  indicatorClassName="bg-success"
                  value={Number(votesContractRead.data?.[1] ?? 0)}
                />
              </div>
              <div>
                <span>
                  {/*https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn*/}
                  {Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                    compactDisplay: "short",
                  }).format(Number(votesContractRead.data?.[0] ?? 0))}
                </span>
                <Progress
                  indicatorClassName="bg-destructive"
                  value={Number(votesContractRead.data?.[0] ?? 0)}
                />
              </div>
              <div>
                <span>
                  {/*https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn*/}
                  {Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                    compactDisplay: "short",
                  }).format(Number(votesContractRead.data?.[2] ?? 0))}
                </span>
                <Progress value={Number(votesContractRead.data?.[2] ?? 0)} />
              </div>
            </div>
          </div>
          <div className="flex flex-col p-6 bg-white rounded-md border border-border">
            <h3 className="text-xl mb-2 font-semibold">Status</h3>
            <div className="flex gap-4">
              <div className="flex flex-col w-min">
                <span className="w-3 h-3 border-black border rounded-full my-1"></span>
                <span className="border-r border-black border-dashed flex-1 self-center w-[1px]"></span>
              </div>
              <div>
                <Vote size={20} />
                <p className="font-medium">Start voting period</p>
                <p className="text-sm text-muted-foreground">{voteDate}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col w-min">
                <span className="w-3 h-3 border-black border rounded-full my-1"></span>
                <span className="border-r border-black border-dashed flex-1 self-center w-[1px]"></span>
              </div>
              <div className="mt-4">
                <CalendarOff size={20} />
                <p className="font-medium">End voting period</p>
                <p className="text-sm text-muted-foreground">{voteEndDate}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex gap-2 mt-2 items-center w-min">
                <span className="w-4 h-4 flex items-center justify-center border-success border rounded-full my-1">
                  <Check className="text-success" size={12} />
                </span>
                <p className="font-medium">Execute</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 col-span-2 gap-6">
          <div className="flex flex-col p-6 bg-white rounded-md border border-border">
            <h3 className="text-xl mb-2 font-semibold">Details</h3>
            <Tabs defaultValue="description">
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
                        {calldatas ? shortenText(calldatas as string) : null}
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
                                ? shortenText(calldatas[index] as string)
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

  const description = (query?.description as string) || "";

  const proposer = (query?.proposer as `0x${string}`) || "";

  const voteStart = (query?.voteStart as string) || "";

  const voteEnd = (query?.voteEnd as string) || "";

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
      voteEnd,
    },
  };
};
