import type { GetServerSideProps } from "next";
import type { MarkdownFrontmatter } from "@/types/proposals";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  ArrowLeft,
  CalendarOff,
  CheckCircle2,
  ClockIcon,
  ListChecks,
  PlusCircle,
  Vote,
  XCircle,
} from "lucide-react";

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

import { GOVERNOR_ABI, TOKEN_ABI } from "@/utils/abi/openzeppelin-contracts";
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
import { Skeleton } from "@/components/ui/Skeleton";

const ONE_BLOCK_IN_SECONDS = 12;

type ProposalStatusProps = {
  proposalSnapshotDate: string;
  proposalVoteStartDate: string;
  proposalVoteEndDate: string;
  proposalState: string;
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

type Votes = {
  for: number;
  against: number;
  abstain: number;
  total: number;
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

  const [proposalState, setProposalState] = useState("Unknown State");
  const [proposalVoteStartDate, setProposalVoteStartDate] = useState("");
  const [proposalVoteEndDate, setProposalVoteEndDate] = useState("");
  const [proposalSnapshotDate, setProposalSnapshotDate] = useState("");
  const [votes, setVotes] = useState<Votes>({
    for: 0,
    against: 0,
    abstain: 0,
    total: 0,
  });

  // get token decimals
  const [tokenAddress, setTokenAddress] = useState<`0x${string}`>("0x00");
  const [tokenDecimals, setTokenDecimals] = useState(18);

  useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "token",
    onSuccess(data) {
      setTokenAddress(data);
    },
  });

  const votingPeriodRead = useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "votingPeriod",
  });

  const tokenDecimalsRead = useContractRead({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "decimals",
    onSuccess(data) {
      setTokenDecimals(data);
    },
  });

  const { title, proposalDescription } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(description);

  // get votes
  const votesContractRead = useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "proposalVotes",
    args: [BigInt(proposalId)],
    onSuccess(data) {
      const votes: Votes = {
        for: Number(data[1]) / 10 ** tokenDecimals,
        against: Number(data[0]) / 10 ** tokenDecimals,
        abstain: Number(data[2]) / 10 ** tokenDecimals,
        total: 0,
      };
      votes.total = votes.for + votes.against + votes.abstain;
      setVotes(votes);
    },
  });

  const proposalStateRead = useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "state",
    args: [BigInt(proposalId)],
    onSuccess(data) {
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

  // get vote start, end and snapshot in format of date
  const { data: snapshot } = useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "proposalSnapshot",
    args: [BigInt(proposalId)],
  });

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

  async function getDate(blockNumber: string) {
    try {
      const timestamp = await blockNumberToTimestamp(blockNumber);
      return timestampToDate(timestamp, true);
    } catch (error) {
      console.log(error);
      return "Unknown Date";
    }
  }

  async function getApproximateFutureDate(
    voteStartBlockNumber: string,
    votingPeriod: string
  ) {
    try {
      const voteStartTimestamp = await blockNumberToTimestamp(
        voteStartBlockNumber
      );

      const approximateVoteEndTimestamp = (
        (Number(voteStartTimestamp) +
          ONE_BLOCK_IN_SECONDS * Number(votingPeriod)) |
        0
      ).toString();

      return timestampToDate(approximateVoteEndTimestamp, true);
    } catch (error) {
      console.log(error);
      return "Unknown Date";
    }
  }

  useEffect(() => {
    getDate(voteStart).then((date) => setProposalVoteStartDate(date));
  }, []);

  useEffect(() => {
    if (votingPeriodRead.data) {
      // since we don't know the exact timestamp for the
      // future blocks we approximately calculate it
      getApproximateFutureDate(
        voteStart,
        votingPeriodRead.data.toString()
      ).then((date) => setProposalVoteEndDate(date));
    }
  }, [votingPeriodRead.data]);

  useEffect(() => {
    if (snapshot) {
      getDate(snapshot.toString()).then((date) =>
        setProposalSnapshotDate(date)
      );
    }
  }, [snapshot]);

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
  }, [
    proposalState,
    voteStart,
    organisationAddress,
    proposalId,
    isTransactionLoading,
    executeWrite,
    isConnected,
  ]);

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
          {`organisations/${shortenAddress(organisationAddress)}`}
        </Link>
      </div>
      <div className="grid items-start md:grid-cols-3 gap-5 mt-5">
        <div className="grid md:grid-cols-1 gap-5">
          <div className="flex relative flex-col p-6 bg-white rounded-md border">
            <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
              <div>
                {proposalState == "Unknown State" ? (
                  <Skeleton className="w-[75px] h-[22px] rounded-full" />
                ) : (
                  <Badge variant={badgeVariantMap[proposalState]}>
                    {proposalState}
                  </Badge>
                )}
                <h1 className="text-xl font-semibold mt-3">
                  {title || `Proposal #${shortenText(proposalId)}`}
                </h1>
              </div>
              {renderProposalState()}
            </div>

            <div className="flex-2 w-full mt-5">
              <div className="text-sm space-x-1">
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
                  }).format(votes.for)}
                </span>
                <Progress
                  indicatorClassName="bg-success"
                  value={votes.for}
                  max={votes.total}
                />
              </div>
              <div>
                <span>
                  {/*https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn*/}
                  {Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                    compactDisplay: "short",
                  }).format(votes.against)}
                </span>
                <Progress
                  indicatorClassName="bg-destructive"
                  value={votes.against}
                  max={votes.total}
                />
              </div>
              <div>
                <span>
                  {/*https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn*/}
                  {Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                    compactDisplay: "short",
                  }).format(votes.abstain)}
                </span>
                <Progress value={votes.abstain} max={votes.total} />
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <ProposalStatus
              proposalSnapshotDate={proposalSnapshotDate}
              proposalVoteStartDate={proposalVoteStartDate}
              proposalVoteEndDate={proposalVoteEndDate}
              proposalState={proposalState}
            />
          </div>
        </div>
        <div className="grid md:grid-cols-1 md:col-span-2 gap-5">
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
                  <div>
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
        <div className="md:hidden">
          <ProposalStatus
            proposalSnapshotDate={proposalSnapshotDate}
            proposalVoteStartDate={proposalVoteStartDate}
            proposalVoteEndDate={proposalVoteEndDate}
            proposalState={proposalState}
          />
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

