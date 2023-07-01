import { GOVERNOR_ABI, TOKEN_ABI } from '@/utils/abi/openzeppelin-contracts';
import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';

type Votes = {
  abstain: number;
  against: number;
  for: number;
  total: number;
};

export default function useProposalVotes(
  organisationAddress: `0x${string}`,
  proposalId: bigint,
) {
  const [votes, setVotes] = useState<Votes>({
    abstain: 0,
    against: 0,
    for: 0,
    total: 0,
  });

  // token decimals
  const { data: tokenAddress, isSuccess: tokenReadSuccessfully } =
    useContractRead({
      abi: GOVERNOR_ABI,
      address: organisationAddress,
      functionName: 'token',
    });

  const { data: tokenDecimals, isSuccess: decimalsReadSuccessfully } =
    useContractRead({
      abi: TOKEN_ABI,
      address: tokenAddress,
      enabled: tokenReadSuccessfully,
      functionName: 'decimals',
    });

  const votesContractRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId)],
    functionName: 'proposalVotes',
    watch: true,
  });

  useEffect(() => {
    if (votesContractRead.isSuccess) {
      const votesAbstain = decimalsReadSuccessfully
        ? Number(votesContractRead.data![2]) / 10 ** tokenDecimals!
        : Number(votesContractRead.data![2]);

      const votesAgainst = decimalsReadSuccessfully
        ? Number(votesContractRead.data![0]) / 10 ** tokenDecimals!
        : Number(votesContractRead.data![0]);

      const votesFor = decimalsReadSuccessfully
        ? Number(votesContractRead.data![1]) / 10 ** tokenDecimals!
        : Number(votesContractRead.data![1]);

      const votes: Votes = {
        abstain: votesAbstain,
        against: votesAgainst,
        for: votesFor,
        total: votesAbstain + votesAgainst + votesFor,
      };

      setVotes(votes);
    }
  }, [
    decimalsReadSuccessfully,
    tokenDecimals,
    votesContractRead.data,
    votesContractRead.isSuccess,
  ]);

  return votes;
}
