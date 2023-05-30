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
import { useContractEvent, usePublicClient } from "wagmi";
import { Block, parseAbiItem } from "viem";
import { shortenAddress, shortenString } from "@/utils/shorten-address";
import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";

const MIN_BLOCK_NUMBER = 21041027n;

const parseEvents = (logs: any) => {
  const parsedLogs = logs.map((log: any) => {
    const { args } = log;

    const proposalObject = {
      proposalId: args.proposalId.toString(),
      proposer: args.proposer.toString(),
      targets: args.targets,
      values: args.values.map((value: ethers.BigNumber) => value.toString()),
      signatures: args.signatures,
      calldatas: args.calldatas,
      voteStart: args.startBlock.toString(),
      voteEnd: args.endBlock.toString(),
      description: args.description.toString(),
    };

    return proposalObject;
  });

  return parsedLogs;
};

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

export default function Proposals() {
  // get the governance contract address from route
  const router = useRouter();
  const govAddress = router.query.organisationAddress as `0x${string}`;

  const publicClient = usePublicClient();
  const [block, setBlock] = useState<Block>();

  const [proposals, setProposals] = useState<any[]>([]);

  function getInitialBlockFromLocalStorage(currentBlockNumber: bigint) {
    return BigInt(
      JSON.parse(
        window.localStorage.getItem(`${govAddress}initialBlockNumber`) ||
          currentBlockNumber.toString()
      )
    );
  }

  function getToBlockFromLocalStorage() {
    return BigInt(
      JSON.parse(window.localStorage.getItem(`${govAddress}toBlock`) || "0")
    );
  }

  const fetchLogsPerCycle = async (fromBlock: bigint, toBlock: bigint) => {
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
      setProposals((prevProposals) => [...prevProposals, ...parsedLogs]);
    } catch (error: any) {
      console.error;
    }
  };

  const fetchLogsDown = async () => {
    if (!block?.number) {
      return;
    }

    const currentBlock = block.number;
    const toBlockStored = getToBlockFromLocalStorage();

    let toBlock = toBlockStored == 0n ? currentBlock : toBlockStored;
    let fromBlock = toBlock - 4999n;

    while (toBlock >= MIN_BLOCK_NUMBER) {
      await fetchLogsPerCycle(fromBlock, toBlock);

      toBlock -= 5000n;
      fromBlock = toBlock - 4999n;

      window.localStorage.setItem(
        `${govAddress}toBlock`,
        JSON.stringify(toBlock.toString())
      );
    }
  };

  const fetchLogsUp = async () => {
    if (!block?.number) {
      return;
    }

    const currentBlock = block.number;
    const toBlockStored = getToBlockFromLocalStorage();
    const initialBlock = getInitialBlockFromLocalStorage(currentBlock);

    if (toBlockStored == 0n) {
      window.localStorage.setItem(
        `${govAddress}initialBlockNumber`,
        JSON.stringify(currentBlock.toString())
      );
    }

    let fromBlock = initialBlock;
    while (fromBlock < currentBlock) {
      const toBlock =
        fromBlock + 5000n <= currentBlock ? fromBlock + 5000n : currentBlock;

      await fetchLogsPerCycle(fromBlock + 1n, toBlock);

      fromBlock += 5000n;

      window.localStorage.setItem(
        `${govAddress}initialBlockNumber`,
        JSON.stringify(toBlock.toString())
      );
    }
  };

  useEffect(() => {
    publicClient
      .getBlock() // https://viem.sh/docs/actions/public/getBlock.html
      .then((x) => setBlock(x))
      .catch((error) => console.log(error));
  }, [publicClient]);

  useEffect(() => {
    fetchLogsDown();
    fetchLogsUp();
  }, [block]);

  useEffect(() => {
    const storedProposals = window.localStorage.getItem(
      `${govAddress}proposals`
    );
    if (storedProposals) {
      setProposals(JSON.parse(storedProposals));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      `${govAddress}proposals`,
      JSON.stringify(proposals)
    );
  }, [proposals]);

  // listen to proposal created event and updated proposals list real time
  useContractEvent({
    address: govAddress,
    abi: GOVERNOR_ABI,
    eventName: "ProposalCreated",
    listener(logs) {
      if (logs) {
        console.log(logs);
        const parsedLogs = parseEvents(logs);
        setProposals((prevProposals) => [...prevProposals, ...parsedLogs]);
        if (logs[0].blockNumber) {
          window.localStorage.setItem(
            `${govAddress}initialBlockNumber`,
            JSON.stringify(logs[0].blockNumber.toString())
          );
        }
      }
    },
  });

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
          {proposals
            .sort((a, b) =>
              BigInt(a.voteStart) > BigInt(b.voteStart) ? -1 : 1
            )
            .map((proposal) => (
              <TableRow key={proposal.proposalId}>
                <TableCell className="text-left">
                  {shortenString(proposal.proposalId)}
                </TableCell>
                <TableCell className="text-left">
                  {proposal.voteStart}
                </TableCell>
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
