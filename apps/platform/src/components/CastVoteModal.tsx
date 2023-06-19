import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { useToast } from '@/hooks/use-toast';
import { GOVERNOR_ABI, TOKEN_ABI } from '@/utils/abi/openzeppelin-contracts';
import { useState } from 'react';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import Web3Button from './Web3Button';
import { Button } from './ui/Button';

export default function CastVoteModal({
  organisationAddress,
  proposalId,
  snapshot,
}: {
  organisationAddress: `0x${string}`;
  proposalId: string;
  snapshot: bigint;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  // get account details
  const { address, isConnected } = useAccount();
  // get hasVoted when the wallet is connected
  const hasVotedRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId), address!],
    enabled: isConnected,
    functionName: 'hasVoted',
  });
  // get the token address
  const { data: tokenAddress, isSuccess: readTokenParams } = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'token',
  });
  // get the past votes for an account if the wallet is connected
  const { data: pastVotes } = useContractRead({
    abi: TOKEN_ABI,
    address: tokenAddress,
    args: [address!, snapshot],
    enabled: readTokenParams && isConnected,
    functionName: 'getPastVotes',
  });
  // get the token decimals
  const { data: tokenDecimals } = useContractRead({
    abi: TOKEN_ABI,
    address: tokenAddress,
    enabled: readTokenParams,
    functionName: 'decimals',
  });

  const castVoteWrite = useContractWrite({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'castVote',
  });

  const { isLoading: isTransactionLoading } = useWaitForTransaction({
    hash: castVoteWrite.data?.hash,
    onSuccess() {
      toast({
        description: 'Your vote has been successfully casted.',
      });
      hasVotedRead.refetch();
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Web3Button
          className='w-full md:w-24'
          disabled={hasVotedRead.data}
          loading={isTransactionLoading || castVoteWrite.isLoading}
        >
          {hasVotedRead.data ? 'Voted' : 'Vote'}
        </Web3Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Cast your vote</DialogTitle>
        </DialogHeader>
        {pastVotes ? (
          <div>
            Your voting power is{' '}
            <span className='font-bold'>
              {Intl.NumberFormat('en-US', {
                compactDisplay: 'short',
                maximumFractionDigits: 1,
                notation: 'compact',
              }).format(Number(pastVotes) / 10 ** (tokenDecimals || 18))}
            </span>
          </div>
        ) : null}
        <div className='flex gap-2'>
          <Button
            onClick={() => {
              castVoteWrite.write({
                args: [BigInt(proposalId), 1],
              });
              setOpen(false);
            }}
            className='flex-1 bg-success hover:bg-success-light'
            disabled={!castVoteWrite.write || !isConnected}
          >
            For
          </Button>
          <Button
            onClick={() => {
              castVoteWrite.write({
                args: [BigInt(proposalId), 0],
              });
              setOpen(false);
            }}
            className='flex-1 bg-destructive hover:bg-destructive/90'
            disabled={!castVoteWrite.write || !isConnected}
          >
            Against
          </Button>
        </div>

        <Button
          onClick={() => {
            castVoteWrite.write({
              args: [BigInt(proposalId), 2],
            });
            setOpen(false);
          }}
          disabled={!castVoteWrite.write || !isConnected}
          variant='outline'
        >
          Abstain
        </Button>
      </DialogContent>
    </Dialog>
  );
}
