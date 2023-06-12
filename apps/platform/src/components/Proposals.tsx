import { useEffect, useState } from "react";

import { ethers } from "ethers";
import { useContractEvent, usePublicClient } from "wagmi";
import { Block, parseAbiItem } from "viem";
import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { parseMarkdownWithYamlFrontmatter } from "@/utils/helpers/proposal.helper";
import { MarkdownFrontmatter } from "@/types/proposals";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ProposalsTable";

export const columns: ColumnDef<Proposal>[] = [
  {
    header: "Proposals",
  },
];

export type Proposal = {
  proposalId: `0x${string}`;
  proposer: `0x${string}`;
  targets: `0x${string}` | `0x${string}`[];
  values: string | string[];
  signatures: string | string[];
  calldatas: `0x${string}` | `0x${string}`[];
  voteStart: string;
  voteEnd: string;
  description: string;
};

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

export function getProposalTitle(rawDescription: string) {
  const MAX_LENGTH = 50;

  let { title } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(rawDescription);

  if (title) {
    title =
      title.length > MAX_LENGTH ? title.slice(0, MAX_LENGTH) + "..." : title;
  } else {
    title =
      rawDescription.length > MAX_LENGTH
        ? rawDescription.slice(0, MAX_LENGTH) + "..."
        : rawDescription;
  }

  return title || "";
}

export default function Proposals({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const publicClient = usePublicClient();
  const [block, setBlock] = useState<Block>();

  const [proposals, setProposals] = useState<Proposal[]>([]);

  const [scannedBlocksCounter, setScannedBlocksCounter] = useState(0);
  const [toScanBlocksCounter, setToScanBlocksCounter] = useState(0);

  function getInitialBlockFromLocalStorage(currentBlockNumber: bigint) {
    return BigInt(
      JSON.parse(
        window.localStorage.getItem(
          `${organisationAddress}initialBlockNumber`
        ) || currentBlockNumber.toString()
      )
    );
  }

  function getToBlockFromLocalStorage() {
    return BigInt(
      JSON.parse(
        window.localStorage.getItem(`${organisationAddress}toBlock`) || "0"
      )
    );
  }

  const fetchLogsPerCycle = async (fromBlock: bigint, toBlock: bigint) => {
    try {
      const logsPerCycle = await publicClient.getLogs({
        address: organisationAddress,
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

    setToScanBlocksCounter((prev) => prev + Number(toBlock - MIN_BLOCK_NUMBER));

    while (toBlock >= MIN_BLOCK_NUMBER) {
      await fetchLogsPerCycle(fromBlock, toBlock);

      toBlock -= 5000n;
      fromBlock = toBlock - 4999n;

      setScannedBlocksCounter((prev) => prev + 5000);
      setToScanBlocksCounter((prev) => prev - 5000);

      window.localStorage.setItem(
        `${organisationAddress}toBlock`,
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
        `${organisationAddress}initialBlockNumber`,
        JSON.stringify(currentBlock.toString())
      );
    }

    let fromBlock = initialBlock;
    setToScanBlocksCounter((prev) => prev + Number(currentBlock - fromBlock));
    while (fromBlock < currentBlock) {
      const toBlock =
        fromBlock + 5000n <= currentBlock ? fromBlock + 5000n : currentBlock;

      await fetchLogsPerCycle(fromBlock + 1n, toBlock);

      const blocksScanned = Number(toBlock - fromBlock);
      setScannedBlocksCounter((prev) => prev + blocksScanned);
      setToScanBlocksCounter((prev) => prev - blocksScanned);

      fromBlock += 5000n;

      window.localStorage.setItem(
        `${organisationAddress}initialBlockNumber`,
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
      `${organisationAddress}proposals`
    );
    if (storedProposals) {
      setProposals(JSON.parse(storedProposals));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      `${organisationAddress}proposals`,
      JSON.stringify(proposals)
    );
  }, [proposals]);

  // listen to proposal created event and updated proposals list real time
  useContractEvent({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    eventName: "ProposalCreated",
    listener(logs) {
      if (logs) {
        const parsedLogs = parseEvents(logs);
        setProposals((prevProposals) => [...prevProposals, ...parsedLogs]);
        if (logs[0].blockNumber) {
          window.localStorage.setItem(
            `${organisationAddress}initialBlockNumber`,
            JSON.stringify(logs[0].blockNumber.toString())
          );
        }
      }
    },
  });

  return (
    <div className="col-span-2 bg-white">
      <DataTable
        columns={columns}
        data={proposals}
        toScanBlocksCounter={toScanBlocksCounter}
        scannedBlocksCounter={scannedBlocksCounter}
        organisationAddress={organisationAddress}
      />
    </div>
  );
}
