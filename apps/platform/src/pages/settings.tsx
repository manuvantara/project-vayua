import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import {
  Profile_ABI,
  PROFILE_CONTRACT_ADDRESS,
} from "@/utils/abi/profile-contract";
import SharedProfile from "@/components/SharedProfile";
import { SettingsFormValues } from "@/types/forms";
import { Toast, ToasterToast } from "@/components/ui/use-toast";

export default function ProfileSettingsPage() {
  const { address } = useAccount();

  const {
    data,
    write,
    isLoading: isWriteLoading,
  } = useContractWrite({
    address: PROFILE_CONTRACT_ADDRESS,
    abi: Profile_ABI,
    functionName: "setProfile",
  });

  const { isLoading, isSuccess, error } = useWaitForTransaction({
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
      toast({
        title: "We couldn't save your profile.",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    write({
      args: [values],
    });
  };

  return (
    <div>
      <SharedProfile
        title="Edit Identity"
        type="user"
        address={address}
        onSubmit={handleSubmit}
        isTransactionInProgress={isWriteLoading || isLoading}
        isTransactionSuccessful={isSuccess}
      />
    </div>
  );
}
