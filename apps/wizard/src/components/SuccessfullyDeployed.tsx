import { Alert, Button, CopyButton, Text, Title } from "@mantine/core";
import { FiCopy } from "react-icons/fi";
import { shortenAddress } from "@/utils/shorten-address";
import { useAtomValue } from "jotai";
import { deployedGovernorAddressAtom, deployedTokenAddressAtom } from "@/atoms";

export default function SuccessfullyDeployed() {
  const tokenContractAddress = useAtomValue(deployedTokenAddressAtom);
  const governanceContractAddress = useAtomValue(deployedGovernorAddressAtom);

  if (!tokenContractAddress || !governanceContractAddress) {
    return (
      <div className="flex flex-col items-center mt-7 md:py-14 lg:py-20">
        <div className="max-w-lg">
          <Title order={3} size="h4" className="mb-2" ta="center">
            You have not deployed contracts yet.
          </Title>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-7 md:py-14 lg:py-20">
      <div className="max-w-lg">
        <Title order={3} size="h4" className="mb-2" ta="center">
          Congratulations! <br /> Your contracts have been deployed.
        </Title>
        <div className="mt-7 bg-white shadow-sm shadow-gray-300 overflow-hidden sm:rounded-lg p-4 sm:p-6 md:p-8">
          <Title order={4} size="h4" className="mb-2">
            Token contract
          </Title>
          <div className="flex items-center gap-3">
            <CopyButton value={tokenContractAddress}>
              {({ copied, copy }) => (
                <Button compact color={copied ? "teal" : "blue"} onClick={copy}>
                  <FiCopy />
                </Button>
              )}
            </CopyButton>
            <Text
              size="md"
              component="p"
              className="text-gray-500 whitespace-nowrap truncate"
            >
              {shortenAddress(tokenContractAddress)}
            </Text>
          </div>
        </div>
        <div className="mt-3 bg-white shadow-sm shadow-gray-300 overflow-hidden sm:rounded-lg p-4 sm:p-6 md:p-8">
          <Title order={4} size="h4" className="mb-2">
            Governance contract
          </Title>
          <div className="flex items-center gap-3">
            <CopyButton value={governanceContractAddress}>
              {({ copied, copy }) => (
                <Button compact color={copied ? "teal" : "blue"} onClick={copy}>
                  <FiCopy />
                </Button>
              )}
            </CopyButton>
            <Text
              size="md"
              component="p"
              className="text-gray-500 whitespace-nowrap truncate"
            >
              {shortenAddress(governanceContractAddress)}
            </Text>
          </div>
          <Alert title="Wait!" color="orange" className="mt-4">
            <p>Do not forget to copy your governance contract address.</p>
            <p>
              You may need to share it with your community or to find your
              deployed DAO on the Vayua platform.
            </p>
          </Alert>
        </div>
      </div>
    </div>
  );
}
