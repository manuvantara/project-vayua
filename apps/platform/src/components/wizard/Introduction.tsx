import { Button } from '@/components/ui/Button';
import { Text, Title } from '@mantine/core';

function Introduction() {
  return (
    <div className="mt-8 flex flex-col-reverse gap-8 rounded-md border bg-white p-8 shadow-lg">
      <div className="flex flex-col items-stretch gap-4 md:flex-row">
        <div className="relative flex flex-1 flex-col items-center overflow-hidden rounded-md border bg-white">
          <div className="p-6 md:p-8">
            <Title className="mb-2" order={2} size="h4">
              What is Vayua Wizard?
            </Title>
            <Text className="text-gray-500" component="p" size="md">
              Vayua Wizard is a powerful tool that allows you to effortlessly
              set up a new Decentralized Autonomous Organization (DAO) in just a
              few minutes. It is designed to be user-friendly and accessible,
              even for individuals who are new to the world of web3 and
              blockchain technology.
            </Text>
          </div>
        </div>
        <div className="relative flex flex-1 flex-col items-center overflow-hidden rounded-md border bg-white">
          <div className="p-6 md:p-8">
            <Title className="mb-2" order={2} size="h4">
              How do I get started?
            </Title>
            <Text className="text-gray-500" component="p" size="md">
              Follow these simple steps to create your own DAO! Begin the
              process of constructing your smart contracts and empower your
              community with decentralized decision-making and governance.
            </Text>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-start">
        <Title className="mb-2 text-center tracking-tight" order={4} size="h3">
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
