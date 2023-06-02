import { Text, Title } from "@mantine/core";
import { shortenAddress } from "@/utils/shorten-address";
import { useAtomValue, useSetAtom } from "jotai";
import {
  deployedGovernorAddressAtom,
  deployedTokenAddressAtom,
  stepsAtom,
} from "@/atoms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { ArrowRight, Clock } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect } from "react";

export default function SuccessfullyDeployed() {
  const setSteps = useSetAtom(stepsAtom);
  const tokenContractAddress = useAtomValue(deployedTokenAddressAtom);
  const governanceContractAddress = useAtomValue(deployedGovernorAddressAtom);

  // Set stage to 0 to reset the wizard on unmount
  useEffect(() => {
    return () => {
      setSteps(0);
    };
  }, []);

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
      <Title order={1} size="h2" className="mb-4 text-[40px]" ta="center">
        Congratulations! <br /> Your contracts have been deployed.
      </Title>
      <div className="max-w-xl">
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
      <div className="flex w-max mt-6 gap-4 items-stretch justify-center">
        <div className="bg-white flex-1 shadow-sm overflow-hidden border rounded-md p-4 md:p-6">
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
        <div className="bg-white flex-1 shadow-sm overflow-hidden border rounded-md p-4 md:p-6">
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
      <div className="mt-4">
        <Button
          asChild
          variant="secondary"
          className="bg-success-light hover:bg-success text-white"
        >
          <Link href={`/organisations/${governanceContractAddress}`}>
            View your organization
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
