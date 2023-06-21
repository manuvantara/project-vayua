import type { PublicClient } from 'viem';

import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { blockNumberToDate } from '@/utils/helpers/proposal.helper';
import { useState } from 'react';
import { useContractRead } from 'wagmi';

export default function useProposalSnapshot(
  publicClient: PublicClient,
  organisationAddress: `0x${string}`,
  proposalId: bigint,
): [bigint | undefined, string] {
  const [proposalSnapshotDate, setProposalSnapshotDate] = useState('');

  const { data: proposalSnapshot } = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [proposalId],
    functionName: 'proposalSnapshot',
    onSuccess(data) {
      blockNumberToDate(publicClient, data).then((date) =>
        setProposalSnapshotDate(date),
      );
    },
  });

  return [proposalSnapshot, proposalSnapshotDate];
}
