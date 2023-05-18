import { hasLength, isInRange, matches, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { Accordion, NumberInput, Text, TextInput } from "@mantine/core";
import { governor, OptionsError } from "@openzeppelin/wizard";
import { Prism } from "@mantine/prism";
import { useAtomValue } from "jotai";
import { tokenTypeAtom } from "@/atoms";

const voteRegex = /^d+ (block|second|minute|hour|day|week|month|year)$/;

export default function Governance() {
  const [governanceContractSource, setGovernanceContractSource] = useState("");
  const tokenContractType = useAtomValue(tokenTypeAtom);
  const governanceContractForm = useForm({
    validateInputOnChange: true,
    initialValues: {
      name: "My Governor",
      votingDelay: "",
      votingPeriod: "",
      proposalThreshold: "0",
      quorum: 0,
    },
    validate: {
      name: hasLength({ min: 1 }, "Name is required"),
      votingDelay: matches(voteRegex, "Invalid delay"),
      votingPeriod: matches(voteRegex, "Invalid period"),
      proposalThreshold: (value) =>
        Number(value) > 0 ? "Invalid threshold" : null,
      quorum: isInRange(
        { min: 0, max: 100 },
        "Quorum must be between 0 and 100"
      ),
    },
  });

  useEffect(() => {
    const { name, proposalThreshold, quorum, votingDelay, votingPeriod } =
      governanceContractForm.values;

    try {
      setGovernanceContractSource(
        governor.print({
          name,
          delay: votingDelay, // e.g. "1 block"
          period: votingPeriod, // e.g. "1 week"
          proposalThreshold: proposalThreshold,
          quorumMode: "percent",
          quorumPercent: quorum,
          votes: `${tokenContractType}votes`, // e.g. "erc20votes"
        })
      );
    } catch (e: unknown) {
      if (e instanceof OptionsError) {
        console.log(e.messages);
      }
      // console.log(governanceContractForm.errors);
    }
  }, [governanceContractForm, tokenContractType]);

  return (
    <div className="grid grid-cols-6 gap-6 max-w-2xl">
      <div className="col-span-full">
        <label
          htmlFor="gov-name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <div className="mt-2">
          <TextInput
            id="gov-name"
            placeholder="Governance name"
            {...governanceContractForm.getInputProps("name")}
          />
        </div>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="voting-delay"
          className="block text-sm font-medium text-gray-700"
        >
          Voting delay
        </label>
        <div className="mt-2">
          <TextInput
            id="voting-delay"
            placeholder="1 block"
            {...governanceContractForm.getInputProps("votingDelay")}
          />
        </div>
        <Text size="xs" className="text-gray-500">
          Delay since proposal is created until voting starts.
        </Text>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="voting-period"
          className="block text-sm font-medium text-gray-700"
        >
          Voting period
        </label>
        <div className="mt-2">
          <TextInput
            id="voting-period"
            placeholder="1 week"
            {...governanceContractForm.getInputProps("votingPeriod")}
          />
        </div>
        <Text size="xs" className="text-gray-500">
          Length of period during which people can cast their vote.
        </Text>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="proposal-threshold"
          className="block text-sm font-medium text-gray-700"
        >
          Proposal threshold
        </label>
        <div className="mt-2">
          <TextInput
            id="proposal-threshold"
            placeholder="Proposal threshold"
            {...governanceContractForm.getInputProps("proposalThreshold")}
          />
        </div>
        <Text size="xs" className="text-gray-500">
          Minimum number of votes an account must have to create a proposal.
        </Text>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="quorum"
          className="block text-sm font-medium text-gray-700"
        >
          Quorum
        </label>
        <div className="mt-2">
          <NumberInput
            id="quorum"
            placeholder="Quorum"
            defaultValue={0}
            min={0}
            // formatter={(value) => `${value}%`}
            step={1}
            {...governanceContractForm.getInputProps("quorum")}
          />
        </div>
        <Text size="xs" className="text-gray-500">
          Quorum required for a proposal to pass.
        </Text>
      </div>
      <div className="col-span-full">
        <Accordion variant="contained">
          <Accordion.Item value="code">
            <Accordion.Control>Show contract code</Accordion.Control>
            <Accordion.Panel>
              <Prism language="jsx">{governanceContractSource}</Prism>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
