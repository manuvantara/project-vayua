import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { proposalStateMap } from '@/utils/proposal-states';
import { useEffect, useState } from 'react';
import { useBlockNumber, useContractRead } from 'wagmi';

export default function useProposalState(
  organisationAddress: `0x${string}`,
  proposalId: bigint,
  toWatch: boolean,
): string {
  const [proposalState, setProposalState] = useState('Unknown State');

  const stateRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [proposalId],
    functionName: 'state',
  });

  useEffect(() => {
    if (stateRead.isSuccess) {
      setProposalState(proposalStateMap[stateRead.data!]);
    }
  }, [stateRead.isSuccess, stateRead.data]);

  useBlockNumber({
    onBlock() {
      if (toWatch) {
        stateRead.refetch();
      }
    },
  });

  return proposalState;
}
