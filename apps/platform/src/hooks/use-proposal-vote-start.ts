import type { PublicClient } from 'viem';

import { blockNumberToDate } from '@/utils/helpers/proposal.helper';
import { useEffect, useState } from 'react';


export default function useProposalVoteStart(
  publicClient: PublicClient,
  voteStart: bigint,
) {
  const [voteStartDate, setVoteStartDate] = useState('');
  useEffect(() => {
    blockNumberToDate(publicClient, voteStart).then((date) =>
      setVoteStartDate(date),
    );
  });

  return voteStartDate;
}
