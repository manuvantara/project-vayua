import { Button } from "./ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

import { governorAbi } from "@/utils/abi/openzeppelin-contracts";
import { useContractWrite } from "wagmi";

type CastVoteModalProps = {
  govAddress: `0x${string}`;
  proposalId: string;
};

export default function CastVoteModal({
  govAddress,
  proposalId,
}: CastVoteModalProps) {
  const castVoteWrite = useContractWrite({
    address: govAddress,
    abi: governorAbi,
    functionName: "castVote",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Vote</Button>
      </DialogTrigger>
      <DialogContent
        // onCloseAutoFocus={closeDelegateDialog}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Cast your vote</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() =>
              castVoteWrite.write({
                args: [BigInt(proposalId), 1],
              })
            }
          >
            For
          </Button>
          <Button
            className="flex-1"
            onClick={() =>
              castVoteWrite.write({
                args: [BigInt(proposalId), 0],
              })
            }
          >
            Against
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            castVoteWrite.write({
              args: [BigInt(proposalId), 2],
            })
          }
        >
          Abstain
        </Button>
      </DialogContent>
    </Dialog>
  );
}
