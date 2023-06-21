import type { PublicClient } from 'viem';

import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { ONE_BLOCK_IN_SECONDS } from '@/utils/chains/chain-config';
import {
  blockNumberToDate,
  blockNumberToTimestamp,
  proposalTimestampToDate,
} from '@/utils/helpers/proposal.helper';
import { useState } from 'react';
import { useBlockNumber } from 'wagmi';
import { useContractRead } from 'wagmi';

async function getApproximateFutureDate(
  publicClient: PublicClient,
  start: bigint,
  interval: bigint,
) {
  const startTimestamp = await blockNumberToTimestamp(publicClient, start);
  if (!startTimestamp) {
    return 'Invalid date';
  }

  const intervalTimestamp = ONE_BLOCK_IN_SECONDS * Number(interval);
  const endTimestamp = (Number(startTimestamp) + intervalTimestamp).toString();

  return proposalTimestampToDate(endTimestamp, true);
}

export default function useProposalVoteEnd(
  publicClient: PublicClient,
  organisationAddress: `0x${string}`,
  voteStart: bigint,
  voteEnd: bigint,
) {
  const [voteEndDate, setVoteEndDate] = useState('');

  //get current block number
  useBlockNumber({
    onSuccess: async (data) => {
      if (BigInt(voteEnd) > data) {
        // the block is in the future
        votingPeriodRead.refetch();
      } else {
        // the block is in the past
        const date = await blockNumberToDate(publicClient, BigInt(voteEnd));
        setVoteEndDate(date);
      }
    },
  });

  const votingPeriodRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    enabled: false,
    functionName: 'votingPeriod',
    onSuccess: async (data) => {
      const date = await getApproximateFutureDate(
        publicClient,
        voteStart,
        data,
      );
      setVoteEndDate(date);
    },
  });

  return voteEndDate;
}
