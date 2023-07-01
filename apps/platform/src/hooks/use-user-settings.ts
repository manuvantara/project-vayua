import type { SettingsFormValues } from '@/types/forms';

import { useToast } from '@/hooks/use-toast';
import { VRC1_CONTRACT_ABI, VRC1_CONTRACT_ADDRESS } from '@/utils/VRC1';
import { useContractWrite, useWaitForTransaction } from 'wagmi';

export default function useUserSettings() {
  const { toast } = useToast();

  const {
    data,
    isLoading: isWriteLoading,
    write,
  } = useContractWrite({
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    functionName: 'setProfile',
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleWrite = async (values: SettingsFormValues) => {
    if (!write) {
      toast({
        description: 'Please try again.',
        title: "We couldn't save your profile.",
        variant: 'destructive',
      });
      return;
    }

    write({
      args: [values],
    });
  };

  return {
    handleWrite,
    isLoading,
    isSuccess,
    isWriteLoading,
  };
}
