import type { Toast, ToasterToast } from '@/hooks/use-toast';
import type { SettingsFormValues } from '@/types/forms';
import type { GetServerSideProps } from 'next';

import SharedProfile from '@/components/SharedProfile';
import { VRC1_CONTRACT_ABI, VRC1_CONTRACT_ADDRESS } from '@/utils/VRC1';
import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { encodeFunctionData } from 'viem';
import { useContractWrite, useWaitForTransaction } from 'wagmi';

export default function GovernanceProfile({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const {
    data,
    isLoading: isWriteLoading,
    write,
  } = useContractWrite({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'propose',
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
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

  return (
    <div>
      <Link
        className="inline-flex items-center text-muted-foreground"
        href={`/organisations/${organisationAddress}`}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Link>
      <SharedProfile
        address={organisationAddress}
        isTransactionInProgress={isLoading || isWriteLoading}
        isTransactionSuccessful={isSuccess}
        onSubmit={handleSubmit}
        title="Edit DAO Indentity"
        type="dao"
      />
    </div>
  );
}

// Using arrow function to infer type
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Better than useRouter hook because on the client side we will always have the address
  const organisationAddress = params?.organisationAddress as `0x${string}`;

  return {
    props: {
      organisationAddress,
    },
  };
};
