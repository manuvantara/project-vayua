import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import SharedProfile from "@/components/SharedProfile";
import { SettingsFormValues } from "@/types/forms";
import { Toast, ToasterToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VRC1_CONTRACT_ABI, VRC1_CONTRACT_ADDRESS } from "@/utils/VRC1";

export default function ProfileSettingsPage() {
  const { address } = useAccount();

  const {
    data,
    write,
    isLoading: isWriteLoading,
  } = useContractWrite({
    address: VRC1_CONTRACT_ADDRESS,
    abi: VRC1_CONTRACT_ABI,
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
      <Link
        className="inline-flex items-center text-muted-foreground"
        href={`/`}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Link>
      <SharedProfile
        title="Edit Identity"
        type="user"
        address={address as `0x${string}`}
        onSubmit={handleSubmit}
        isTransactionInProgress={isWriteLoading || isLoading}
        isTransactionSuccessful={isSuccess}
      />
    </div>
  );
}
