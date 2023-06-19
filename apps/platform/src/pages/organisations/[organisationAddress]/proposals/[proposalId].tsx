import type { MarkdownFrontmatter } from '@/types/proposals';
import type { GetServerSideProps } from 'next';

import CastVoteModal from '@/components/CastVoteModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { toast } from '@/hooks/use-toast';
import { GOVERNOR_ABI, TOKEN_ABI } from '@/utils/abi/openzeppelin-contracts';
import { getStringHash } from '@/utils/hash-string';
import {
  parseMarkdownWithYamlFrontmatter,
  proposalTimestampToDate as timestampToDate,
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
  useBlockNumber,
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

const ONE_BLOCK_IN_SECONDS = 1.5;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

function setExecuteWriteArgs(
  targets: `0x${string}` | `0x${string}`[],
  values: string | string[],
  calldatas: `0x${string}` | `0x${string}`[],
  description: string,
) {
  const executeDescription = getStringHash(description) as `0x${string}`;

  const executeTargets = Array.isArray(targets) ? targets : [targets];
  const executeValues = Array.isArray(values)
    ? values.map((val) => BigInt(val))
    : [BigInt(values)];
  const executeCalldatas = Array.isArray(calldatas) ? calldatas : [calldatas];

  return [
    executeTargets,
    executeValues,
    executeCalldatas,
    executeDescription,
  ] as const;
}

type ProposalPageProps = {
  calldatas: `0x${string}` | `0x${string}`[];
  description: string;
  organisationAddress: `0x${string}`;
  proposalId: string;
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

  const { proposalDescription, title } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(description);

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
  const { data: tokenAddress, isSuccess: readDecimals } = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'token',
  });

  const { data: tokenDecimals } = useContractRead({
    abi: TOKEN_ABI,
    address: tokenAddress,
    enabled: readDecimals,
    functionName: 'decimals',
  });

  // get votes
  const votesContractRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId)],
    functionName: 'proposalVotes',
    onSuccess(data) {
      const decimals = tokenDecimals || 18;
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

  // get proposal state
  const proposalStateRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId)],
    functionName: 'state',
    onSuccess(data) {
      setProposalState(proposalStateMap[data ? data : -1] || 'Unknown State');
      if (data !== 7) {
        executeWritePrepare.refetch();
      }
      // TODO: refactor proposal state if watch works
    },
  });

  // auxiliary functions
  async function blockNumberToTimestamp(blockNumber: bigint) {
    try {
      const block = await publicClient.getBlock({
        blockNumber: blockNumber,
      });

      return block.timestamp.toString();
    } catch (error) {
      console.log('Error while trying to get timestamp for block', error);
      return '';
    }
  }

  async function blockNumberToDate(blockNumber: bigint) {
    const timestamp = await blockNumberToTimestamp(blockNumber);
    const date = timestamp ? timestampToDate(timestamp, true) : 'Invalid date';
    return date;
  }

  async function getApproximateFutureDate(start: string, interval: string) {
    const startTimestamp = await blockNumberToTimestamp(BigInt(start));
    if (!startTimestamp) {
      return 'Invalid date';
    }

    const intervalTimestamp = ONE_BLOCK_IN_SECONDS * Number(interval);
    const endTimestamp = (
      Number(startTimestamp) + intervalTimestamp
    ).toString();

    return timestampToDate(endTimestamp, true);
  }

  // get voting period and set vote end
  useBlockNumber({
    onSuccess: async (data) => {
      if (BigInt(voteEnd) > data) {
        votingPeriodRead.refetch();
      } else {
        const date = await blockNumberToDate(BigInt(voteEnd));
        setProposalVoteEndDate(date);
      }
    },
  });

  const votingPeriodRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    enabled: false,
    functionName: 'votingPeriod',
    onSuccess: async (data) => {
      const date = await getApproximateFutureDate(voteStart, data.toString());
      setProposalVoteEndDate(date);
    },
  });

  // set vote start
  useEffect(() => {
    blockNumberToDate(BigInt(voteStart)).then((date) =>
      setProposalVoteStartDate(date),
    );
  }, [voteStart]);

  // get and set snapshot
  useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId)],
    functionName: 'proposalSnapshot',
    onSuccess(data) {
      blockNumberToDate(data).then((date) => setProposalSnapshotDate(date));
    },
  });

  // execute write to contract
  const executeWritePrepare = usePrepareContractWrite({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: setExecuteWriteArgs(targets, values, calldatas, description),
    enabled: false,
    functionName: 'execute',
    value: Array.isArray(values)
      ? values
          .map((val) => BigInt(val))
          .reduce((acc, curr) => acc + curr, BigInt(0))
      : BigInt(values),
  });
  const executeWrite = useContractWrite(executeWritePrepare.config);

  // transaction processing (loading and success)
  const { isLoading: isTransactionLoading } = useWaitForTransaction({
    hash: executeWrite.data?.hash,
    onSuccess() {
      toast({
        description: 'Execute action successfully applied.',
      });
    },
  });

  // listen to ProposalExecuted event and update state
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

  // listen to cast vote event and read votes again if such an event was emitted
  useContractEvent({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    eventName: 'VoteCast',
    listener: (logs) => {
      if (logs.some((log) => log.args.proposalId?.toString() === proposalId)) {
        votesContractRead.refetch();
      }
    },
  });

  const renderProposalState = useCallback(() => {
    switch (proposalState) {
      case 'Pending':
        return (
          <>
            <ClockIcon className='mr-2 h-4 w-4' />
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
        return (
          <Button
            disabled={!executeWrite || !isConnected}
            loading={isTransactionLoading || executeWrite.isLoading}
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
    executeWrite,
    isConnected,
    isTransactionLoading,
  ]);

  return (
    <div className='relative'>
      <Image
        alt='gradient'
        className='absolute left-1/2 top-0 z-[-1] h-auto w-[160%] max-w-none -translate-y-1/4 translate-x-[-30%] opacity-20 blur-[100px] filter'
        fill
        src='/gradient-2.jpg'
      />
      <Link
        className='inline-flex items-center text-muted-foreground'
        href={`/organisations/${organisationAddress}`}
      >
        <ArrowLeft className='mr-1 h-4 w-4' />
        {`organisations/${shortenAddress(organisationAddress)}`}
      </Link>
      <div className='mt-5 grid items-start gap-5 md:grid-cols-3'>
        <div className='rounded-md border border-border bg-white p-6 md:col-start-1'>
          <div className='space-y-5'>
            <div className='flex flex-col gap-5 md:flex-row md:justify-between'>
              <div>
                {proposalState == 'Unknown State' ? (
                  <Skeleton className='h-[22px] w-[75px] rounded-full' />
                ) : (
                  <Badge variant={badgeVariantMap[proposalState]}>
                    {proposalState}
                  </Badge>
                )}
                <h1 className='mt-3 text-xl font-semibold'>
                  {title || `Proposal #${shortenText(proposalId)}`}
                </h1>
              </div>
              {renderProposalState()}
            </div>
            <div className='space-x-1 text-sm'>
              <span>by</span>
              <Link
                className='border-b border-dashed border-[#999]'
                href={`https://testnet-explorer.thetatoken.org/account/${proposer}`}
                target='_blank'
              >
                {shortenAddress(proposer)}
              </Link>
            </div>
          </div>
        </div>
        <div className='rounded-md border border-border bg-white p-6 md:col-start-1'>
          <h3 className='mb-2 text-xl font-semibold'>Votes</h3>
          <div className='space-y-5'>
            <div>
              <span>
                {Intl.NumberFormat('en-US', {
                  compactDisplay: 'short',
                  maximumFractionDigits: 1,
                  notation: 'compact',
                }).format(votes.for)}
              </span>
              <Progress
                indicatorclassname='bg-success'
                max={votes.total}
                value={votes.for}
              />
            </div>
            <div>
              <span>
                {Intl.NumberFormat('en-US', {
                  compactDisplay: 'short',
                  maximumFractionDigits: 1,
                  notation: 'compact',
                }).format(votes.against)}
              </span>
              <Progress
                indicatorclassname='bg-destructive'
                max={votes.total}
                value={votes.against}
              />
            </div>
            <div>
              <span>
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
        <div className='rounded-md border border-border bg-white p-6 md:col-span-2 md:col-start-2 md:row-span-3 md:row-start-1'>
          <h3 className='mb-2 text-xl font-semibold'>Details</h3>
          <Tabs defaultValue='description'>
            <TabsList>
              <TabsTrigger value='description'>Description</TabsTrigger>
              <TabsTrigger value='code'>Executable code</TabsTrigger>
            </TabsList>
            <TabsContent value='description'>
              <article className='prose-sm py-5 sm:prose'>
                <ReactMarkdown>{proposalDescription}</ReactMarkdown>
              </article>
            </TabsContent>
            <TabsContent value='code'>
              <div className='space-y-5 py-5'>
                {Array.isArray(targets) &&
                  targets.map((target, index) => (
                    <div key={index}>
                      <h3 className='mb-2'>Function {index + 1}:</h3>
                      <div className='border border-border p-5'>
                        <div>
                          Calldatas: <br />
                          {shortenText(calldatas[index])}
                        </div>
                        <div className='mt-2'>
                          Target: <br />
                          <Link
                            className='border-b border-dashed border-[#999]'
                            href={`https://testnet-explorer.thetatoken.org/account/${target}`}
                            target='_blank'
                          >
                            {shortenAddress(target)}
                          </Link>
                        </div>
                        <div className='mt-2'>
                          Value: <br />
                          {values[index]}
                        </div>
                      </div>
                    </div>
                  ))}
                {!Array.isArray(targets) && (
                  <div>
                    {targets === NULL_ADDRESS ? (
                      <div className='mb-2 flex items-center gap-2'>
                        <h3>Function 1:</h3>
                        <Badge variant='warning'>empty</Badge>
                      </div>
                    ) : (
                      <h3 className='mb-2'>Function 1:</h3>
                    )}

                    <div className='border border-border p-5'>
                      <div>
                        Calldatas: <br />
                        {shortenText(calldatas as string)}
                      </div>
                      <div className='mt-2'>
                        Target: <br />
                        <Link
                          className='border-b border-dashed border-[#999]'
                          href={`https://testnet-explorer.thetatoken.org/account/${targets}`}
                          target='_blank'
                        >
                          {shortenAddress(targets)}
                        </Link>
                      </div>
                      <div className='mt-2'>
                        Value: <br />
                        {values}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <ProposalStatus
          proposalSnapshotDate={proposalSnapshotDate}
          proposalState={proposalState}
          proposalVoteEndDate={proposalVoteEndDate}
          proposalVoteStartDate={proposalVoteStartDate}
        />
      </div>
    </div>
  );
}

// Using arrow function to infer type
export const getServerSideProps: GetServerSideProps = async ({
  params,
  query,
}) => {
  // Better than useRouter hook because on the client side
  // we will always have needed params
  const organisationAddress = params?.organisationAddress as `0x${string}`;
  const proposalId = params?.proposalId as string;

  const targets = query?.targets as `0x${string}` | `0x${string}`[];
  const values = query?.values as string | string[];
  const calldatas = query?.calldatas as `0x${string}` | `0x${string}`[];
  const description = query?.description as string;

  const proposer = query?.proposer as `0x${string}`;
  const voteStart = query?.voteStart as string;
  const voteEnd = query?.voteEnd as string;

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
}: {
  proposalSnapshotDate: string;
  proposalState: string;
  proposalVoteEndDate: string;
  proposalVoteStartDate: string;
}) {
  return (
    <div className='col-start-1 rounded-md border border-border bg-white p-6'>
      <h3 className='mb-2 text-xl font-semibold'>Status</h3>
      <div className='flex gap-4'>
        <div className='flex w-min flex-col'>
          <span className='my-1 h-3 w-3 rounded-full border border-black'></span>
          <span className='w-[1px] flex-1 self-center border-r border-dashed border-black'></span>
        </div>
        <div>
          <PlusCircle size={20} />
          <p className='font-medium'>Proposed on</p>
          {proposalSnapshotDate === '' ? (
            <Skeleton className='h-[20px] w-[150px]' />
          ) : (
            <p className='text-sm text-muted-foreground'>
              {proposalSnapshotDate}
            </p>
          )}
        </div>
      </div>
      <div className='flex gap-4'>
        <div className='flex w-min flex-col'>
          <span className='my-1 h-3 w-3 rounded-full border border-black'></span>
          <span className='w-[1px] flex-1 self-center border-r border-dashed border-black'></span>
        </div>
        <div className='mt-4'>
          <Vote size={22} />
          <p className='font-medium'>Vote start</p>
          {proposalVoteStartDate === '' ? (
            <Skeleton className='h-[20px] w-[150px]' />
          ) : (
            <p className='text-sm text-muted-foreground'>
              {proposalVoteStartDate}
            </p>
          )}
        </div>
      </div>
      <div className='flex gap-4'>
        <div className='flex w-min flex-col'>
          <span className='my-1 h-3 w-3 rounded-full border border-black'></span>
          {proposalState === 'Active' ? null : (
            <span className='w-[1px] flex-1 self-center border-r border-dashed border-black'></span>
          )}
        </div>
        <div className='mt-4'>
          <CalendarOff size={20} />
          <p className='font-medium'>Vote end ~</p>
          {proposalVoteEndDate === '' ? (
            <Skeleton className='h-[20px] w-[150px]' />
          ) : (
            <p className='text-sm text-muted-foreground'>
              {proposalVoteEndDate}
            </p>
          )}
        </div>
      </div>
      {proposalState === 'Unknown State' ? (
        <div className='flex gap-4'>
          <div className='mt-4 flex w-min items-center gap-2'>
            <Skeleton className='h-[20px] w-[20px] rounded-full' />
            <Skeleton className='h-[24px] w-[75px]' />
          </div>
        </div>
      ) : null}
      {proposalState === 'Defeated' ? (
        <div className='flex gap-4'>
          <div className='mt-4 flex w-min items-center gap-2'>
            <XCircle size={20} />
            <p className='font-medium'>Defeated</p>
          </div>
        </div>
      ) : null}
      {proposalState === 'Succeeded' || proposalState === 'Executed' ? (
        <div className='flex gap-4'>
          <div className='mt-4 flex w-min items-center gap-2'>
            <CheckCircle2 size={20} />
            <p className='font-medium'>Succeeded</p>
          </div>
        </div>
      ) : null}
      {proposalState === 'Executed' ? (
        <div className='flex gap-4'>
          <div className='mt-4 flex w-min items-center gap-2'>
            <ListChecks size={20} />
            <p className='font-medium'>Executed</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
