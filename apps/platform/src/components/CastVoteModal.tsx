import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import Web3Button from "./Web3Button";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";

type CastVoteModalProps = {
  govAddress: `0x${string}`;
  proposalId: string;
};

export default function CastVoteModal({
  govAddress,
  proposalId,
}: CastVoteModalProps) {
  const { toast } = useToast();
  const [isDialogOpened, setIsDialogOpened] = useState(true);

  const castVoteWrite = useContractWrite({
    address: govAddress,
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
        <Web3Button loading={isTransactionLoading || castVoteWrite.isLoading}>
          Vote
        </Web3Button>
      </DialogTrigger>
      {isDialogOpened && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cast your vote</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Web3Button
              disabled={!castVoteWrite.write}
              className="flex-1"
              onClick={() => {
                castVoteWrite.write({
                  args: [BigInt(proposalId), 1],
                });
              }}
            >
              For
            </Web3Button>
            <Web3Button
              disabled={!castVoteWrite.write}
              className="flex-1"
              onClick={() => {
                castVoteWrite.write({
                  args: [BigInt(proposalId), 0],
                });
              }}
            >
              Against
            </Web3Button>
          </div>

          <Web3Button
            variant="outline"
            disabled={!castVoteWrite.write}
            onClick={() => {
              castVoteWrite.write({
                args: [BigInt(proposalId), 2],
              });
            }}
          >
            Abstain
          </Web3Button>
        </DialogContent>
      )}
    </Dialog>
  );
}
