import { useEffect, useState } from "react";
import { FiCopy } from "react-icons/fi";
import { showNotification } from "@mantine/notifications";
import {
  Button,
  Title,
  Text,
  Alert,
  Box,
  Overlay,
  Loader,
  CopyButton,
} from "@mantine/core";

import {
  baseURLBin,
  compile,
  CompilerAbstract,
  pathToURL,
} from "@remix-project/remix-solidity";
import { SOLIDITY_COMPILER_VERSION, TEST_CONTRACTS } from "@/config/compiler";
import { tokenContractAtom, governanceContractAtom } from "@/atoms";
import { handleNpmImport } from "@/utils/import-handler";

import { waitForTransaction } from "@wagmi/core";
import { useAccount, useWalletClient } from "wagmi";
import { thetaTestnet } from "@/config/theta-chains";
import { useAtomValue } from "jotai";
import { shortenAddress } from "@/utils/shorten-address";

(function initSupportedSolcVersion() {
  (pathToURL as any)["soljson-v0.8.11+commit.d7f03943.js"] = baseURLBin;
})();

const DEPLOYMENT_STAGES = [
  "Compiling token contract",
  "Deploying token contract",
  "Compiling governance contract",
  "Deploying governance contract",
];
const CONTRACT_NAME_REGEX = /contract\s(\S+)\s/;
const NOTIFICATIONS = {
  ERROR_UNEXPECTED: {
    title: "Error",
    color: "red",
    message: "Unexpected error",
    autoClose: 5000,
  },
  SUCCESS_DEPLOYMENT: {
    title: "Deployed successfully",
    color: "teal",
    message: "",
    autoClose: 5000,
  },
  SUCCESS_COMPILATION: {
    color: "teal",
    title: "Compiled successfully",
    message: "",
    autoClose: 5000,
  },
  ERROR_COMPILATION: {
    title: "Error",
    color: "red",
    message: "Error while compiling",
    autoClose: 5000,
  },
  ERROR_DEPLOYMENT: {
    title: "Error",
    color: "red",
    message: "Error while deploying",
    autoClose: 5000,
  },
  ERROR_CONTRACT: {
    title: "Error",
    color: "red",
    message: "Invalid contract type, name or source",
    autoClose: 5000,
  },
  ERROR_TRANSACTION: {
    title: "Error",
    color: "red",
    message: "Transaction failed",
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

  const [tokenContractAddress, setTokenContractAddress] = useState<
    `0x${string}` | null | undefined
  >(null);
  const [governanceContractAddress, setGovernanceContractAddress] = useState<
    `0x${string}` | null | undefined
  >(null);

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
      const tokenContractAddress = tokenCompileResponse
        ? await handleDeploy("tokenContract", tokenCompileResponse, "")
        : null;
      setTokenContractAddress(tokenContractAddress);
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
        setGovernanceContractAddress(governanceContractAddress);
      }
    } catch (error) {
      showNotification(NOTIFICATIONS.ERROR_UNEXPECTED);
      return;
    } finally {
      setDeploymentQueue([...DEPLOYMENT_STAGES]);
      setCurrentStage(DEPLOYMENT_STAGES[0]);
      setDeployment(false);
    }
  };

  const handleCompile = async (contractType: string) => {
    const { source, contractName } = contractMap[contractType] || {};

    if (!source || !contractName) {
      showNotification(NOTIFICATIONS.ERROR_CONTRACT);
      return;
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
        showNotification(NOTIFICATIONS.ERROR_COMPILATION);
        console.log(response.data.errors[0].formattedMessage);
        return;
      }

      showNotification(NOTIFICATIONS.SUCCESS_COMPILATION);
      processNextStage();
      return response;
    } catch (error) {
      showNotification(NOTIFICATIONS.ERROR_COMPILATION);
      return;
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
      showNotification(NOTIFICATIONS.ERROR_CONTRACT);
      return;
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
          showNotification(NOTIFICATIONS.ERROR_TRANSACTION);
          console.log(error.message);
          return;
        }
      }
      if (tx) {
        const data = await waitForTransaction({ hash: tx });
        showNotification(NOTIFICATIONS.SUCCESS_DEPLOYMENT);
        processNextStage();
        return data.contractAddress;
      }
    } catch (error: any) {
      console.log(error.message);
      showNotification(NOTIFICATIONS.ERROR_DEPLOYMENT);
      return;
    }
  };

  return (
    <>
      <Box pos="relative">
        {deployment && (
          <Overlay blur={15} center opacity={0.4}>
            <div className="flex gap-5 items-end	">
              <Loader />
              <Title order={2} size="h4" className="mb-2" color="white">
                {currentStage}
              </Title>
            </div>
          </Overlay>
        )}
        <div className="bg-gray-100 py-20 px-8">
          {tokenContractAddress && governanceContractAddress ? (
            <div className="flex flex-col items-center	">
              <div className="max-w-lg">
                <Title order={2} size="h3" className="mb-2" ta="center">
                  Congratulations! <br /> Your contracts have been deployed.
                </Title>
                <div className="mt-7 bg-white shadow-sm shadow-gray-300 overflow-hidden sm:rounded-lg p-4 sm:p-6 md:p-8">
                  <Title order={2} size="h4" className="mb-2">
                    Token contract
                  </Title>
                  <div className="flex items-center gap-3">
                    <Text
                      size="md"
                      component="p"
                      className="text-gray-500 whitespace-nowrap truncate"
                    >
                      {shortenAddress(tokenContractAddress)}
                    </Text>
                    <CopyButton value={tokenContractAddress}>
                      {({ copied, copy }) => (
                        <Button
                          compact
                          color={copied ? "teal" : "blue"}
                          onClick={copy}
                        >
                          <FiCopy />
                        </Button>
                      )}
                    </CopyButton>
                  </div>
                </div>
                <div className="mt-3 bg-white shadow-sm shadow-gray-300 overflow-hidden sm:rounded-lg p-4 sm:p-6 md:p-8">
                  <Title order={2} size="h4" className="mb-2">
                    Governance contract
                  </Title>
                  <div className="flex items-center gap-3">
                    <Text
                      size="md"
                      component="p"
                      className="text-gray-500 whitespace-nowrap truncate"
                    >
                      {shortenAddress(governanceContractAddress)}
                    </Text>
                    <CopyButton value={governanceContractAddress}>
                      {({ copied, copy }) => (
                        <Button
                          compact
                          color={copied ? "teal" : "blue"}
                          onClick={copy}
                        >
                          <FiCopy />
                        </Button>
                      )}
                    </CopyButton>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Title order={2} size="h3" className="mb-2">
                Now it is high time to deploy constructed contracts
              </Title>
              <Text
                size="md"
                component="p"
                className="text-gray-500 max-w-2xl "
                ta="center"
              >
                Let's begin by compiling the token contract. Once that is done,
                we can proceed to deploy the compiled token contract. Following
                that, we'll compile the governance contract. Finally, we'll
                deploy the compiled governance contract.
              </Text>

              <div className="flex gap-5 mt-3 items-center">
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
                  className="justify-self-start	mt-3"
                >
                  <p>Make sure you are singed in!</p>
                  <p>You will be asked to confirm 2 transactions.</p>
                </Alert>
              </div>
            </div>
          )}
        </div>
      </Box>
    </>
  );
}

export default CompilerDeployer;
