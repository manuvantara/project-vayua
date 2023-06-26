import { governanceContractAtom, tokenContractAtom } from '@/atoms';
import { Button } from '@/components/ui/Button';
import { SOLIDITY_COMPILER_VERSION } from '@/utils/compiler/compiler';
import { handleNpmImport } from '@/utils/compiler/import-handler';
import { Box, Loader, Overlay, Text, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  CompilerAbstract,
  baseURLBin,
  compile,
  pathToURL,
} from '@remix-project/remix-solidity';
import { waitForTransaction } from '@wagmi/core';
import { useAtomValue } from 'jotai';
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
        <div className='py-8 md:px-8 md:py-14 lg:py-20'>
          <div className='flex flex-col items-center'>
            <Title className='mb-2 tracking-tight' order={2} size='h2'>
              Now it is high time to deploy constructed contracts
            </Title>
            <Text
              className='max-w-2xl text-gray-500 sm:text-center'
              component='p'
              size='md'
            >
              Let&apos;s begin by compiling the token contract. Once that is
              done, we can proceed to deploy the compiled token contract.
              Following that, we&apos;ll compile the governance contract.
              Finally, we&apos;ll deploy the compiled governance contract.
            </Text>

            <div className='mt-7 flex flex-col items-center gap-7 md:flex-row'>
              <Button
                disabled={!isConnected}
                onClick={handleDeployment}
                variant='default'
              >
                Deploy contracts
              </Button>
            </div>
          </div>
        </div>
      </Box>
    </>
  );
}

export default CompilerDeployer;
