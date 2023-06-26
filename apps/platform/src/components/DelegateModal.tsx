import type { DelegateVoteFormValues } from '@/types/forms';

import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import useUserDelegatee from '@/hooks/use-user-delegatee';
import { GOVERNOR_ABI, TOKEN_ABI } from '@/utils/abi/openzeppelin-contracts';
import { NULL_ADDRESS } from '@/utils/chains/chain-config';
import { shortenAddress } from '@/utils/helpers/shorten.helper';
import { isNotEmpty, useForm } from '@mantine/form';
import { ArrowRightCircle, HelpingHand } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { toast } from '../hooks/use-toast';
import { Input } from './ui/Input';

export default function DelegateModal({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const [refetchDelegatee, setRefetchDelegatee] = useState(false);
  const delegatee = useUserDelegatee(organisationAddress, refetchDelegatee);
  const [switchDelegateForm, setSwitchDelegateForm] = useState(true);
  const [open, setOpen] = useState(false);

  // read token address from governance
  const { data: tokenAddress } = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'token',
  });
  // get the account address from connected wallet
  const { address, isConnected } = useAccount();

  const delegateVotesWrite = useContractWrite({
    abi: TOKEN_ABI,
    address: tokenAddress,
    functionName: 'delegate',
  });

  const delegateVotesForm = useForm<DelegateVoteFormValues>({
    validate: {
      delegatee: isNotEmpty('Please provide a delegatee address'),
    },
    validateInputOnBlur: true,
  });

  const openDelegateDialog = () => {
    setSwitchDelegateForm(true);
  };

  const closeDelegateDialog = () => {
    setSwitchDelegateForm((prevValue) => !prevValue);
  };

  const delegateToSomeone = () => {
    setSwitchDelegateForm((prevValue) => !prevValue);
  };

  const {
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccessful,
  } = useWaitForTransaction({
    hash: delegateVotesWrite.data?.hash,
  });

  useEffect(() => {
    if (isTransactionLoading || delegateVotesWrite.isLoading) {
      setOpen(false);
    }
  }, [isTransactionLoading, delegateVotesWrite.isLoading]);

  useEffect(() => {
    if (isTransactionSuccessful) {
      setOpen(false);
      toast({
        description: 'Your votes have been successfully delegated.',
      });
      setRefetchDelegatee(true);
    }
  }, [isTransactionSuccessful]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <ClientOnly>
        <DialogTrigger asChild>
          <Button
            className='w-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-white hover:text-gray-900'
            disabled={!isConnected}
            loading={isTransactionLoading || delegateVotesWrite.isLoading}
            onClick={openDelegateDialog}
          >
            <HelpingHand size={20} />
            <span className='ml-2'>Delegate</span>
          </Button>
        </DialogTrigger>
      </ClientOnly>
      <DialogContent
        className='sm:max-w-[425px]'
        onCloseAutoFocus={closeDelegateDialog}
      >
        <DialogHeader>
          <DialogTitle>Delegate voting power</DialogTitle>
        </DialogHeader>
        {delegatee && delegatee !== NULL_ADDRESS && switchDelegateForm && (
          <div className='flex space-x-2 pt-2'>
            <ArrowRightCircle />
            <div className='col-span-2 text-gray-500'>
              You currently delegate to{' '}
              <Link
                href={`https://testnet.ftmscan.com/address/${delegatee}`}
                target='_blank'
              >
                {shortenAddress(delegatee, 4, 4)}
              </Link>
            </div>
          </div>
        )}
        <div className='grid gap-4 py-4'>
          {switchDelegateForm ? (
            <>
              <Button
                onClick={() =>
                  delegateVotesWrite.write({
                    args: [address!],
                  })
                }
                disabled={!delegateVotesWrite.write || !isConnected || !address}
              >
                Myself
              </Button>
              <Button onClick={delegateToSomeone} variant='outline'>
                Someone
              </Button>
            </>
          ) : (
            <>
              <Label htmlFor='delegatee'>Delegatee address</Label>
              <Input
                id='delegatee'
                placeholder='0xC37713ef41Aff1A7ac1c3D02f6f0B3a57F8A3091'
                type='text'
                {...delegateVotesForm.getInputProps('delegatee')}
              />
              <Button
                onClick={() =>
                  delegateVotesWrite.write({
                    args: [delegateVotesForm.values.delegatee],
                  })
                }
                disabled={!delegateVotesWrite.write || !isConnected}
              >
                Delegate votes
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
