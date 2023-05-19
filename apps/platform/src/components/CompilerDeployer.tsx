import { useEffect, useState } from "react";
import { showNotification } from "@mantine/notifications";
import {
  Alert,
  Box,
  Button,
  Loader,
  Overlay,
  Text,
  Title,
} from "@mantine/core";

import {
  baseURLBin,
  compile,
  CompilerAbstract,
  pathToURL,
} from "@remix-project/remix-solidity";
import { SOLIDITY_COMPILER_VERSION } from "@/config/compiler";
import {
  deployedGovernorAddressAtom,
  deployedTokenAddressAtom,
  governanceContractAtom,
  stepsAtom,
  tokenContractAtom,
} from "@/atoms";
import { handleNpmImport } from "@/utils/import-handler";

import { waitForTransaction } from "@wagmi/core";
import { useAccount, useWalletClient } from "wagmi";
import { thetaTestnet } from "@/config/theta-chains";
import { useAtomValue, useSetAtom } from "jotai";

const DEPLOYMENT_STAGES = [
  "Compiling token contract",
  "Deploying token contract",
  "Compiling governance contract",
  "Deploying governance contract",
];

function showErrorNotification(error: any, title: string) {
  showNotification({
    title: title || "Error",
    color: "red",
    message: error,
    autoClose: 5000,
  });
}

const NOTIFICATIONS = {
  SUCCESS_DEPLOYMENT: {
    title: "Contract Deployed",
    color: "teal",
    message: "Your contract has been deployed successfully!",
    autoClose: 5000,
  },
  SUCCESS_COMPILATION: {
    color: "teal",
    title: "Contract Compiled",
    message: "Your contract has been compiled successfully!",
    autoClose: 5000,
  },
};

(function initSupportedSolcVersion() {
  (pathToURL as any)["soljson-v0.8.11+commit.d7f03943.js"] = baseURLBin;
})();

function CompilerDeployer() {
  const [currentStage, setCurrentStage] = useState<string>(
    DEPLOYMENT_STAGES[0]
  );
  const [deploymentQueue, setDeploymentQueue] = useState<string[]>([
    ...DEPLOYMENT_STAGES,
  ]);
  const [deployment, setDeployment] = useState(false);

  const { isConnected } = useAccount();

  const setStepperStep = useSetAtom(stepsAtom);

  const setDeployedTokenAddress = useSetAtom(deployedTokenAddressAtom);
  const setDeployedGovernorAddress = useSetAtom(deployedGovernorAddressAtom);

  const tokenContract = useAtomValue(tokenContractAtom);
  const governanceContract = useAtomValue(governanceContractAtom);

  const { data: walletClient } = useWalletClient({
    chainId: thetaTestnet.id,
  });
  const account = useAccount();
  const contractMap: {
    [key: string]: {
      source: string;
      contractName: string;
    };
  } = {
    tokenContract: {
      source: tokenContract.source,
      contractName: tokenContract.name,
    },
    governanceContract: {
      source: governanceContract.source,
      contractName: governanceContract.name,
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
      const tokenCompileResponse = await handleCompile("tokenContract");
      // TODO: Make more readable
      const tokenContractAddress = tokenCompileResponse
        ? await handleDeploy("tokenContract", tokenCompileResponse, "")
        : null;
      // TODO: Temporary fix for token contract address type
      setDeployedTokenAddress(tokenContractAddress as `0x${string}`);
      if (tokenContractAddress) {
        const governanceCompileResponse = await handleCompile(
          "governanceContract"
        );
        const governanceContractAddress = governanceCompileResponse
          ? await handleDeploy(
              "governanceContract",
              governanceCompileResponse,
              tokenContractAddress
            )
          : null;
        // TODO: Temporary fix for governance contract address type
        setDeployedGovernorAddress(governanceContractAddress as `0x${string}`);
      }
    } catch (error: any) {
      showErrorNotification(error.message, "Unexpected error");
      return;
    } finally {
      // TODO: Think of a better way to handle this logic
      setDeploymentQueue([...DEPLOYMENT_STAGES]);
      setCurrentStage(DEPLOYMENT_STAGES[0]);
      setDeployment(false);
      setStepperStep((current) => (current < 3 ? current + 1 : current));
    }
  };

  const handleCompile = async (contractType: string) => {
    const { source, contractName } = contractMap[contractType] || {};

    if (!source || !contractName) {
      showErrorNotification(
        "Contract error",
        "Invalid contract type, name or source"
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
          version: SOLIDITY_COMPILER_VERSION,
          optimize: true,
        },
        handleNpmImport
      )) as CompilerAbstract;

      if (response.data.errors) {
        showErrorNotification(
          response.data.errors[0].formattedMessage,
          "Compilation error"
        );
        return null;
      }

      showNotification(NOTIFICATIONS.SUCCESS_COMPILATION);
      processNextStage();
      return response;
    } catch (error: any) {
      showErrorNotification(error.message, "Compilation error");
      return null;
    }
  };

  const handleDeploy = async (
    contractType: string,
    response: CompilerAbstract,
    tokenContractAddress: string
  ) => {
    const { contractName } = contractMap[contractType] || {};
    const contractArgs =
      contractType === "governanceContract" ? [tokenContractAddress] : [];

    if (!contractName) {
      showErrorNotification(
        "Contract error",
        "Invalid contract type, name or source"
      );
      return null;
    }

    try {
      const compiledContract = response && response.getContract(contractName);
      const contractBinary: `0x${string}` = `0x${compiledContract?.object.evm.bytecode.object}`;
      const contractABI = compiledContract?.object.abi;

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
          showErrorNotification(error.message, "Transaction failed");
          return null;
        }
      }
      if (tx) {
        const data = await waitForTransaction({ hash: tx });
        showNotification(NOTIFICATIONS.SUCCESS_DEPLOYMENT);
        processNextStage();
        return data.contractAddress;
      }
    } catch (error: any) {
      showErrorNotification(error.message, "Deployment error");
      return null;
    }
  };

  return (
    <>
      <Box pos="relative">
        {deployment && (
          <Overlay blur={15} center opacity={0.4}>
            <div className="flex gap-5 items-end	">
              <Loader />
              <Title order={3} size="h4" className="mb-2" color="white">
                {currentStage}
              </Title>
            </div>
          </Overlay>
        )}
        <div className="py-8 md:py-14 md:px-8 md:bg-gray-100 lg:py-20">
          <div className="flex flex-col items-center">
            <Title order={2} size="h4" className="mb-2">
              Now it is high time to deploy constructed contracts
            </Title>
            <Text
              size="md"
              component="p"
              className="text-gray-500 max-w-2xl sm:text-center"
            >
              Let's begin by compiling the token contract. Once that is done, we
              can proceed to deploy the compiled token contract. Following that,
              we'll compile the governance contract. Finally, we'll deploy the
              compiled governance contract.
            </Text>

            <div className="flex flex-col items-center gap-7 mt-7 md:flex-row">
              <Button
                className=""
                color="grape"
                onClick={handleDeployment}
                disabled={!isConnected}
              >
                Deploy contracts
              </Button>
              <Alert
                title="Check!"
                color="orange"
                className="justify-self-start"
              >
                <p>Make sure you are singed in.</p>
                <p>You will be asked to confirm 2 transactions.</p>
              </Alert>
            </div>
          </div>
        </div>
      </Box>
    </>
  );
}

export default CompilerDeployer;
