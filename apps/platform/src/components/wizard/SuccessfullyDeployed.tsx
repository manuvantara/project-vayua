import {
  deployedGovernorAddressAtom,
  deployedTokenAddressAtom,
  stepsAtom,
} from '@/atoms';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { shortenAddress } from '@/utils/helpers/shorten.helper';
import { Text, Title } from '@mantine/core';
import { useAtomValue, useSetAtom } from 'jotai';
import { ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

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
      <div className="mt-7 flex flex-col items-center md:py-14 lg:py-20">
        <div className="max-w-lg">
          <Title className="mb-2" order={3} size="h4" ta="center">
            You have not deployed contracts yet.
          </Title>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Title className="mb-4 text-[40px]" order={1} size="h2" ta="center">
        Congratulations! <br /> Your contracts have been deployed.
      </Title>
      <div className="max-w-xl">
        <Alert variant="warning">
          <Clock className="mr-2 h-4 w-4" />
          <AlertTitle>Reminder</AlertTitle>
          <AlertDescription>
            Do not forget to save the addresses of your contracts. You may need
            to share it with your community or to find your deployed DAO on the
            Vayua platform.
          </AlertDescription>
        </Alert>
      </div>
      <div className="mt-6 flex w-max items-stretch justify-center gap-4">
        <div className="flex-1 overflow-hidden rounded-md border bg-white p-4 shadow-sm md:p-6">
          <Title className="mb-2" order={4} size="h4">
            Token contract
          </Title>
          <div className="flex items-center gap-3">
            <CopyButton value={tokenContractAddress} />
            <Text
              className="truncate whitespace-nowrap text-gray-500"
              component="p"
              size="md"
            >
              {shortenAddress(tokenContractAddress)}
            </Text>
          </div>
        </div>
        <div className="flex-1 overflow-hidden rounded-md border bg-white p-4 shadow-sm md:p-6">
          <Title className="mb-2" order={4} size="h4">
            Governance contract
          </Title>
          <div className="flex items-center gap-3">
            <CopyButton value={governanceContractAddress} />
            <Text
              className="truncate whitespace-nowrap text-gray-500"
              component="p"
              size="md"
            >
              {shortenAddress(governanceContractAddress)}
            </Text>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Button
          asChild
          className="bg-success-light text-white hover:bg-success"
          variant="secondary"
        >
          <Link href={`/organisations/${governanceContractAddress}`}>
            View your organization
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
