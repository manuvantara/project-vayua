import { Button, Group, Stepper as MStepper } from "@mantine/core";
import { useState } from "react";
import Configurator from "@/components/Constructor";
import CompilerDeployer from "@/components/CompilerDeployer";
import CreateDAO from "@/components/CreateDAO";

export default function Stepper() {
  const [active, setActive] = useState(1);
  const nextStep = () =>
    setActive((current) => (current < 2 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const isLastStep = active === 2;
  const isFirstStep = active === 0;

  return (
    <div className="py-12">
      <MStepper active={active} onStepClick={setActive} breakpoint="sm">
        <MStepper.Step label="First step" description="Create you DAO">
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
        {/* <MStepper.Completed>
          Completed, click back button to get to previous step
        </MStepper.Completed> */}
      </MStepper>
      <Group position="apart" mt="xl" className="max-w-3xl mx-auto w-full">
        {!isFirstStep ? (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        ) : (
          <div></div>
        )}
        {!isLastStep && <Button onClick={nextStep}>Next step</Button>}
      </Group>
    </div>
  );
}
