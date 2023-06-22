import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { blockNumberToDate, getApproximateFutureDate } from '@/utils/helpers/proposal.helper';
import { useEffect, useState } from 'react';
import { useBlockNumber, useContractReads, usePublicClient } from 'wagmi';

export type ProposalTimings = {
  proposedOn: bigint,
  proposedOnDate: string,
  voteEnd: bigint,
  voteEndDate: string,
  voteStart: bigint,
  voteStartDate: string,
  votingDelay: bigint,
  votingPeriod: bigint,
};

export default function useProposalTimings(
  organisationAddress: `0x${string}`,
  proposalId: bigint,
) : ProposalTimings {
  
  const govarnanceContract = {
    abi: GOVERNOR_ABI,
    address: organisationAddress
  }

  const {data: blockNumber} = useBlockNumber();
  const publicClient = usePublicClient();

  const [proposedOnDate, setProposedOnDate] = useState('');
  const [voteStartDate, setVoteStartDate] = useState('');
  const [voteEndDate, setVoteEndDate] = useState('');

  const { data, isSuccess } = useContractReads({
    allowFailure: false,
    contracts: [
      {
        ...govarnanceContract,
        args: [proposalId],
        functionName: 'proposalSnapshot',
      },
      {
        ...govarnanceContract,
        functionName: 'votingDelay',
      },
      {
        ...govarnanceContract,
        functionName: 'votingPeriod',
      },
    ],
    
  });

  useEffect(() => {
    if (isSuccess && blockNumber) {
      // isSuccess means the data was fethed for all 3 contractReads
      const [proposalSnapshot, votingDelay, votingPeriod] = data!;

      // proposed on
      const proposedOn = proposalSnapshot - votingDelay;
      blockNumberToDate(publicClient, proposedOn).then((date) =>
        setProposedOnDate(date),
      );

      // vote start
      if(proposalSnapshot > blockNumber){
        // voting starts in the future
        getApproximateFutureDate(publicClient, proposedOn, votingDelay).then((date) =>
          setVoteStartDate(date),
        );
      } else {
        // voting starts in the past or present
        blockNumberToDate(publicClient, proposalSnapshot).then((date) =>
          setVoteStartDate(date),
        );
      }
     
      // vote end
      const voteEnd = proposalSnapshot + votingPeriod;
      if(voteEnd > blockNumber){
        // voting ends in the future
        getApproximateFutureDate(publicClient, proposedOn, votingDelay + votingPeriod).then((date) =>
          setVoteEndDate(date),
        );
      } else {
        // voting ends in the past or present
        blockNumberToDate(publicClient, voteEnd).then((date) =>
          setVoteEndDate(date),
        );
      }
    }

    return () => {
      setProposedOnDate('');
      setVoteStartDate('');
      setVoteEndDate('');
    };
  }, [isSuccess, data, publicClient, blockNumber]);

  
  return {
    proposedOn: data?.[0] || BigInt(0),
    proposedOnDate: proposedOnDate,
    voteEnd: data ? data[0] + data[2] : BigInt(0),
    voteEndDate: voteEndDate,
    voteStart: data ? data[0] - data[1] : BigInt(0),
    voteStartDate: voteStartDate,
    votingDelay: data?.[1] || BigInt(0),
    votingPeriod: data?.[2] || BigInt(0),
  };
}
