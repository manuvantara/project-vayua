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
import { useContractEvent, useContractRead } from 'wagmi';

type Votes = {
  abstain: number;
  against: number;
  for: number;
  total: number;
};

export default function useProposalVotes(
  organisationAddress: `0x${string}`,
  proposalId: bigint,
  tokenDecimals: number | undefined,
) {
  const [votes, setVotes] = useState<Votes>({
    abstain: 0,
    against: 0,
    for: 0,
    total: 0,
  });

  const votesContractRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId)],
    functionName: 'proposalVotes',
    onSuccess(data) {
      const decimals = tokenDecimals || 18;
      const votes: Votes = {
        abstain: Number(data[2]) / 10 ** decimals,
        against: Number(data[0]) / 10 ** decimals,
        for: Number(data[1]) / 10 ** decimals,
        total: 0,
      };
      votes.total = votes.for + votes.against + votes.abstain;
      setVotes(votes);
    },
  });

  // listen to cast vote event and read votes again if such an event was emitted
  useContractEvent({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    eventName: 'VoteCast',
    listener: (logs) => {
      if (logs.some((log) => log.args.proposalId === proposalId)) {
        votesContractRead.refetch();
      }
    },
  });

  return votes;
}
