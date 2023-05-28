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

import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { governorAbi, tokenAbi } from "@/utils/abi/openzeppelin-contracts";

import { isNotEmpty, useForm } from "@mantine/form";
import { DelegateVoteFormValues } from "@/types/forms";
import { useRouter } from "next/router";

export default function DelegateModal() {
  const [switchDelegateForm, setSwitchDelegateForm] = useState(true);

  const router = useRouter();
  // get the governance contract address from route
  const govAddress = router.query.organisationAddress as `0x${string}`;
  // read token address from governance
  const read = useContractRead({
    address: govAddress,
    abi: governorAbi,
    functionName: "token",
  });
  const tokenAddress: `0x${string}` = read.data as `0x${string}`;
  // get the account address from connected wallet
  const account = useAccount();
  const accountAddress = account.address as `0x${string}`;

  const delegateVotesWrite = useContractWrite({
    address: tokenAddress,
    abi: tokenAbi,
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
    router.push(`/gov/${govAddress}/#delegation`);
  };

  const closeDelegateDialog = () => {
    setSwitchDelegateForm((prevValue) => !prevValue);
    router.push(`/gov/${govAddress}`);
  };

  const delegateToSomeone = () => {
    setSwitchDelegateForm((prevValue) => !prevValue);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={openDelegateDialog}>
          Delegate
        </Button>
      </DialogTrigger>
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
                disabled={!delegateVotesWrite.write}
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
