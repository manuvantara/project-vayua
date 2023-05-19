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
    <div className="bg-gray-100 py-20 px-8">
      <div className="grid grid-cols-6">
        <div className="col-span-2 col-start-2 col-end-6 bg-white shadow-sm shadow-gray-300 overflow-hidden sm:rounded-lg">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-7">
              <Title order={2} size="h4" className="mb-2">
                Create your DAO
              </Title>
              <Text
                size="md"
                component="p"
                className="text-gray-500 whitespace-nowrap truncate"
              >
                We support the OpenZeppelin Governor Standard for on-chain DAOs
              </Text>
            </div>
            <Divider my="sm" />
            <div className="mt-7">
              <Title order={3} size="h5" className="mb-2">
                Basic details
              </Title>
              <div className="grid gap-6 max-w-2xl mt-5">
                <div className="col-span-full">
                  <label
                    htmlFor="dao-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <div className="mt-2">
                    <TextInput
                      id="dao-name"
                      placeholder="DAO name"
                      {...daoForm.getInputProps("name")}
                    />
                  </div>
                </div>
                <div className="col-span-full">
                  <label
                    htmlFor="dao-desc"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <div className="mt-2">
                    <Textarea
                      autosize
                      minRows={4}
                      maxRows={12}
                      id="dao-desc"
                      placeholder="DAO description"
                      {...daoForm.getInputProps("desc")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateDAO;
