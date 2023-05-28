import { CreateDAOFormValues } from "@/types/forms";
import { TextInput, Textarea, Title, Text, Divider } from "@mantine/core";
import { isInRange, isNotEmpty, matches, useForm } from "@mantine/form";

function CreateDAO() {
  const daoForm = useForm<CreateDAOFormValues>({
    validateInputOnBlur: true,
    initialValues: {
      name: "AAVE",
      desc: "Aave DAO is a community-driven governance model that enables token holders to propose and vote on changes to the Aave protocol on Ethereum.",
    },
    validate: {
      name: isNotEmpty("Please enter a name"),
      desc: isNotEmpty("Please enter a description"),
    },
  });

  return (
    <div className="py-8 md:bg-gray-100 md:py-14 md:px-8 lg:py-20">
      <div className="max-w-2xl bg-white shadow-sm shadow-gray-300 overflow-hidden sm:rounded-lg mx-auto">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-5">
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
          <Divider my="sm" />
          <div className="mt-5">
            <Title order={3} size="h4" className="mb-2">
              Create your DAO
            </Title>
            <Text size="md" component="p" className="text-gray-500">
              Follow these simple steps to create your own DAO! Begin the
              process of constructing your smart contracts and empower your
              community with decentralized decision-making and governance.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateDAO;
