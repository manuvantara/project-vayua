import { Group, Stepper as MStepper, Text, Title } from "@mantine/core";
import { useAtom } from "jotai";
import { stepsAtom } from "@/atoms";
import SuccessfullyDeployed from "@/components/wizard/SuccessfullyDeployed";
import Governance from "@/components/wizard/Governance";
import Token from "@/components/wizard/Token";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Spinner from "@/components/ui/Spinner";

const NUMBER_OF_STEPS = 3;

const CompilerDeployer = dynamic(
  () => import("@/components/wizard/CompilerDeployer"),
  {
    loading: () => (
      <div className="flex items-center justify-center w-full mt-16">
        <Spinner size={128} color="#000000" />
      </div>
    ),
  }
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
          onStepClick={setActive}
          breakpoint="sm"
          allowNextStepsSelect={false}
        >
          <MStepper.Step
            label="Step 1"
            description="Configure a governance token"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 mt-6 sm:pt-10 sm:mt-10">
              <div>
                <Title order={2} size="h5" className="mb-2">
                  Token configuration
                </Title>
                <Text size="sm" component="p" className="text-gray-500">
                  You will need to configure how your DAO will function. This
                  includes the symbol and name of your token, the number of
                  tokens to mint, and a few other things.
                </Text>
              </div>
              <div className="col-span-2 bg-white shadow-sm border overflow-hidden rounded-lg">
                <div className="p-4 sm:p-6 md:p-8">
                  <Token />
                </div>
              </div>
            </div>
          </MStepper.Step>
          <MStepper.Step label="Step 2" description="Configure a Governor DAO">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 mt-6 sm:pt-10 sm:mt-10">
              <div>
                <Title order={2} size="h5" className="mb-2">
                  Governance configuration
                </Title>
                <Text size="sm" component="p" className="text-gray-500">
                  You will need to configure how your DAO will function. This
                  includes the symbol and name of your token, the number of
                  tokens to mint, and a few other things.
                </Text>
              </div>
              <div className="col-span-2 bg-white shadow-sm border overflow-hidden rounded-lg">
                <div className="p-4 sm:p-6 md:p-8">
                  <Governance />
                </div>
              </div>
            </div>
          </MStepper.Step>
          <MStepper.Step
            label="Step 3"
            description=" Compile & deploy the smart contacts"
          >
            <CompilerDeployer />
          </MStepper.Step>
        </MStepper>
      )}
      <Group position="apart" mt="xl" className="w-full">
        {!isFirstStep && !isCompleteStep ? (
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
        ) : (
          <div></div>
        )}
        {!isLastStep && !isCompleteStep && (
          <Button variant="default" onClick={nextStep}>
            Next step
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        )}
      </Group>
    </div>
  );
}
