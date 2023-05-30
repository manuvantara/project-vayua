import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "./ui/Button";

import { ethers } from "ethers";
import { usePublicClient } from "wagmi";
import { Block, parseAbiItem } from "viem";
import { shortenAddress, shortenString } from "@/utils/shorten-address";

const MIN_BLOCK_NUMBER = 21041027n;

export default function Proposals() {
  // get the governance contract address from route
  const router = useRouter();
  const govAddress = router.query.organisationAddress as `0x${string}`;

  const publicClient = usePublicClient();
  const [block, setBlock] = useState<Block>();

  const [proposals, setProposals] = useState<any[]>([]);

  const parseLogs = (logsPerCycle: any) => {
    const parsedLogs = logsPerCycle.map((log: any) => {
      const { args } = log;
      // transform args array into an object
      const proposalObject = {
        proposalId: args[0].toString(),
        proposer: args[1].toString(),
        targets: args[2],
        values: args[3].map((value: ethers.BigNumber) => value.toString()),
        signatures: args[4],
        calldatas: args[5],
        voteStart: args[6].toString(),
        voteEnd: args[7].toString(),
        description: args[8].toString(),
      };

      return proposalObject;
    });

    return parsedLogs;
  };

  const fetchLogsPerCycle = async (toBlock: bigint) => {
    const fromBlock = toBlock - 4999n;
    //console.log("Fetching logs from block", fromBlock, "to block", toBlock);
    try {
      const logsPerCycle = await publicClient.getLogs({
        address: govAddress,
        event: parseAbiItem(
          "event ProposalCreated(uint256, address, address[], uint256[], string[], bytes[], uint256, uint256, string)"
        ),
        fromBlock: fromBlock,
        toBlock: toBlock,
      });
      const parsedLogs = parseLogs(logsPerCycle);
      //console.log(parsedLogs);
      setProposals((prevProposals) => [...prevProposals, ...parsedLogs]);
    } catch (error: any) {
      console.error;
    }
  };

  const fetchLogs = async () => {
    if (!block?.number) {
      return;
    }

    let toBlock = block.number;
    while (toBlock >= MIN_BLOCK_NUMBER) {
      await fetchLogsPerCycle(toBlock);
      toBlock -= 5000n;
      window.localStorage.setItem(
        "toBlock",
        JSON.stringify(toBlock.toString())
      );
    }
  };

  //const { data: blockNumber, isError } = useBlockNumber();
  useEffect(() => {
    publicClient
      .getBlock() // https://viem.sh/docs/actions/public/getBlock.html
      .then((x) => setBlock(x))
      .catch((error) => console.log(error));
  }, [publicClient]);

  useEffect(() => {
    // const storedProposals = window.localStorage.getItem("proposals");

    // console.log("Stored proposals: ", storedProposals);
    // if (storedProposals) {
    //   setProposals(JSON.parse(storedProposals));
    // }

    //console.log("UseEffect:", block);

    fetchLogs();
  }, [block]);

  useEffect(() => {
    window.localStorage.setItem("proposals", JSON.stringify(proposals));
  }, [proposals]);

  return (
    <div className="">
      <Table>
        <TableCaption>
          Proposals for {`Governor name`} ({govAddress})
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Proposal ID</TableHead>
            <TableHead>Vote starts</TableHead>
            <TableHead>Proposer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Get more</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.proposalId}>
              <TableCell className="text-left">
                {shortenString(proposal.proposalId)}
              </TableCell>
              <TableCell className="text-left">{proposal.voteStart}</TableCell>
              <TableCell className="text-left">
                {shortenAddress(proposal.proposer)}
              </TableCell>
              <TableCell className="text-left">
                {proposal.description.slice(0, 100)}
              </TableCell>
              <TableCell className="text-left">
                <Link
                  href={{
                    pathname: `${govAddress}/proposals/${proposal.proposalId}`,
                    query: {
                      description: proposal.description,
                      proposer: proposal.proposer,
                      voteStart: proposal.voteStart,
                      targets: proposal.targets,
                      values: proposal.values,
                      // calldatas: proposal.calldatas,
                    },
                  }}
                >
                  <Button>More</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
