import type { MarkdownFrontmatter } from '@/types/proposals';
import type { GetServerSideProps } from 'next';

import CastVoteModal from '@/components/CastVoteModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { toast } from '@/components/ui/use-toast';
import { GOVERNOR_ABI, TOKEN_ABI } from '@/utils/abi/openzeppelin-contracts';
import { getStringHash } from '@/utils/hash-string';
import {
  parseMarkdownWithYamlFrontmatter,
  proposalTimestampToDate,
} from '@/utils/helpers/proposal.helper';
import { shortenAddress, shortenText } from '@/utils/helpers/shorten.helper';
import { badgeVariantMap, proposalStateMap } from '@/utils/proposal-states';
import {
  ArrowLeft,
  CalendarOff,
  CheckCircle2,
  ClockIcon,
  ListChecks,
  PlusCircle,
  Vote,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

const ONE_BLOCK_IN_SECONDS = 12;

type ProposalStatusProps = {
  proposalSnapshotDate: string;
  proposalState: string;
  proposalVoteEndDate: string;
  proposalVoteStartDate: string;
};

function setExecuteWriteArgs(
  targets: `0x${string}` | `0x${string}`[],
  values: string | string[],
  calldatas: `0x${string}` | `0x${string}`[],
  description: string,
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
  calldatas: `0x${string}` | `0x${string}`[];
  description: string;
  organisationAddress: `0x${string}`;
  proposalId: `0x${string}`;
  proposer: `0x${string}`;
  targets: `0x${string}` | `0x${string}`[];
  values: string | string[];
  voteEnd: string;
  voteStart: string;
};

type Votes = {
  abstain: number;
  against: number;
  for: number;
  total: number;
};

export default function ProposalPage({
  calldatas,
  description,
  organisationAddress,
  proposalId,
  proposer,
  targets,
  values,
  voteEnd,
  voteStart,
}: ProposalPageProps) {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [proposalState, setProposalState] = useState('Unknown State');
  const [proposalVoteStartDate, setProposalVoteStartDate] = useState('');
  const [proposalVoteEndDate, setProposalVoteEndDate] = useState('');
  const [proposalSnapshotDate, setProposalSnapshotDate] = useState('');
  const [votes, setVotes] = useState<Votes>({
    abstain: 0,
    against: 0,
    for: 0,
    total: 0,
  });

  // get token decimals
  const [tokenAddress, setTokenAddress] = useState<`0x${string}`>('0x00');
  const [tokenDecimals, setTokenDecimals] = useState(0);
  const [fetchTokenDecimals, setFetchTokenDecimals] = useState(false);

  useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'token',
    onSuccess(data) {
      setTokenAddress(data);
      setFetchTokenDecimals(true);
    },
  });

  const tokenDecimalsRead = useContractRead({
    abi: TOKEN_ABI,
    address: tokenAddress,
    enabled: fetchTokenDecimals,
    functionName: 'decimals',
    onSuccess(data) {
      setTokenDecimals(data);
    },
  });

  const votingPeriodRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'votingPeriod',
  });

  const { proposalDescription, title } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(description);

  // get votes
  const votesContractRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId)],
    functionName: 'proposalVotes',
    onSuccess(data) {
      const decimals = tokenDecimals ? tokenDecimals : 18;
      const votes: Votes = {
        abstain: Number(data[2]) / 10 ** decimals,
        against: Number(data[0]) / 10 ** decimals,
        for: Number(data[1]) / 10 ** decimals,
        total: 0,
      };
      votes.total = votes.for + votes.against + votes.abstain;
      setVotes(votes);
    },
  });

  const proposalStateRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId)],
    functionName: 'state',
    onSuccess(data) {
      setProposalState(proposalStateMap[data ? data : -1] || 'Unknown State');
    },
  });

  const isTargetsString = typeof targets === 'string';

  // listen to cast vote event and read votes again if event was emitted
  useContractEvent({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    eventName: 'VoteCast',
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
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId)],
    functionName: 'proposalSnapshot',
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
      return proposalTimestampToDate(timestamp, true);
    } catch (error) {
      console.log(error);
      return 'Unknown Date';
    }
  }

  async function getApproximateFutureDate(
    voteStartBlockNumber: string,
    votingPeriod: string,
  ) {
    try {
      const voteStartTimestamp = await blockNumberToTimestamp(
        voteStartBlockNumber,
      );

      const approximateVoteEndTimestamp = (
        (Number(voteStartTimestamp) +
          ONE_BLOCK_IN_SECONDS * Number(votingPeriod)) |
        0
      ).toString();

      return proposalTimestampToDate(approximateVoteEndTimestamp, true);
    } catch (error) {
      console.log(error);
      return 'Unknown Date';
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
        votingPeriodRead.data.toString(),
      ).then((date) => setProposalVoteEndDate(date));
    }
  }, [votingPeriodRead.data]);

  useEffect(() => {
    if (snapshot) {
      getDate(snapshot.toString()).then((date) =>
        setProposalSnapshotDate(date),
      );
    }
  }, [snapshot]);

  // execute write to contract
  const { config: executeWriteConfig } = usePrepareContractWrite({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: setExecuteWriteArgs(targets, values, calldatas, description),
    functionName: 'execute',
    value: isTargetsString
      ? BigInt(values as string)
      : (values as string[])
          .map((val) => BigInt(val))
          .reduce((acc, curr) => acc + curr, BigInt(0)),
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
        description: 'Execute action successfully applied.',
      });
    }
  }, [isTransactionSuccessful]);

  useContractEvent({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    eventName: 'ProposalExecuted',
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
      case 'Pending':
        return (
          <>
            <ClockIcon className="mr-2 h-4 w-4" />
            Voting starts at {voteStart} block
          </>
        );
      case 'Active':
        return (
          <CastVoteModal
            organisationAddress={organisationAddress}
            proposalId={proposalId}
          />
        );
      case 'Succeeded':
        if (targets != '0x0000000000000000000000000000000000000000') {
          return (
            <Button
              className="mt-5"
              disabled={!executeWrite || !isConnected}
              loading={isTransactionLoading || executeWrite.isLoading}
              onClick={executeWrite.write}
            >
              Execute
            </Button>
          );
        }
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
        alt="gradient"
        className="absolute left-1/2 top-0 z-[-1] h-auto w-[160%] max-w-none -translate-y-1/4 translate-x-[-30%] opacity-20 blur-[100px] filter"
        fill
        src="/gradient-2.jpg"
      />
      <div>
        <Link
          className="inline-flex items-center text-muted-foreground"
          href={`/organisations/${organisationAddress}`}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {`organisations/${shortenAddress(organisationAddress)}`}
        </Link>
      </div>
      <div className="mt-5 grid items-start gap-5 md:grid-cols-3">
        <div className="grid gap-5 md:grid-cols-1">
          <div className="relative flex flex-col rounded-md border bg-white p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-0">
              <div>
                {proposalState == 'Unknown State' ? (
                  <Skeleton className="h-[22px] w-[75px] rounded-full" />
                ) : (
                  <Badge variant={badgeVariantMap[proposalState]}>
                    {proposalState}
                  </Badge>
                )}
                <h1 className="mt-3 text-xl font-semibold">
                  {title || `Proposal #${shortenText(proposalId)}`}
                </h1>
              </div>
              {renderProposalState()}
            </div>

            <div className="flex-2 mt-5 w-full">
              <div className="space-x-1 text-sm">
                <span>by</span>
                <Link
                  className="border-b border-dashed border-[#999]"
                  href={`https://testnet-explorer.thetatoken.org/account/${proposer}`}
                  target="_blank"
                >
                  {shortenAddress(proposer)}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col rounded-md border border-border bg-white p-6">
            <h3 className="mb-2 text-xl font-semibold">Votes</h3>
            <div className="flex flex-col gap-4">
              <div>
                <span>
                  {/*https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn*/}
                  {Intl.NumberFormat('en-US', {
                    compactDisplay: 'short',
                    maximumFractionDigits: 1,
                    notation: 'compact',
                  }).format(votes.for)}
                </span>
                <Progress
                  indicatorClassName="bg-success"
                  max={votes.total}
                  value={votes.for}
                />
              </div>
              <div>
                <span>
                  {/*https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn*/}
                  {Intl.NumberFormat('en-US', {
                    compactDisplay: 'short',
                    maximumFractionDigits: 1,
                    notation: 'compact',
                  }).format(votes.against)}
                </span>
                <Progress
                  indicatorClassName="bg-destructive"
                  max={votes.total}
                  value={votes.against}
                />
              </div>
              <div>
                <span>
                  {/*https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn*/}
                  {Intl.NumberFormat('en-US', {
                    compactDisplay: 'short',
                    maximumFractionDigits: 1,
                    notation: 'compact',
                  }).format(votes.abstain)}
                </span>
                <Progress max={votes.total} value={votes.abstain} />
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <ProposalStatus
              proposalSnapshotDate={proposalSnapshotDate}
              proposalState={proposalState}
              proposalVoteEndDate={proposalVoteEndDate}
              proposalVoteStartDate={proposalVoteStartDate}
            />
          </div>
        </div>
        <div className="grid gap-5 md:col-span-2 md:grid-cols-1">
          <div className="flex flex-col rounded-md border border-border bg-white p-6">
            <h3 className="mb-2 text-xl font-semibold">Details</h3>
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="code">Executable code</TabsTrigger>
              </TabsList>
              <TabsContent value="description">
                <article className="prose-sm p-5 sm:prose">
                  <ReactMarkdown>{proposalDescription}</ReactMarkdown>
                </article>
              </TabsContent>
              <TabsContent value="code">
                {isTargetsString ? (
                  targets == '0x0000000000000000000000000000000000000000' ? (
                    <div className="p-5"></div>
                  ) : (
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
                            className="border-b border-dashed border-[#999]"
                            href={`https://testnet-explorer.thetatoken.org/account/${targets}`}
                            target="_blank"
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
                  )
                ) : (
                  Array.isArray(targets) &&
                  targets.length !== 0 && (
                    <div>
                      {targets.map((target, index) => (
                        <div className="p-5" key={index}>
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
                                className="border-b border-dashed border-[#999]"
                                href={`https://testnet-explorer.thetatoken.org/account/${target}`}
                                target="_blank"
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
            proposalState={proposalState}
            proposalVoteEndDate={proposalVoteEndDate}
            proposalVoteStartDate={proposalVoteStartDate}
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
  const proposalId = (params?.proposalId as string) || '';

  const targets = query?.targets
    ? (query?.targets as `0x${string}` | `0x${string}`[])
    : [];

  const values = query?.values ? (query?.values as string | string[]) : [];

  const calldatas = query?.calldatas
    ? (query?.calldatas as `0x${string}` | `0x${string}`[])
    : [];

  const description = (query?.description as string) || '';

  const proposer = (query?.proposer as `0x${string}`) || '';

  const voteStart = (query?.voteStart as string) || '';

  const voteEnd = (query?.voteEnd as string) || '';

  return {
    props: {
      calldatas,
      description,
      organisationAddress,
      proposalId,
      proposer,
      targets,
      values,
      voteEnd,
      voteStart,
    },
  };
};

function ProposalStatus({
  proposalSnapshotDate,
  proposalState,
  proposalVoteEndDate,
  proposalVoteStartDate,
}: ProposalStatusProps) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-white p-6">
      <h3 className="mb-2 text-xl font-semibold">Status</h3>
      <div className="flex gap-4">
        <div className="flex w-min flex-col">
          <span className="my-1 h-3 w-3 rounded-full border border-black"></span>
          <span className="w-[1px] flex-1 self-center border-r border-dashed border-black"></span>
        </div>
        <div>
          <PlusCircle size={20} />
          <p className="font-medium">Proposed on</p>
          {proposalSnapshotDate === '' ? (
            <Skeleton className="h-[20px] w-[150px]" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {proposalSnapshotDate}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex w-min flex-col">
          <span className="my-1 h-3 w-3 rounded-full border border-black"></span>
          <span className="w-[1px] flex-1 self-center border-r border-dashed border-black"></span>
        </div>
        <div className="mt-4">
          <Vote size={22} />
          <p className="font-medium">Vote start</p>
          {proposalVoteStartDate === '' ? (
            <Skeleton className="h-[20px] w-[150px]" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {proposalVoteStartDate}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex w-min flex-col">
          <span className="my-1 h-3 w-3 rounded-full border border-black"></span>
          {proposalState === 'Active' ? null : (
            <span className="w-[1px] flex-1 self-center border-r border-dashed border-black"></span>
          )}
        </div>
        <div className="mt-4">
          <CalendarOff size={20} />
          <p className="font-medium">Vote end ~</p>
          {proposalVoteEndDate === '' ? (
            <Skeleton className="h-[20px] w-[150px]" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {proposalVoteEndDate}
            </p>
          )}
        </div>
      </div>
      {proposalState === 'Unknown State' ? (
        <div className="flex gap-4">
          <div className="mt-4 flex w-min items-center gap-2">
            <Skeleton className="h-[20px] w-[20px] rounded-full" />
            <Skeleton className="h-[24px] w-[75px]" />
          </div>
        </div>
      ) : null}
      {proposalState === 'Defeated' ? (
        <div className="flex gap-4">
          <div className="mt-4 flex w-min items-center gap-2">
            <XCircle size={20} />
            <p className="font-medium">Defeated</p>
          </div>
        </div>
      ) : null}
      {proposalState === 'Succeeded' || proposalState === 'Executed' ? (
        <div className="flex gap-4">
          <div className="mt-4 flex w-min items-center gap-2">
            <CheckCircle2 size={20} />
            <p className="font-medium">Succeeded</p>
          </div>
        </div>
      ) : null}
      {proposalState === 'Executed' ? (
        <div className="flex gap-4">
          <div className="mt-4 flex w-min items-center gap-2">
            <ListChecks size={20} />
            <p className="font-medium">Executed</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
