import { Text, Title } from "@mantine/core";
import Token from "@/components/Token";
import Governance from "@/components/Governance";

export default function Configurator() {
  return (
    <div className="bg-gray-100 py-20 px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Title order={2} size="h5" className="mb-2">
            Token configuration
          </Title>
          <Text size="sm" component="p" className="text-gray-500">
            You will need to configure how your DAO will function. This includes
            the symbol and name of your token, the number of tokens to mint, and
            a few other things.
          </Text>
        </div>
        <div className="col-span-2 bg-white shadow-sm shadow-gray-300 overflow-hidden sm:rounded-lg">
          <div className="p-4 sm:p-6 md:p-8">
            <Token />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 mt-10 border-t border-gray-300">
        <div>
          <Title order={2} size="h5" className="mb-2">
            Governance configuration
          </Title>
          <Text size="sm" component="p" className="text-gray-500">
            You will need to configure how your DAO will function. This includes
            the symbol and name of your token, the number of tokens to mint, and
            a few other things.
          </Text>
        </div>
        <div className="col-span-2 bg-white shadow-sm shadow-gray-300 overflow-hidden sm:rounded-lg">
          <div className="p-4 sm:p-6 md:p-8">
            <Governance />
          </div>
        </div>
      </div>
    </div>
  );
}
