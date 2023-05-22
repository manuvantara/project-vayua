import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { DelegateVoteFormValues } from "@/types/forms";
import { tokenABI } from "@/utils/abi/standard";
import { TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import React, { useState } from "react";
import { useAccount, useContractWrite } from "wagmi";

interface DelegateModalProps {
  tokenAddress: `0x${string}`;
}

export default function DelegateModal({ tokenAddress }: DelegateModalProps) {
  ////////////////////////////////////////////////////////////
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

  const account = useAccount();
  ///////////////////////////////////////////////////////

  const [showDelegate, setShowDelegate] = useState(true);
  const [showDelegateSomeone, setShowDelegateSomeone] = useState(false);

  const handleDelegateDialog = () => {
    setShowDelegate(true);
    setShowDelegateSomeone(false);
  };

  const handleDelegate = () => {
    setShowDelegate((showDelegate) => !showDelegate);
    setShowDelegateSomeone((showDelegateSomeone) => !setShowDelegateSomeone);
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
          {showDelegate ? (
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
              <TextInput
                id="delegatee"
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
