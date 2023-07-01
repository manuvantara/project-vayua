import type { SettingsFormValues } from '@/types/forms';

import { useToast } from '@/hooks/use-toast';
import { VRC1_CONTRACT_ABI, VRC1_CONTRACT_ADDRESS } from '@/utils/VRC1';
import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { encodeFunctionData } from 'viem';
import { useContractWrite, useWaitForTransaction } from 'wagmi';

export default function useOrganisationSettings(
  address: `0x${string}` | undefined,
) {
  const { toast } = useToast();

  // Can't figure out how to pass correct args to usePrepareContractWrite

  // const { config } = usePrepareContractWrite({
  //   abi: GOVERNOR_ABI,
  //   address,
  //   args: [
  //     [VRC1_CONTRACT_ADDRESS],
  //     [0n],
  //     [calldata!],
  //     `---\ntitle: Update DAO profile\n---\n\nName: ${values?.name} \n\nBio: ${values?.bio} \n\nAvatar: ${values?.avatar} \n\nLocation: ${values?.location} \n\nWebsite: ${values?.website}`,
  //   ],
  //   // Enabled when all values are set
  //   enabled: !!address && !!calldata && !!values,
  //   functionName: 'propose',
  // });

  const {
    data,
    isLoading: isWriteLoading,
    write,
  } = useContractWrite({
    abi: GOVERNOR_ABI,
    address,
    functionName: 'propose',
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleWrite = async (values: SettingsFormValues) => {
    if (!write) {
      console.log('write is undefined');
      toast({
        description: 'Please try again.',
        title: "We couldn't save your profile.",
        variant: 'destructive',
      });
      return;
    }

    const calldata = encodeFunctionData({
      abi: VRC1_CONTRACT_ABI,
      args: [values],
      functionName: 'setProfile',
    });

    write({
      args: [
        [VRC1_CONTRACT_ADDRESS],
        [0n],
        [calldata],
        `---\ntitle: Update DAO profile\n---\n\nName: ${values.name} \n\nBio: ${values.bio} \n\nAvatar: ${values.avatar} \n\nLocation: ${values.location} \n\nWebsite: ${values.website}`,
      ],
    });
  };

  return {
    handleWrite,
    isLoading,
    isSuccess,
    isWriteLoading,
  };
}
