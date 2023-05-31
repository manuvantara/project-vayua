import { useContractWrite, useWaitForTransaction } from "wagmi";
import type { GetServerSideProps } from "next";
import SharedProfile from "@/components/SharedProfile";
import type { SettingsFormValues } from "@/types/forms";
import {
  PROFILE_CONTRACT_ADDRESS,
  PROFILE_ABI,
} from "@/utils/abi/profile-contract";
import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { encodeFunctionData } from "viem";
import type { Toast, ToasterToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GovernanceProfile({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const {
    data,
    write,
    isLoading: isWriteLoading,
  } = useContractWrite({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "propose",
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleSubmit = async (
    values: SettingsFormValues,
    toast: ({ ...props }: Toast) => {
      id: string;
      dismiss: () => void;
      update: (props: ToasterToast) => void;
    }
  ) => {
    if (!write) {
      console.log("write is undefined");
      toast({
        title: "We couldn't save your profile.",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    const calldata = encodeFunctionData({
      functionName: "setProfile",
      abi: PROFILE_ABI,
      args: [values],
    });

    write({
      args: [
        [PROFILE_CONTRACT_ADDRESS],
        [0n],
        [calldata],
        `# Update DAO profile
        ####Name: ${values.name}
        ####Bio: ${values.bio}
        ####Avatar: ${values.avatar}
        ####Location: ${values.location}
        ####Website: ${values.website}`,
      ],
    });
  };

  return (
    <div>
      <Link
        className="inline-flex items-center text-muted-foreground"
        href={`/organisations/${organisationAddress}`}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Link>
      <SharedProfile
        title="Edit DAO Indentity"
        type="dao"
        address={organisationAddress}
        onSubmit={handleSubmit}
        isTransactionInProgress={isLoading || isWriteLoading}
        isTransactionSuccessful={isSuccess}
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
