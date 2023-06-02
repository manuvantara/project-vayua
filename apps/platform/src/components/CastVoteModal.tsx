import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import Web3Button from "./Web3Button";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/Button";

type CastVoteModalProps = {
  organisationAddress: `0x${string}`;
  proposalId: string;
};

export default function CastVoteModal({
  organisationAddress,
  proposalId,
}: CastVoteModalProps) {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [isDialogOpened, setIsDialogOpened] = useState(true);

  const castVoteWrite = useContractWrite({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "castVote",
  });

  const {
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccessful,
  } = useWaitForTransaction({
    hash: castVoteWrite.data?.hash,
  });

  useEffect(() => {
    if (isTransactionLoading || castVoteWrite.isLoading) {
      setIsDialogOpened(false);
    } else {
      setIsDialogOpened(true);
    }
  }, [isTransactionLoading, castVoteWrite.isLoading]);

  useEffect(() => {
    if (isTransactionSuccessful) {
      setIsDialogOpened(false);
      toast({
        description: "Your vote has been successfully casted.",
      });
    }
  }, [isTransactionSuccessful]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Web3Button
          loading={isTransactionLoading || castVoteWrite.isLoading}
          className="w-full md:w-24"
        >
          Vote
        </Web3Button>
      </DialogTrigger>
      {isDialogOpened && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cast your vote</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              disabled={!castVoteWrite.write || !isConnected}
              className="flex-1 bg-success hover:bg-success-light"
              onClick={() => {
                castVoteWrite.write({
                  args: [BigInt(proposalId), 1],
                });
              }}
            >
              For
            </Button>
            <Button
              disabled={!castVoteWrite.write || !isConnected}
              className="flex-1 bg-destructive hover:bg-destructive/90"
              onClick={() => {
                castVoteWrite.write({
                  args: [BigInt(proposalId), 0],
                });
              }}
            >
              Against
            </Button>
          </div>

          <Button
            variant="outline"
            disabled={!castVoteWrite.write || !isConnected}
            onClick={() => {
              castVoteWrite.write({
                args: [BigInt(proposalId), 2],
              });
            }}
          >
            Abstain
          </Button>
        </DialogContent>
      )}
    </Dialog>
  );
}
