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
import { GOVERNOR_ABI, TOKEN_ABI } from '@/utils/abi/openzeppelin-contracts';
import { isNotEmpty, useForm } from '@mantine/form';
import { HelpingHand } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { toast } from '../hooks/use-toast';
import { Input } from './ui/Input';

export default function DelegateModal() {
  const [switchDelegateForm, setSwitchDelegateForm] = useState(true);
  const [open, setOpen] = useState(false);
  const { isConnected } = useAccount();

  const router = useRouter();
  // get the governance contract address from route
  const govAddress = router.query.organisationAddress as `0x${string}`;
  // read token address from governance
  const read = useContractRead({
    abi: GOVERNOR_ABI,
    address: govAddress,
    functionName: 'token',
  });
  const tokenAddress: `0x${string}` = read.data as `0x${string}`;
  // get the account address from connected wallet
  const account = useAccount();
  const accountAddress = account.address as `0x${string}`;

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
    }
  }, [isTransactionSuccessful]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <ClientOnly>
        <DialogTrigger asChild>
          <Button
            className="w-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-white hover:text-gray-900"
            disabled={!isConnected}
            loading={isTransactionLoading || delegateVotesWrite.isLoading}
            onClick={openDelegateDialog}
          >
            <HelpingHand size={20} />
            <span className="ml-2">Delegate</span>
          </Button>
        </DialogTrigger>
      </ClientOnly>
      <DialogContent
        className="sm:max-w-[425px]"
        onCloseAutoFocus={closeDelegateDialog}
      >
        <DialogHeader>
          <DialogTitle>Delegate voting power</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {switchDelegateForm ? (
            <>
              <Button
                onClick={() =>
                  delegateVotesWrite.write({
                    args: [accountAddress],
                  })
                }
                disabled={!delegateVotesWrite.write || !isConnected}
              >
                Myself
              </Button>
              <Button onClick={delegateToSomeone} variant="outline">
                To someone
              </Button>
            </>
          ) : (
            <>
              <Label htmlFor="delegatee">Delegatee address</Label>
              <Input
                id="delegatee"
                placeholder="0xC37713ef41Aff1A7ac1c3D02f6f0B3a57F8A3091"
                type="text"
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
