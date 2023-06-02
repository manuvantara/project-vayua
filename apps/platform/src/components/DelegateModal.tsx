import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "./ui/Input";

import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { GOVERNOR_ABI, TOKEN_ABI } from "@/utils/abi/openzeppelin-contracts";

import { isNotEmpty, useForm } from "@mantine/form";
import { DelegateVoteFormValues } from "@/types/forms";
import { useRouter } from "next/router";
import { HelpingHand } from "lucide-react";
import { toast } from "./ui/use-toast";
import ClientOnly from "@/components/ClientOnly";

export default function DelegateModal() {
  const [switchDelegateForm, setSwitchDelegateForm] = useState(true);
  const [open, setOpen] = useState(false);
  const { isConnected } = useAccount();

  const router = useRouter();
  // get the governance contract address from route
  const govAddress = router.query.organisationAddress as `0x${string}`;
  // read token address from governance
  const read = useContractRead({
    address: govAddress,
    abi: GOVERNOR_ABI,
    functionName: "token",
  });
  const tokenAddress: `0x${string}` = read.data as `0x${string}`;
  // get the account address from connected wallet
  const account = useAccount();
  const accountAddress = account.address as `0x${string}`;

  const delegateVotesWrite = useContractWrite({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "delegate",
  });

  const delegateVotesForm = useForm<DelegateVoteFormValues>({
    validateInputOnBlur: true,
    validate: {
      delegatee: isNotEmpty("Please provide a delegatee address"),
    },
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
        description: "Your votes have been successfully delegated.",
      });
    }
  }, [isTransactionSuccessful]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <ClientOnly>
        <DialogTrigger asChild>
          <Button
            disabled={!isConnected}
            className="w-full text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-white"
            onClick={openDelegateDialog}
            loading={isTransactionLoading || delegateVotesWrite.isLoading}
          >
            <HelpingHand size={20} />
            <span className="ml-2">Delegate</span>
          </Button>
        </DialogTrigger>
      </ClientOnly>
      <DialogContent
        onCloseAutoFocus={closeDelegateDialog}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Delegate voting power</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {switchDelegateForm ? (
            <>
              <Button
                disabled={!delegateVotesWrite.write || !isConnected}
                onClick={() =>
                  delegateVotesWrite.write({
                    args: [accountAddress],
                  })
                }
              >
                Myself
              </Button>
              <Button variant="outline" onClick={delegateToSomeone}>
                To someone
              </Button>
            </>
          ) : (
            <>
              <Label htmlFor="delegatee">Delegatee address</Label>
              <Input
                id="delegatee"
                type="text"
                placeholder="0xC37713ef41Aff1A7ac1c3D02f6f0B3a57F8A3091"
                {...delegateVotesForm.getInputProps("delegatee")}
              />
              <Button
                disabled={!delegateVotesWrite.write || !isConnected}
                onClick={() =>
                  delegateVotesWrite.write({
                    args: [delegateVotesForm.values.delegatee],
                  })
                }
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
