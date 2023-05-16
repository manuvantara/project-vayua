import { NumberInput, Select, Switch, Text, Title } from "@mantine/core";

export default function Configurator() {
  return (
    <div className="flex mx-auto flex-col items-center justify-center max-w-3xl w-full h-full">
      <div className="pb-2 mb-2 border-b border-gray-200 w-full border-solid">
        <Title order={1} size="h2" className="mb-4">
          Configure your DAO contracts
        </Title>
        <Text size="md" component="p">
          You will need to configure how your DAO will function. This includes
          the symbol and name of your token, the number of tokens to mint, and a
          few other things.
        </Text>
      </div>
      <div className="my-4" aria-hidden />
      <Title order={2} className="w-full">
        Token configuration
      </Title>
      <div className="flex gap-4 flex-col items-center justify-center w-full">
        <div className="py-4 border-b border-gray-200 w-full border-solid">
          <Title order={3} size="h4" className="mb-2">
            Select your token type
          </Title>
          <Select
            className="w-fit"
            data={[
              { value: "nft", label: "NFT" },
              { value: "erc20", label: "ERC20" },
            ]}
            placeholder="Token type"
            transitionProps={{
              transition: "pop-top-left",
              duration: 200,
              timingFunction: "ease",
            }}
            withinPortal
          />
        </div>
        <div className="py-4 border-b border-gray-200 w-full border-solid">
          <Title order={3} size="h4" className="mb-4">
            Do you want to be able to mint tokens?
          </Title>
          <Switch
            label="Allow minting"
            // checked={allowMinting}
            // onChange={() => setAllowMinting((c) => !c)}
          />
        </div>
      </div>
      <div className="my-4" aria-hidden />
      <Title order={2} className="w-full">
        Governance configuration
      </Title>
      <div className="flex gap-4 flex-col items-center justify-center w-full">
        <div className="py-4 border-b border-gray-200 w-full border-solid">
          <Title order={3} size="h4" className="mb-2">
            What voting delay would you like to set?
          </Title>
          <Select
            className="w-fit"
            data={[
              { value: "1", label: "1 day" },
              { value: "2", label: "2 days" },
              { value: "3", label: "3 days" },
              { value: "4", label: "4 days" },
            ]}
            placeholder="Voting delay"
            transitionProps={{
              transition: "pop-top-left",
              duration: 200,
              timingFunction: "ease",
            }}
            withinPortal
          />
        </div>
        <div className="py-4 border-b border-gray-200 w-full border-solid">
          <Title order={3} size="h4" className="mb-4">
            What quorum would you like to set?
          </Title>
          <NumberInput
            description="Quorum is the minimum votes needed for a proposal to pass, expressed as a percentage of total voting power."
            defaultValue={0}
            max={100}
            min={0}
            placeholder="Quorum percentage"
            hideControls
            step={1}
            formatter={(value) => `${value}%`}
          />
        </div>
        <div className="py-4 border-b border-gray-200 w-full border-solid">
          <Title order={3} size="h4" className="mb-4">
            What proposal threshold would you like to set?
          </Title>
          <NumberInput
            type="number"
            description="Restricts proposal creation to addresses with a minimum amount of voting power."
            defaultValue={0}
            min={0}
            placeholder="Proposal threshold"
            hideControls
            step={1}
          />
        </div>
      </div>
    </div>
  );
}
