
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
  const { data: tokenAddress, isSuccess: readDecimals } = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'token',
  });

  const { data: tokenDecimals } = useContractRead({
    abi: TOKEN_ABI,
    address: tokenAddress,
    enabled: readDecimals,
    functionName: 'decimals',
  });

  const votesContractRead = useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [BigInt(proposalId)],
    functionName: 'proposalVotes',
    watch: true
  });

  useEffect(() => {
    if(votesContractRead.isSuccess){
      const decimals = tokenDecimals || 18;
      const votes: Votes = {
        abstain: Number(votesContractRead.data![2]) / 10 ** decimals,
        against: Number(votesContractRead.data![0]) / 10 ** decimals,
        for: Number(votesContractRead.data![1]) / 10 ** decimals,
        total: 0,
      };
      votes.total = votes.for + votes.against + votes.abstain;
      setVotes(votes);
    }
  }, [tokenDecimals, votesContractRead.data, votesContractRead.isSuccess]);

  return votes;
}
