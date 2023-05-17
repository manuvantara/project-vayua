import { useForm } from "@mantine/form";
import { useState } from "react";
import { TEST_CONTRACT_1 } from "@/config/compiler";
import { NumberInput, Text } from "@mantine/core";

export default function Governance() {
  const governanceContractForm = useForm({
    initialValues: {
      votingDelay: 0,
      votingPeriod: 0,
      proposalThreshold: 0,
      quorum: 0,
    },
  });

  const [governanceContractSource, setGovernanceContractSource] =
    useState(TEST_CONTRACT_1);

  return (
    <div className="grid grid-cols-6 gap-6 max-w-2xl">
      <div className="col-span-4">
        <label
          htmlFor="voting-delay"
          className="block text-sm font-medium text-gray-700"
        >
          Voting delay (needs review)
        </label>
        <div className="mt-2">
          <NumberInput
            id="voting-delay"
            placeholder="Voting delay"
            defaultValue={0}
            min={0}
            {...governanceContractForm.getInputProps("votingDelay")}
          />
        </div>
        <Text size="xs" className="text-gray-500">
          The number of blocks to wait before a vote can be executed. (needs
          review)
        </Text>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="voting-period"
          className="block text-sm font-medium text-gray-700"
        >
          Voting period (needs review)
        </label>
        <div className="mt-2">
          <NumberInput
            id="voting-period"
            placeholder="Voting period"
            defaultValue={0}
            min={0}
            {...governanceContractForm.getInputProps("votingPeriod")}
          />
        </div>
        <Text size="xs" className="text-gray-500">
          The number of blocks that a vote will be open for. (needs review)
        </Text>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="proposal-threshold"
          className="block text-sm font-medium text-gray-700"
        >
          Proposal threshold (needs review)
        </label>
        <div className="mt-2">
          <NumberInput
            id="proposal-threshold"
            placeholder="Proposal threshold"
            defaultValue={0}
            min={0}
            {...governanceContractForm.getInputProps("proposalThreshold")}
          />
        </div>
        <Text size="xs" className="text-gray-500">
          The minimum number of tokens required to create a proposal.
        </Text>
      </div>
      <div className="col-span-4">
        <label
          htmlFor="quorum"
          className="block text-sm font-medium text-gray-700"
        >
          Quorum (needs review)
        </label>
        <div className="mt-2">
          <NumberInput
            id="quorum"
            placeholder="Quorum"
            defaultValue={0}
            min={0}
            formatter={(value) => `${value}%`}
            step={1}
            {...governanceContractForm.getInputProps("quorum")}
          />
        </div>
        <Text size="xs" className="text-gray-500">
          Quorum is the minimum votes needed for a proposal to pass, expressed
          as a percentage of total voting power. (needs review)
        </Text>
      </div>
    </div>
  );
}
