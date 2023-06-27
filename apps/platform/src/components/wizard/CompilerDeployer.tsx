import { governanceContractAtom, tokenContractAtom } from '@/atoms';
import { Button } from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { SOLIDITY_COMPILER_VERSION } from '@/utils/compiler/compiler';
import { handleNpmImport } from '@/utils/compiler/import-handler';
import { Box, Loader, Overlay, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  CompilerAbstract,
  baseURLBin,
  compile,
  pathToURL,
} from '@remix-project/remix-solidity';
import { waitForTransaction } from '@wagmi/core';
import { useAtomValue } from 'jotai';
import { Circle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { fantomTestnet } from 'wagmi/chains';

const DEPLOYMENT_STAGES = [
  'Compiling token contract',
  'Deploying token contract',
  'Compiling governance contract',
  'Deploying governance contract',
];

function showErrorNotification(error: any, title: string) {
  showNotification({
    autoClose: 5000,
    color: 'red',
    message: error,
    title: title || 'Error',
  });
}

function showSuccessNotification(tokenType: string, phase: string) {
  let contractTypeMessage = '';
  if (tokenType === 'governanceContract') {
    contractTypeMessage = 'governance';
  } else if (tokenType === 'tokenContract') {
    contractTypeMessage = 'token';
  }

  let successMessage = '';
  switch (phase) {
    case 'compilation':
      successMessage = `Your ${contractTypeMessage} contract has been compiled successfully!`;
      break;
    case 'deployment':
      successMessage = `Your ${contractTypeMessage} contract has been deployed successfully!`;
      break;
    default:
      successMessage = 'The action was successful!';
  }

  showNotification({
    autoClose: 5000,
    color: 'teal',
    message: successMessage,
    title: 'Success',
  });
}

(function initSupportedSolcVersion() {
  (pathToURL as any)['soljson-v0.8.11+commit.d7f03943.js'] = baseURLBin;
})();

function CompilerDeployer() {
  const router = useRouter();

  const [currentStage, setCurrentStage] = useState<string>(
    DEPLOYMENT_STAGES[0],
  );
  const [deploymentQueue, setDeploymentQueue] = useState<string[]>([
    ...DEPLOYMENT_STAGES,
  ]);
  const [deployment, setDeployment] = useState(false);

  const { isConnected } = useAccount();

  const tokenContract = useAtomValue(tokenContractAtom);
  const governanceContract = useAtomValue(governanceContractAtom);

  const { data: walletClient } = useWalletClient({
    chainId: fantomTestnet.id,
  });
  const account = useAccount();
  const contractMap: {
    [key: string]: {
      contractName: string;
      source: string;
    };
  } = {
    governanceContract: {
      contractName: governanceContract.name,
      source: governanceContract.source,
    },
    tokenContract: {
      contractName: tokenContract.name,
      source: tokenContract.source,
    },
  };

  const processNextStage = () => {
    setDeploymentQueue((prevQueue) => prevQueue.slice(1, prevQueue.length));
  };

  useEffect(() => {
    if (deploymentQueue.length > 0) {
      setCurrentStage(deploymentQueue[0]);
    }
  }, [deploymentQueue]);

  const handleDeployment = async () => {
    setDeployment(true);
    try {
      const tokenCompileResponse = await handleCompile('tokenContract');
      // TODO: Make more readable
      const tokenContractAddress = tokenCompileResponse
        ? await handleDeploy('tokenContract', tokenCompileResponse, '')
        : null;
      if (tokenContractAddress) {
        const governanceCompileResponse = await handleCompile(
          'governanceContract',
        );
        const governanceContractAddress = governanceCompileResponse
          ? await handleDeploy(
              'governanceContract',
              governanceCompileResponse,
              tokenContractAddress,
            )
          : null;

        if (tokenContractAddress && governanceContractAddress) {
          showSuccessNotification('all', 'deployment');
          router.push({
            pathname: '/wizard/success',
            query: {
              governanceAddress: governanceContractAddress,
              tokenAddress: tokenContractAddress,
            },
          });
        }
      }
    } catch (error: any) {
      showErrorNotification(error.message, 'Unexpected error');
      return;
    } finally {
      console.log('finally');
      // TODO: Think of a better way to handle this logic
      setDeploymentQueue([...DEPLOYMENT_STAGES]);
      setCurrentStage(DEPLOYMENT_STAGES[0]);
      setDeployment(false);
    }
  };

  const handleCompile = async (contractType: string) => {
    const { contractName, source } = contractMap[contractType] || {};

    if (!source || !contractName) {
      showErrorNotification(
        'Contract error',
        'Invalid contract type, name or source',
      );
      return null;
    }

    try {
      const response = (await compile(
        {
          [`${contractName}.sol`]: {
            content: source,
          },
        },
        {
          optimize: true,
          version: SOLIDITY_COMPILER_VERSION,
        },
        handleNpmImport,
      )) as CompilerAbstract;

      if (response.data.errors) {
        showErrorNotification(
          response.data.errors[0].formattedMessage,
          'Compilation error',
        );
        return null;
      }
      showSuccessNotification(contractType, 'compilation');
      processNextStage();
      return response;
    } catch (error: any) {
      showErrorNotification(error.message, 'Compilation error');
      return null;
    }
  };

  const handleDeploy = async (
    contractType: string,
    response: CompilerAbstract,
    tokenContractAddress: string,
  ) => {
    const { contractName } = contractMap[contractType] || {};
    const contractArgs =
      contractType === 'governanceContract' ? [tokenContractAddress] : [];

    if (!contractName) {
      showErrorNotification(
        'Contract error',
        'Invalid contract type, name or source',
      );
      return null;
    }

    try {
      const compiledContract = response && response.getContract(contractName);
      const contractBinary: `0x${string}` = `0x${compiledContract?.object.evm.bytecode.object}`;
      const contractABI = compiledContract?.object.abi;

      if (
        !contractABI ||
        contractBinary == `0x${undefined}` ||
        !compiledContract
      ) {
        showErrorNotification(
          'Contract error',
          'Could not find compiled contract',
        );
        return null;
      }

      let tx;
      if (walletClient) {
        try {
          tx = await walletClient.deployContract({
            abi: contractABI,
            account: account.address,
            args: contractArgs,
            bytecode: contractBinary,
          });
        } catch (error: any) {
          showErrorNotification(error.message, 'Transaction failed');
          return null;
        }
      }
      if (tx) {
        const data = await waitForTransaction({ hash: tx });
        showSuccessNotification(contractType, 'deployment');
        processNextStage();
        return data.contractAddress;
      }
    } catch (error: any) {
      showErrorNotification(error.message, 'Deployment error');
      return null;
    }
  };

  return (
    <>
      <Box pos='relative'>
        {deployment && (
          <Overlay blur={8} center fixed opacity={0.4}>
            <div className='flex items-end gap-5'>
              <Loader />
              <Title className='mb-2' color='white' order={3} size='h4'>
                {currentStage}
              </Title>
            </div>
          </Overlay>
        )}
        <div className='grid grid-cols-2 py-20'>
          <div>
            <h3 className='mb-2 text-4xl font-semibold tracking-tight'>
              You&apos;re almost there!
            </h3>
            <p className='text-sm font-medium text-muted-foreground'>
              We&apos;ll going to do all the heavy lifting for you. Just click
              the button below and relax.
            </p>
            <Button
              className='mt-4'
              disabled={!isConnected}
              onClick={handleDeployment}
              variant='default'
            >
              Deploy
            </Button>
          </div>
          <div className='flex flex-col justify-center pt-10'>
            {DEPLOYMENT_STAGES.map((stage) => (
              <div
                className='group flex items-center justify-between gap-3 border-b py-3 last:border-none'
                // TODO: Mocked this for now, need to implement
                data-status={stage === currentStage ? 'in-progress' : 'pending'}
                key={stage}
              >
                <span className='text-sm font-medium capitalize text-primary group-data-[status=pending]:text-muted-foreground group-data-[status=pending]:opacity-50'>
                  {stage}
                </span>
                <span className='flex h-8 w-8 items-center justify-center text-primary group-data-[status=pending]:text-muted-foreground group-data-[status=pending]:opacity-50'>
                  {stage === currentStage ? (
                    <Spinner size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Box>
    </>
  );
}

export default CompilerDeployer;
