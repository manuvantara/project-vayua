import { useState } from "react";

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

import { useAccount, useContractWrite } from "wagmi";
import { tokenABI } from "@/utils/abi/standard";

import { isNotEmpty, useForm } from "@mantine/form";
import { DelegateVoteFormValues } from "@/types/forms";

interface DelegateModalProps {
  tokenAddress: `0x${string}`;
}

export default function DelegateModal({ tokenAddress }: DelegateModalProps) {
  const account = useAccount();

  const delegateVotesWrite = useContractWrite({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "delegate",
  });

  const delegateVotesForm = useForm<DelegateVoteFormValues>({
    validateInputOnBlur: true,
    validate: {
      delegatee: isNotEmpty("Please provide a delegatee address"),
    },
  });

  const [showDelegateForm, setShowDelegateForm] = useState(true);

  const handleDelegateDialog = () => {
    setShowDelegateForm(true);
  };

  const handleDelegate = () => {
    setShowDelegateForm((prevValue) => !prevValue);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleDelegateDialog}>
          Delegate
        </Button>
      </DialogTrigger>
      <DialogContent
        onCloseAutoFocus={handleDelegate}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Delegate voting power</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {showDelegateForm ? (
            <>
              <Button
                disabled={!delegateVotesWrite.write}
                onClick={() =>
                  delegateVotesWrite.write({
                    args: [account.address],
                  })
                }
              >
                Myself
              </Button>
              <Button variant="outline" onClick={handleDelegate}>
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
                disabled={!delegateVotesWrite.write}
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
