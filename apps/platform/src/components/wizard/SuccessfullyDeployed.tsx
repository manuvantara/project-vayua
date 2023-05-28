import { Text, Title } from "@mantine/core";
import { shortenAddress } from "@/utils/shorten-address";
import { useAtomValue } from "jotai";
import { deployedGovernorAddressAtom, deployedTokenAddressAtom } from "@/atoms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Clock } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";

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
    <div className="flex flex-col items-center">
      <Title order={1} size="h2" className="mb-2 text-[40px]" ta="center">
        Congratulations! <br /> Your contracts have been deployed.
      </Title>
      <div className="max-w-lg bg-white">
        <Alert variant="warning">
          <Clock className="w-4 h-4 mr-2" />
          <AlertTitle>Reminder</AlertTitle>
          <AlertDescription>
            Do not forget to save the addresses of your contracts. You may need
            to share it with your community or to find your deployed DAO on the
            Vayua platform.
          </AlertDescription>
        </Alert>
      </div>
      <div className="flex gap-4 items-stretch justify-center">
        <div className="mt-7 bg-white shadow-sm overflow-hidden border rounded-md p-4 md:p-6">
          <Title order={4} size="h4" className="mb-2">
            Token contract
          </Title>
          <div className="flex items-center gap-3">
            <CopyButton value={tokenContractAddress} />
            <Text
              size="md"
              component="p"
              className="text-gray-500 whitespace-nowrap truncate"
            >
              {shortenAddress(tokenContractAddress)}
            </Text>
          </div>
        </div>
        <div className="mt-3 bg-white shadow-sm overflow-hidden border rounded-md p-4 md:p-6">
          <Title order={4} size="h4" className="mb-2">
            Governance contract
          </Title>
          <div className="flex items-center gap-3">
            <CopyButton value={governanceContractAddress} />
            <Text
              size="md"
              component="p"
              className="text-gray-500 whitespace-nowrap truncate"
            >
              {shortenAddress(governanceContractAddress)}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
