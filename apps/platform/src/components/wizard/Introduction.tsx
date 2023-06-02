import { Text, Title } from "@mantine/core";
import { Button } from "@/components/ui/Button";

function Introduction() {
  return (
    <div className="flex flex-col-reverse gap-8 bg-white shadow-lg p-8 mt-8 border rounded-md">
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="flex flex-1 items-center flex-col relative bg-white border overflow-hidden rounded-md">
          <div className="p-6 md:p-8">
            <Title order={2} size="h4" className="mb-2">
              What is Vayua Wizard?
            </Title>
            <Text size="md" component="p" className="text-gray-500">
              Vayua Wizard is a powerful tool that allows you to effortlessly
              set up a new Decentralized Autonomous Organization (DAO) in just a
              few minutes. It is designed to be user-friendly and accessible,
              even for individuals who are new to the world of web3 and
              blockchain technology.
            </Text>
          </div>
        </div>
        <div className="flex flex-1 items-center flex-col relative bg-white border overflow-hidden rounded-md">
          <div className="p-6 md:p-8">
            <Title order={2} size="h4" className="mb-2">
              How do I get started?
            </Title>
            <Text size="md" component="p" className="text-gray-500">
              Follow these simple steps to create your own DAO! Begin the
              process of constructing your smart contracts and empower your
              community with decentralized decision-making and governance.
            </Text>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-start">
        <Title order={4} size="h3" className="mb-2 text-center tracking-tight">
          Get started by clicking the button below!
        </Title>
        <Button variant="default">Start Configuration</Button>
      </div>
    </div>
  );
}

export default Introduction;

{
  /*    <Title order={2} size="h4" className="mb-2">*/
}
{
  /*      What is Vayua Wizard?*/
}
{
  /*    </Title>*/
}
{
  /*    <Text size="md" component="p" className="text-gray-500">*/
}
{
  /*      Vayua Wizard is a powerful tool that allows you to effortlessly*/
}
{
  /*      set up a new Decentralized Autonomous Organization (DAO) in just a*/
}
{
  /*      few minutes. It is designed to be user-friendly and accessible,*/
}
{
  /*      even for individuals who are new to the world of web3 and*/
}
{
  /*      blockchain technology.*/
}
{
  /*    </Text>*/
}
{
  /*  </div>*/
}
{
  /*<Divider my="sm" />*/
}
{
  /*<div className="mt-5">*/
}
{
  /*  <Title order={3} size="h4" className="mb-2">*/
}
{
  /*    Create your DAO*/
}
{
  /*  </Title>*/
}
{
  /*  <Text size="md" component="p" className="text-gray-500">*/
}
{
  /*    Follow these simple steps to create your own DAO! Begin the*/
}
{
  /*    process of constructing your smart contracts and empower your*/
}
{
  /*    community with decentralized decision-making and governance.*/
}
{
  /*  </Text>*/
}
{
  /*</div>*/
}
