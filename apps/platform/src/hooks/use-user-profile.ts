import type { UserProfile } from '@/utils/VRC1';

import { useToast } from '@/hooks/use-toast';
import {
  VRC1_CONTRACT_ABI,
  VRC1_CONTRACT_ADDRESS,
  parseProfile,
  parseUserStarringExtension,
} from '@/utils/VRC1';
import { useEffect, useState } from 'react';
import { useAccount, useContractReads } from 'wagmi';

const vrc1Contract = {
  abi: VRC1_CONTRACT_ABI,
  address: VRC1_CONTRACT_ADDRESS as `0x${string}`,
};

export default function useUserProfile(): UserProfile | null {
  const { toast } = useToast();
  const { address, isConnecting, isDisconnected } = useAccount();

  const [hasErrored, setHasErrored] = useState(false);

  const { data, isError, isLoading } = useContractReads({
    allowFailure: false,
    contracts: [
      {
        ...vrc1Contract,
        // We're using typescript's non-null assertion operator here because we know that the address can't be null
        args: [address!],
        functionName: 'profiles',
      },
      {
        ...vrc1Contract,
        // We're using typescript's non-null assertion operator here because we know that the address can't be null
        args: [address!],
        functionName: 'profileExtensions',
      },
    ],
    // Do not fetch if the user is connecting and currently disconnected from the wallet
    enabled: !isConnecting && !isDisconnected,
    watch: !hasErrored,
  });

  useEffect(() => {
    if (isError) {
      setHasErrored(true);
      toast({
        description: 'Something went wrong while fetching your profile.',
        title: 'Error',
        variant: 'destructive',
      });
    }

    return () => {
      setHasErrored(false);
    };
  }, [isError, toast]);

  if (!data || isLoading || isError) {
    return null;
  }

  const profile = parseProfile(data[0]);
  const profileExtension = parseUserStarringExtension(data[1]);

  return {
    ...profile,
    extension: profileExtension,
  };
}
