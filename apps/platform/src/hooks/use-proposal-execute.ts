import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { setExecuteWriteArgs } from '@/utils/helpers/proposal.helper';
import { useEffect } from 'react';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { toast } from './use-toast';

export default function useProposalExecute(
  organisationAddress: `0x${string}`,
  proposalState: string,
  targets: `0x${string}` | `0x${string}`[],
  values: string | string[],
  calldatas: `0x${string}` | `0x${string}`[],
  description: string,
): {
  loading: boolean;
  write: (() => void) | undefined;
} {
  const executeWritePrepare = usePrepareContractWrite({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: setExecuteWriteArgs(targets, values, calldatas, description),
    enabled: proposalState === 'Succeeded',
    functionName: 'execute',
    value: Array.isArray(values)
      ? values
          .map((val) => BigInt(val))
          .reduce((acc, curr) => acc + curr, BigInt(0))
      : BigInt(values),
  });
  const executeWrite = useContractWrite(executeWritePrepare.config);

  // execute transaction processing (loading and success)
  const {
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccessful,
  } = useWaitForTransaction({
    hash: executeWrite.data?.hash,
  });

  useEffect(() => {
    if (isTransactionSuccessful) {
      toast({
        description: 'Execute action successfully applied.',
      });
    }
  }, [isTransactionSuccessful]);

  return {
    loading: isTransactionLoading || executeWrite.isLoading,
    write: executeWrite.write,
  };
}
