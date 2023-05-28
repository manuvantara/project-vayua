import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { GetServerSideProps } from "next";
import SharedProfile from "@/components/SharedProfile";
import { SettingsFormValues } from "@/types/forms";
import { Profile_ABI } from "@/utils/abi/profile-contract";
import { useMemo, useState } from "react";
import { governorAbi } from "@/utils/abi/openzeppelin-contracts";
import { encodeFunctionData } from "viem";
import { Toast, ToasterToast } from "@/components/ui/use-toast";

export default function GovernanceProfile({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const [formValues, setFormValues] = useState<SettingsFormValues>({
    avatar: "",
    bio: "",
    extra: "",
    location: "",
    name: "",
    website: "",
  });

  const calldata = useMemo(() => {
    console.log("updating profile");
    return encodeFunctionData({
      functionName: "setProfile",
      abi: Profile_ABI,
      args: [formValues],
    });
  }, [formValues]);

  const { config } = usePrepareContractWrite({
    address: organisationAddress,
    abi: governorAbi,
    functionName: "propose",
    args: [
      [organisationAddress],
      [0n],
      [calldata],
      "Test Profile update proposal description",
    ],
  });

  const { data, write, isLoading: isWriteLoading } = useContractWrite(config);

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
    setFormValues(values);
    // console.log("status", status);
    console.log("trying to write");
    write();
  };

  return (
    <div>
      <SharedProfile
        title="Edit DAO Indentity"
        type="governance"
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