function ProposalStatus({
  proposalSnapshotDate,
  proposalVoteStartDate,
  proposalVoteEndDate,
  proposalState,
}: ProposalStatusProps) {
  return (
    <div className="flex flex-col p-6 bg-white rounded-md border border-border">
      <h3 className="text-xl mb-2 font-semibold">Status</h3>
      <div className="flex gap-4">
        <div className="flex flex-col w-min">
          <span className="w-3 h-3 border-black border rounded-full my-1"></span>
          <span className="border-r border-black border-dashed flex-1 self-center w-[1px]"></span>
        </div>
        <div>
          <PlusCircle size={20} />
          <p className="font-medium">Proposed on</p>
          {proposalSnapshotDate === "" ? (
            <Skeleton className="w-[150px] h-[20px]" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {proposalSnapshotDate}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col w-min">
          <span className="w-3 h-3 border-black border rounded-full my-1"></span>
          <span className="border-r border-black border-dashed flex-1 self-center w-[1px]"></span>
        </div>
        <div className="mt-4">
          <Vote size={22} />
          <p className="font-medium">Vote start</p>
          {proposalVoteStartDate === "" ? (
            <Skeleton className="w-[150px] h-[20px]" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {proposalVoteStartDate}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col w-min">
          <span className="w-3 h-3 border-black border rounded-full my-1"></span>
          {proposalState === "Active" ? null : (
            <span className="border-r border-black border-dashed flex-1 self-center w-[1px]"></span>
          )}
        </div>
        <div className="mt-4">
          <CalendarOff size={20} />
          <p className="font-medium">Vote end ~</p>
          {proposalVoteEndDate === "" ? (
            <Skeleton className="w-[150px] h-[20px]" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {proposalVoteEndDate}
            </p>
          )}
        </div>
      </div>
      {proposalState === "Unknown State" ? (
        <div className="flex gap-4">
          <div className="flex gap-2 mt-4 items-center w-min">
            <Skeleton className="w-[20px] h-[20px] rounded-full" />
            <Skeleton className="w-[75px] h-[24px]" />
          </div>
        </div>
      ) : null}
      {proposalState === "Defeated" ? (
        <div className="flex gap-4">
          <div className="flex gap-2 mt-4 items-center w-min">
            <XCircle size={20} />
            <p className="font-medium">Defeated</p>
          </div>
        </div>
      ) : null}
      {proposalState === "Succeeded" || proposalState === "Executed" ? (
        <div className="flex gap-4">
          <div className="flex gap-2 mt-4 items-center w-min">
            <CheckCircle2 size={20} />
            <p className="font-medium">Succeeded</p>
          </div>
        </div>
      ) : null}
      {proposalState === "Executed" ? (
        <div className="flex gap-4">
          <div className="flex gap-2 mt-4 items-center w-min">
            <ListChecks size={20} />
            <p className="font-medium">Executed</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
