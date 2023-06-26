import type { MarkdownFrontmatter, ProposalPageProps } from '@/types/proposals';
import type { GetServerSideProps } from 'next';

import CastVoteModal from '@/components/CastVoteModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import useProposalExecute from '@/hooks/use-proposal-execute';
import useProposalState from '@/hooks/use-proposal-state';
import useProposalTimings from '@/hooks/use-proposal-timings';
import useProposalVotes from '@/hooks/use-proposal-votes';
import { NULL_ADDRESS } from '@/utils/chains/chain-config';
import {
  formatVotes,
  parseMarkdownWithYamlFrontmatter,
} from '@/utils/helpers/proposal.helper';
import { shortenAddress, shortenText } from '@/utils/helpers/shorten.helper';
import { badgeVariantMap } from '@/utils/proposal-states';
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
import { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAccount } from 'wagmi';

export default function ProposalPage({
  calldatas,
  description,
  organisationAddress,
  proposalId,
  proposer,
  targets,
  values,
}: ProposalPageProps) {
  const { isConnected } = useAccount();

  // title
  const { proposalDescription, title } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(description);

  // votes
  const votes = useProposalVotes(organisationAddress, BigInt(proposalId));

  // timings
  const timings = useProposalTimings(organisationAddress, BigInt(proposalId));

  // state
  const proposalState = useProposalState(
    organisationAddress,
    BigInt(proposalId),
    true,
  );

  // execution
  const { loading: executeLoading, write: executeWrite } = useProposalExecute(
    organisationAddress,
    proposalState,
    targets,
    values,
    calldatas,
    description,
  );

  const renderProposalState = useCallback(() => {
    switch (proposalState) {
      case 'Pending':
        return (
          <div>
            <div className='flex items-center'>
              <p>Vote start</p>
              <ClockIcon className='ml-2 h-4 w-4' />
            </div>
            {timings.voteStartDate === '' ? (
              <Skeleton className='h-[20px] w-[150px]' />
            ) : (
              <p className='text-sm text-muted-foreground'>
                {timings.voteStartDate}
              </p>
            )}
          </div>
        );
      case 'Active':
        return (
          <CastVoteModal
            organisationAddress={organisationAddress}
            proposalId={BigInt(proposalId)}
            voteStart={timings.voteStart}
          />
        );
      case 'Succeeded':
        return targets === NULL_ADDRESS ? null : (
          <Button
            disabled={!executeWrite || !isConnected}
            loading={executeLoading}
            onClick={executeWrite}
          >
            Execute
          </Button>
        );
    }
  }, [
    proposalState,
    timings.voteStartDate,
    timings.voteStart,
    organisationAddress,
    proposalId,
    targets,
    executeWrite,
    isConnected,
    executeLoading,
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
            <div className='flex flex-col gap-5 lg:flex-row lg:justify-between'>
              <div>
                {proposalState === 'Unknown State' ? (
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
                href={`https://testnet.ftmscan.com/address/${proposer}`}
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
              <div className='flex justify-between'>
                <span>{formatVotes(votes.for)}</span>
                <span>For</span>
              </div>
              <Progress
                indicatorclassname='bg-success'
                max={votes.total}
                value={votes.for}
              />
            </div>
            <div>
              <div className='flex justify-between'>
                <span>{formatVotes(votes.against)}</span>
                <span>Against</span>
              </div>
              <Progress
                indicatorclassname='bg-destructive'
                max={votes.total}
                value={votes.against}
              />
            </div>
            <div>
              <div className='flex justify-between'>
                <span>{formatVotes(votes.abstain)}</span>
                <span>Abstain</span>
              </div>
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
            <TabsContent className='overflow-x-auto' value='description'>
              <article className='prose-sm max-w-none py-5 sm:prose'>
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
                            href={`https://testnet.ftmscan.com/address/${organisationAddress}`}
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
                {!Array.isArray(targets) && targets !== NULL_ADDRESS ? (
                  <div>
                    <h3>Function 1:</h3>
                    <div className='border border-border p-5'>
                      <div>
                        Calldatas: <br />
                        {shortenText(calldatas as string)}
                      </div>
                      <div className='mt-2'>
                        Target: <br />
                        <Link
                          className='border-b border-dashed border-[#999]'
                          href={`https://testnet.ftmscan.com/address/${targets}`}
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
                ) : (
                  <p>This proposal cannot be executed</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <ProposalStatus
          proposalDate={timings.proposedOnDate}
          proposalState={proposalState}
          proposalVoteEndDate={timings.voteEndDate}
          voteStartDate={timings.voteStartDate}
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

  return {
    props: {
      calldatas,
      description,
      organisationAddress,
      proposalId,
      proposer,
      targets,
      values,
    },
  };
};

function ProposalStatus({
  proposalDate,
  proposalState,
  proposalVoteEndDate,
  voteStartDate,
}: {
  proposalDate: string;
  proposalState: string;
  proposalVoteEndDate: string;
  voteStartDate: string;
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
          {proposalDate === '' ? (
            <Skeleton className='h-[20px] w-[150px]' />
          ) : (
            <p className='text-sm text-muted-foreground'>{proposalDate}</p>
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
          {voteStartDate === '' ? (
            <Skeleton className='h-[20px] w-[150px]' />
          ) : (
            <p className='text-sm text-muted-foreground'>{voteStartDate}</p>
          )}
        </div>
      </div>
      <div className='flex gap-4'>
        <div className='flex w-min flex-col'>
          <span className='my-1 h-3 w-3 rounded-full border border-black'></span>
          {proposalState === 'Active' || proposalState === 'Pending' ? null : (
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
