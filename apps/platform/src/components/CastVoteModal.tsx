import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { useToast } from '@/hooks/use-toast';
import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { useEffect, useState } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';

import Web3Button from './Web3Button';
import { Button } from './ui/Button';

type CastVoteModalProps = {
  organisationAddress: `0x${string}`;
  proposalId: string;
};

export default function CastVoteModal({
  organisationAddress,
  proposalId,
}: CastVoteModalProps) {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [isDialogOpened, setIsDialogOpened] = useState(true);

  const castVoteWrite = useContractWrite({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'castVote',
  });

  const {
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccessful,
  } = useWaitForTransaction({
    hash: castVoteWrite.data?.hash,
  });

  useEffect(() => {
    if (isTransactionLoading || castVoteWrite.isLoading) {
      setIsDialogOpened(false);
    } else {
      setIsDialogOpened(true);
    }
  }, [isTransactionLoading, castVoteWrite.isLoading]);

  useEffect(() => {
    if (isTransactionSuccessful) {
      setIsDialogOpened(false);
      toast({
        description: 'Your vote has been successfully casted.',
      });
    }
  }, [isTransactionSuccessful]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Web3Button
          className='w-full md:w-24'
          loading={isTransactionLoading || castVoteWrite.isLoading}
        >
          Vote
        </Web3Button>
      </DialogTrigger>
      {isDialogOpened && (
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Cast your vote</DialogTitle>
          </DialogHeader>
          <div className='flex gap-2'>
            <Button
              onClick={() => {
                castVoteWrite.write({
                  args: [BigInt(proposalId), 1],
                });
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
            }}
            disabled={!castVoteWrite.write || !isConnected}
            variant='outline'
          >
            Abstain
          </Button>
        </DialogContent>
      )}
    </Dialog>
  );
}
