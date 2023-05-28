import { Button, Group, Stepper as MStepper } from "@mantine/core";
import Configurator from "@/components/Constructor";
import CompilerDeployer from "@/components/CompilerDeployer";
import CreateDAO from "@/components/CreateDAO";
import { useAtom } from "jotai";
import { stepsAtom } from "@/atoms";
import SuccessfullyDeployed from "@/components/SuccessfullyDeployed";

const NUMBER_OF_STEPS = 3;

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
    <div className="py-12">
      <MStepper
        active={active}
        onStepClick={setActive}
        breakpoint="sm"
        allowNextStepsSelect={false}
      >
        <MStepper.Step label="First step" description="Create your DAO">
          <CreateDAO />
        </MStepper.Step>
        <MStepper.Step label="Second step" description="Configure contract">
          <Configurator />
        </MStepper.Step>
        <MStepper.Step
          label="Final step"
          description="Compile and deploy contracts"
        >
          <CompilerDeployer />
        </MStepper.Step>
        <MStepper.Completed>
          <SuccessfullyDeployed />
        </MStepper.Completed>
      </MStepper>
      <Group position="apart" mt="xl" className="max-w-3xl mx-auto w-full">
        {!isFirstStep && !isCompleteStep ? (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        ) : (
          <div></div>
        )}
        {!isLastStep && !isCompleteStep && (
          <Button onClick={nextStep}>Next step</Button>
        )}
      </Group>
    </div>
  );
}
