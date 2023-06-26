import { GOVERNOR_ABI, TOKEN_ABI } from '@/utils/abi/openzeppelin-contracts';
import { useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';

export default function useUserDelegatee(
  organisationAddress: `0x${string}`,
  refetch: boolean,
) {
  const { address: account } = useAccount();

  const { data: tokenAddress, isSuccess: tokenReadSuccessfully } =
    useContractRead({
      abi: GOVERNOR_ABI,
      address: organisationAddress,
      functionName: 'token',
    });

  const delegateeRead = useContractRead({
    abi: TOKEN_ABI,
    address: tokenAddress,
    args: [account!],
    enabled: account && tokenReadSuccessfully,
    functionName: 'delegates',
  });

  useEffect(() => {
    if (refetch) {
      delegateeRead.refetch();
    }
  }, [refetch, delegateeRead]);

  return delegateeRead.data;
}
