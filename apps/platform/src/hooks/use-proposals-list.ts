import type { Proposal } from '@/types/proposals';

import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { BLOCK_RANGE, MIN_BLOCK_NUMBER } from '@/utils/chains/chain-config';
import { useEffect, useState } from 'react';
import { parseAbiItem } from 'viem';
import { useBlockNumber, usePublicClient } from 'wagmi';
import { useContractEvent } from 'wagmi';

const parseEvents = (logs: any) => {
  const parsedLogs = logs.map((log: any) => {
    const { args } = log;

    const proposalObject = {
      calldatas: args.calldatas,
      description: args.description.toString(),
      proposalId: args.proposalId.toString(),
      proposer: args.proposer.toString(),
      signatures: args.signatures,
      targets: args.targets,
      values: args.values.map((value: bigint) => value.toString()),
      voteEnd: args.endBlock.toString(),
      voteStart: args.startBlock.toString(),
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
      calldatas: args[5],
      description: args[8].toString(),
      proposalId: args[0].toString(),
      proposer: args[1].toString(),
      signatures: args[4],
      targets: args[2],
      values: args[3].map((value: bigint) => value.toString()),
      voteEnd: args[7].toString(),
      voteStart: args[6].toString(),
    };

    return proposalObject;
  });

  return parsedLogs;
};

export default function useProposalsList(
  organisationAddress: `0x${string}`,
): [Proposal[], number, number] {
  const publicClient = usePublicClient();

  const { data: blockNumber } = useBlockNumber();
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const [scannedBlocksCounter, setScannedBlocksCounter] = useState(0);
  const [toScanBlocksCounter, setToScanBlocksCounter] = useState(0);

  function getInitialBlockFromLocalStorage(currentBlockNumber: bigint) {
    return BigInt(
      JSON.parse(
        window.localStorage.getItem(
          `${organisationAddress}initialBlockNumber`,
        ) || currentBlockNumber.toString(),
      ),
    );
  }

  function getToBlockFromLocalStorage() {
    return BigInt(
      JSON.parse(
        window.localStorage.getItem(`${organisationAddress}toBlock`) || '0',
      ),
    );
  }

  const fetchLogsPerCycle = async (fromBlock: bigint, toBlock: bigint) => {
    try {
      const logsPerCycle = await publicClient.getLogs({
        address: organisationAddress,
        event: parseAbiItem(
          'event ProposalCreated(uint256, address, address[], uint256[], string[], bytes[], uint256, uint256, string)',
        ),
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      const parsedLogs = parseLogs(logsPerCycle);
      setProposals((prevProposals) => [...prevProposals, ...parsedLogs]);
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchLogsDown = async (blockNumber: bigint) => {
    const currentBlock = blockNumber;
    const toBlockStored = getToBlockFromLocalStorage();

    let toBlock = toBlockStored == 0n ? currentBlock : toBlockStored;
    let fromBlock = toBlock - (BLOCK_RANGE - 1n);

    setToScanBlocksCounter((prev) => prev + Number(toBlock - MIN_BLOCK_NUMBER));

    while (toBlock >= MIN_BLOCK_NUMBER) {
      await fetchLogsPerCycle(fromBlock, toBlock);

      toBlock -= BLOCK_RANGE;
      fromBlock = toBlock - (BLOCK_RANGE - 1n);

      setScannedBlocksCounter((prev) => prev + Number(BLOCK_RANGE));
      setToScanBlocksCounter((prev) => prev - Number(BLOCK_RANGE));

      window.localStorage.setItem(
        `${organisationAddress}toBlock`,
        JSON.stringify(toBlock.toString()),
      );
    }
  };

  const fetchLogsUp = async (blockNumber: bigint) => {
    const currentBlock = blockNumber;
    const toBlockStored = getToBlockFromLocalStorage();
    const initialBlock = getInitialBlockFromLocalStorage(currentBlock);

    if (toBlockStored == 0n) {
      window.localStorage.setItem(
        `${organisationAddress}initialBlockNumber`,
        JSON.stringify(currentBlock.toString()),
      );
    }

    let fromBlock = initialBlock;
    setToScanBlocksCounter((prev) => prev + Number(currentBlock - fromBlock));
    while (fromBlock < currentBlock) {
      const toBlock =
        fromBlock + BLOCK_RANGE <= currentBlock
          ? fromBlock + BLOCK_RANGE
          : currentBlock;

      await fetchLogsPerCycle(fromBlock + 1n, toBlock);

      const blocksScanned = Number(toBlock - fromBlock);
      setScannedBlocksCounter((prev) => prev + blocksScanned);
      setToScanBlocksCounter((prev) => prev - blocksScanned);

      fromBlock += BLOCK_RANGE;

      window.localStorage.setItem(
        `${organisationAddress}initialBlockNumber`,
        JSON.stringify(toBlock.toString()),
      );
    }
  };

  useEffect(() => {
    if (blockNumber) {
      fetchLogsDown(blockNumber);
      fetchLogsUp(blockNumber);
    }
  }, [blockNumber]);

  useEffect(() => {
    const storedProposals = window.localStorage.getItem(
      `${organisationAddress}proposals`,
    );
    if (storedProposals) {
      setProposals(JSON.parse(storedProposals));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      `${organisationAddress}proposals`,
      JSON.stringify(proposals),
    );
  }, [proposals]);

  // listen to proposal created event and updated proposals list real time
  useContractEvent({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    eventName: 'ProposalCreated',
    listener(logs) {
      if (logs) {
        const parsedLogs = parseEvents(logs);
        setProposals((prevProposals) => [...prevProposals, ...parsedLogs]);
        if (logs[0].blockNumber) {
          window.localStorage.setItem(
            `${organisationAddress}initialBlockNumber`,
            JSON.stringify(logs[0].blockNumber.toString()),
          );
        }
      }
    },
  });

  return [proposals, scannedBlocksCounter, toScanBlocksCounter];
}
