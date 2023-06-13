import SharedProfile from '@/components/SharedProfile';
import { Toast, ToasterToast } from '@/components/ui/use-toast';
import { SettingsFormValues } from '@/types/forms';
import { VRC1_CONTRACT_ABI, VRC1_CONTRACT_ADDRESS } from '@/utils/VRC1';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';

export default function ProfileSettingsPage() {
  const { address } = useAccount();

  const {
    data,
    isLoading: isWriteLoading,
    write,
  } = useContractWrite({
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    functionName: 'setProfile',
  });

  const { error, isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleSubmit = async (
    values: SettingsFormValues,
    toast: ({ ...props }: Toast) => {
      dismiss: () => void;
      id: string;
      update: (props: ToasterToast) => void;
    },
  ) => {
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

  return (
    <div>
      <Link
        className="inline-flex items-center text-muted-foreground"
        href={`/`}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Link>
      <SharedProfile
        address={address as `0x${string}`}
        isTransactionInProgress={isWriteLoading || isLoading}
        isTransactionSuccessful={isSuccess}
        onSubmit={handleSubmit}
        title="Edit Identity"
        type="user"
      />
    </div>
  );
}
