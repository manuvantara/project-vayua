import {
  baseURLBin,
  compile,
  CompilerAbstract,
  pathToURL,
} from "@remix-project/remix-solidity";
import { useEffect, useState } from "react";
import { SOLIDITY_COMPILER_VERSION, TEST_CONTRACTS } from "@/config/compiler";
import { showNotification } from "@mantine/notifications";
import { Button, Title, Text } from "@mantine/core";
import { ContractFactory } from "ethers";
import { TransactionReceipt } from "viem";
import { useWalletClient } from "wagmi";
import { getSigner, getProvider } from "@/config/ethers-connect";
import { handleNpmImport } from "@/utils/import-handler";

const CONTRACT_NAME_REGEX = /contract\s(\S+)\s/;
(function initSupportedSolcVersion() {
  (pathToURL as any)["soljson-v0.8.11+commit.d7f03943.js"] = baseURLBin;
})();

interface CompilerDeployerProps {
  walletConnected: boolean;
}

function CompilerDeployer({ walletConnected }: CompilerDeployerProps) {
  // Compiler
  const [source, setSource] = useState(TEST_CONTRACTS[1].content);
  const [compiling, setCompiling] = useState(false);
  const [contractName, setContractName] = useState("");
  const [compileResult, setCompileResult] = useState<CompilerAbstract>();
  useEffect(() => {
    if (source) {
      const matches = CONTRACT_NAME_REGEX.exec(source);
      if (matches && matches[1]) {
        setContractName(matches[1]);
      }
    }
  }, [source]);

  const handleCompile = async () => {
    setCompiling(true);
    try {
      const response = (await compile(
        {
          [contractName + ".sol"]: {
            content: source,
          },
        },
        {
          version: SOLIDITY_COMPILER_VERSION,
        },
        handleNpmImport
      )) as CompilerAbstract;

      if (response.data.errors) {
        showNotification({
          title: "Error",
          color: "red",
          message: response.data.errors[0].formattedMessage,
          autoClose: 5000,
        });
        return;
      }
      showNotification({
        color: "teal",
        title: "Complied successfully",
        message: "Check console.log for compilation result",
        autoClose: 5000,
      });
      console.log("All contract compileResult: ", response);
      setCompileResult(response);
    } finally {
      setCompiling(false);
    }
  };

  // Deployer
  const [withArgs, setWithArgs] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const testConstructorArguments = [
    "TORO DEP TRAI NHAT LANG",
    "TORO",
    "0.05",
    10000,
    1,
    "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/hidden.json",
  ];

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const compiledContract =
        compileResult && compileResult.getContract(contractName);
      const contractBinary =
        "0x" +
        (compiledContract && compiledContract.object.evm.bytecode.object);
      const contractABI = compiledContract && compiledContract.object.abi;
      const signer = getSigner();

      const contractFactory = new ContractFactory(
        contractABI,
        contractBinary,
        signer
      );

      let deployedContract;

      try {
        if (withArgs) {
          deployedContract = await contractFactory.deploy(
            ...testConstructorArguments
          );
        } else {
          deployedContract = await contractFactory.deploy();
        }

        // if (deployedContract) {
        //   //const txReceipt = await deployedContract.deployTransaction.wait(1);
        //   //const txReceipt = await deployedContract.deploymentTransaction;
        //   showNotification({
        //     color: "teal",
        //     title: "Contract deployed successfully",
        //     message: "Check console.log for transaction receipt",
        //     autoClose: 5000,
        //   });
        //   console.log("transactionReceipt: ", txReceipt);
        // }
      } catch (error: any) {
        showNotification({
          title: "Error",
          color: "red",
          message: error.message,
          autoClose: 5000,
        });
      }
    } finally {
      setDeploying(false);
    }
  };

  return (
    <>
      <Button onClick={handleCompile} disabled={!source} loading={compiling}>
        Compile contract
      </Button>
      <Button
        color="grape"
        onClick={handleDeploy}
        disabled={compiling || !compileResult || !walletConnected}
        //loading={deploying}
      >
        Deploy
      </Button>
    </>
  );
}

export default CompilerDeployer;
