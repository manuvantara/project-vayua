import { stepsAtom } from '@/atoms';
import { Button } from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Governance from '@/components/wizard/Governance';
import SuccessfullyDeployed from '@/components/wizard/SuccessfullyDeployed';
import Token from '@/components/wizard/Token';
import { Group, Stepper as MStepper, Text, Title } from '@mantine/core';
import { useAtom } from 'jotai';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

const NUMBER_OF_STEPS = 3;

const CompilerDeployer = dynamic(
  () => import('@/components/wizard/CompilerDeployer'),
  {
    loading: () => (
      <div className="mt-16 flex w-full items-center justify-center">
        <Spinner color="#000000" size={128} />
      </div>
    ),
  },
);

export default function Stepper() {
  const [active, setActive] = useAtom(stepsAtom);
  const nextStep = () =>
    setActive((current) => (current < NUMBER_OF_STEPS ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const isFirstStep = active === 0;
  const isLastStep = active === NUMBER_OF_STEPS - 1;
  const isCompleteStep = active === NUMBER_OF_STEPS;

  return (
    <div className="pt-8">
      {isCompleteStep ? (
        <SuccessfullyDeployed />
      ) : (
        <MStepper
          active={active}
          allowNextStepsSelect={false}
          breakpoint="sm"
          onStepClick={setActive}
        >
          <MStepper.Step
            description="Configure a governance token"
            label="Step 1"
          >
            <div className="mt-6 grid grid-cols-1 gap-8 pt-6 sm:mt-10 sm:pt-10 md:grid-cols-3">
              <div>
                <Title className="mb-2" order={2} size="h5">
                  Token configuration
                </Title>
                <Text className="text-gray-500" component="p" size="sm">
                  You will need to configure how your DAO will function. This
                  includes the symbol and name of your token, the number of
                  tokens to mint, and a few other things.
                </Text>
              </div>
              <div className="col-span-2 overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="p-4 sm:p-6 md:p-8">
                  <Token />
                </div>
              </div>
            </div>
          </MStepper.Step>
          <MStepper.Step description="Configure a Governor DAO" label="Step 2">
            <div className="mt-6 grid grid-cols-1 gap-8 pt-6 sm:mt-10 sm:pt-10 md:grid-cols-3">
              <div>
                <Title className="mb-2" order={2} size="h5">
                  Governance configuration
                </Title>
                <Text className="text-gray-500" component="p" size="sm">
                  You will need to configure how your DAO will function. This
                  includes the symbol and name of your token, the number of
                  tokens to mint, and a few other things.
                </Text>
              </div>
              <div className="col-span-2 overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="p-4 sm:p-6 md:p-8">
                  <Governance />
                </div>
              </div>
            </div>
          </MStepper.Step>
          <MStepper.Step
            description=" Compile & deploy the smart contacts"
            label="Step 3"
          >
            <CompilerDeployer />
          </MStepper.Step>
        </MStepper>
      )}
      <Group className="w-full" mt="xl" position="apart">
        {!isFirstStep && !isCompleteStep ? (
          <Button onClick={prevStep} variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div></div>
        )}
        {!isLastStep && !isCompleteStep && (
          <Button onClick={nextStep} variant="default">
            Next step
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </Group>
    </div>
  );
}
