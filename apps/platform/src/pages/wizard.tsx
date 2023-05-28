import { Title } from "@mantine/core";
import Stepper from "@/components/wizard/Stepper";

export default function Home() {
  return (
    <div className="gap-4 p-5">
      <div className="max-w-screen-xl m-auto">
        <div className="flex justify-between items-center">
          <Title order={1} size="h3">
            Vayua Wizard
          </Title>
        </div>
        <Stepper />
      </div>
    </div>
  );
}
