import { contractsAtom } from '@/atoms';
import Web3Button from '@/components/Web3Button';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/hooks/use-toast';
import { SOLIDITY_COMPILER_VERSION } from '@/utils/compiler/compiler';
import { handleNpmImport } from '@/utils/compiler/import-handler';
import {
  CompilerAbstract,
  baseURLBin,
  compile,
  pathToURL,
} from '@remix-project/remix-solidity';
import { waitForTransaction } from '@wagmi/core';
import { useAtomValue } from 'jotai';
import { Check, Circle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

type Stage = {
  key?: string;
  message?: string;
  name: string;
  status: 'error' | 'in-progress' | 'pending' | 'success';
};

const INITIAL_STAGES: Stage[] = [
  {
    key: 'tokenContract',
    name: 'Compiling token contract',
    status: 'pending',
  },
  {
    key: 'tokenContractDeployment',
    name: 'Deploying token contract',
    status: 'pending',
  },
  {
    key: 'governanceContract',
    name: 'Compiling governance contract',
    status: 'pending',
  },
  {
    key: 'governanceContractDeployment',
    name: 'Deploying governance contract',
    status: 'pending',
  },
];

(function initSupportedSolcVersion() {
  (pathToURL as any)['soljson-v0.8.11+commit.d7f03943.js'] = baseURLBin;
})();

export default function CompilerDeployer() {
  const { toast } = useToast();
  const router = useRouter();

  const contracts = useAtomValue(contractsAtom);

  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [isDeploying, setIsDeploying] = useState(false);

  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const handleStart = async () => {
    setIsDeploying(true);
    const tokenCompileResponse = await handleCompile('tokenContract');

    if (!tokenCompileResponse) {
      // TODO: Create an abstraction for this
      setIsDeploying(false);
      setStages(INITIAL_STAGES);
      return;
    }

    const tokenContractAddress = await handleDeploy(
      'tokenContract',
      tokenCompileResponse,
    );

    if (!tokenContractAddress) {
      setIsDeploying(false);
      setStages(INITIAL_STAGES);
      return;
    }

    const governanceCompileResponse = await handleCompile('governanceContract');

    if (!governanceCompileResponse) {
      setIsDeploying(false);
      setStages(INITIAL_STAGES);
      return;
    }

    const governanceContractAddress = await handleDeploy(
      'governanceContract',
      governanceCompileResponse,
      tokenContractAddress,
    );

    if (tokenContractAddress && governanceContractAddress) {
      router.push({
        pathname: '/wizard/success',
        query: {
          governanceAddress: governanceContractAddress,
          tokenAddress: tokenContractAddress,
        },
      });
    }
  };

  const updateStage = (updatedStage: Stage, key: string) => {
    setStages((prevStages) => {
      return prevStages.map((stage) =>
        stage.key === key ? updatedStage : stage,
      );
    });
  };

  const handleCompile = async (
    contractType: 'governanceContract' | 'tokenContract',
  ) => {
    const contract = contracts.get(contractType);

    if (!contract?.source || !contract?.name) {
      toast({
        description:
          'We could not find a contract with the name you provided. Please try again.',
        title: 'Contract error',
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO: For now we do not think about errors, but we should in the future
      const updatedStage: Stage = {
        ...(stages.find((stage) => stage.key === contractType) as Stage),
        status: 'in-progress',
      };
      updateStage(updatedStage, contractType);

      const compileResponse = await compile(
        {
          [`${contract.name}.sol`]: {
            content: contract.source,
          },
        },
        {
          optimize: true,
          version: SOLIDITY_COMPILER_VERSION,
        },
        handleNpmImport,
      );

      // Checking for compilation errors, there are not caught by the try/catch block
      // If any errors are found, in data we will have an errors array
      if (compileResponse.data.errors) {
        // TODO: The error message is not very user friendly, we should improve it
        // TODO: Plus it's an array, we should consider showing all the errors

        toast({
          description:
            'There was an error with one of your contracts. Please try again.',
          title: 'Compilation error',
          variant: 'destructive',
        });

        return;
      }

      updatedStage.status = 'success';
      updateStage(updatedStage, contractType);
      return compileResponse;
    } catch {
      toast({
        description:
          'Unfortunately something bad has happened. Please try again, if the problem persists contact us.',
        title: 'Compilation error',
        variant: 'destructive',
      });
      return;
    }
  };

  const handleDeploy = async (
    contractType: 'governanceContract' | 'tokenContract',
    response: CompilerAbstract,
    tokenContractAddress?: `0x${string}`,
  ) => {
    const contractName = contracts.get(contractType)?.name;
    // Temporary solution, we should find a better way to do this
    const stageKey = `${contractType}Deployment`;

    if (!contractName) {
      toast({
        description:
          'We could not find a contract with the name you provided. Please try again.',
        title: 'Contract error',
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO: For now we do not think about errors, but we should in the future
      const updatedStage: Stage = {
        ...(stages.find((stage) => stage.key === stageKey) as Stage),
        status: 'in-progress',
      };
      updateStage(updatedStage, stageKey);
      const contract = response.getContract(contractName);

      if (!contract) {
        toast({
          description:
            'We could not find a contract with the name you provided. Please try again.',
          title: 'Contract error',
          variant: 'destructive',
        });
        return;
      }

      const bytecode =
        `0x${contract?.object.evm.bytecode.object}` as `0x${string}`;
      const abi = contract?.object.abi;
      const args =
        contractType === 'governanceContract' ? [tokenContractAddress] : [];

      if (!walletClient) return;

      let hash;

      try {
        hash = await walletClient.deployContract({
          abi,
          account: address,
          args,
          bytecode,
        });
      } catch (error: unknown) {
        toast({
          description: 'Transaction failed',
          title: 'Deployment error',
          variant: 'destructive',
        });
        return;
      }

      if (hash) {
        const data = await waitForTransaction({ hash });
        updatedStage.status = 'success';
        updateStage(updatedStage, stageKey);
        return data.contractAddress;
      }
    } catch {
      toast({
        description:
          'Unfortunately something bad has happened. Please try again, if the problem persists contact us.',
        title: 'Deployment error',
        variant: 'destructive',
      });
      return;
    }
  };

  return (
    <div className='grid py-20'>
      <div>
        <h3 className='mb-2 text-4xl font-semibold tracking-tight'>
          You&apos;re almost there!
        </h3>
        <p className='mb-4 text-sm font-medium text-muted-foreground'>
          We&apos;ll going to do all the heavy lifting for you. Just click the
          button below and relax.
        </p>
        <Web3Button
          disabled={isDeploying}
          onClick={handleStart}
          variant='default'
        >
          Start
        </Web3Button>
      </div>
      <div className='flex flex-col justify-center pt-10'>
        {/*We also need to handle errors, and show the user a nice error message*/}
        {stages.map((stage) => (
          <div
            className='group flex items-center justify-between gap-3 border-b py-3 last:border-none'
            data-status={stage.status}
            key={stage.name}
          >
            <h4 className='text-sm font-medium capitalize text-primary transition-opacity group-data-[status=pending]:text-muted-foreground group-data-[status=pending]:opacity-50'>
              {stage.name}
            </h4>
            <span className='flex h-8 w-8 items-center justify-center text-primary transition-opacity group-data-[status=pending]:text-muted-foreground group-data-[status=pending]:opacity-50'>
              {stage.status === 'in-progress' ? (
                <Spinner size={24} />
              ) : stage.status === 'success' ? (
                <span className='flex h-6 w-6 items-center justify-center rounded-full bg-success text-white'>
                  <Check size={16} />
                </span>
              ) : (
                <Circle size={24} />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
