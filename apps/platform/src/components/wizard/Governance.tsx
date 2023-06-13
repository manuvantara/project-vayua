import type { GovernanceFormValues } from '@/types/forms';

import { governanceContractAtom, tokenTypeAtom } from '@/atoms';
import { processContractName } from '@/utils/helpers/contract.helper';
import { Accordion, NumberInput, Select, Text, TextInput } from '@mantine/core';
import { isInRange, isNotEmpty, useForm } from '@mantine/form';
import { Prism } from '@mantine/prism';
import { OptionsError, governor } from '@openzeppelin/wizard';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

export default function Governance() {
  const [governanceContract, setGovernanceContract] = useAtom(
    governanceContractAtom,
  );
  const tokenContractType = useAtomValue(tokenTypeAtom);
  const governanceContractForm = useForm<GovernanceFormValues>({
    initialValues: {
      name: 'MyGovernor',
      proposalThreshold: '',
      quorum: 4,
      votingDelay: {
        number: 2,
        timeInterval: 'block',
      },
      votingPeriod: {
        number: 2,
        timeInterval: 'week',
      },
    },
    validate: {
      name: isNotEmpty('Name is required'),
      proposalThreshold: (value) =>
        Number(value) >= 0
          ? null
          : "Doesn't look like a valid number, try any positive number",
      quorum: isInRange(
        { max: 100, min: 0 },
        'Please enter a number between 0 and 100',
      ),
      votingDelay: {
        number: isNotEmpty('Voting delay number is required'),
      },
      votingPeriod: {
        number: isNotEmpty('Voting period number is required'),
      },
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    const { name, proposalThreshold, quorum, votingDelay, votingPeriod } =
      governanceContractForm.values;

    try {
      setGovernanceContract({
        name: processContractName(name),
        source: governor.print({
          delay: `${votingDelay.number} ${votingDelay.timeInterval}`, // e.g. "1 block"
          name,
          period: `${votingPeriod.number} ${votingPeriod.timeInterval}`, // e.g. "1 week"
          proposalThreshold: proposalThreshold,
          quorumMode: 'percent',
          quorumPercent: quorum,
          timelock: false,
          votes: `${tokenContractType}votes`, // e.g. "erc20votes"
        }),
      });
    } catch (e: unknown) {
      if (e instanceof OptionsError) {
        // do something with e.messages if needed
        // console.log((e.messages as OptionsErrorMessages));
      }
    }
  }, [governanceContractForm, setGovernanceContract, tokenContractType]);

  return (
    <div className="grid max-w-2xl grid-cols-6 gap-6">
      <div className="col-span-full">
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="gov-name"
        >
          Name
        </label>
        <div className="mt-2">
          <TextInput
            id="gov-name"
            placeholder="Governance name"
            {...governanceContractForm.getInputProps('name')}
          />
        </div>
      </div>
      <div className="col-span-full sm:col-span-3">
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="voting-delay"
        >
          Voting delay
        </label>
        <div className="mt-2">
          <NumberInput
            rightSection={
              <Select
                // className="w-fit"
                data={[
                  { label: 'Blocks', value: 'block' },
                  { label: 'Seconds', value: 'second' },
                  { label: 'Minutes', value: 'minute' },
                  { label: 'Hours', value: 'hour' },
                  { label: 'Days', value: 'day' },
                  { label: 'Weeks', value: 'week' },
                  { label: 'Months', value: 'month' },
                  { label: 'Years', value: 'year' },
                ]}
                transitionProps={{
                  duration: 200,
                  timingFunction: 'ease',
                  transition: 'pop-top-left',
                }}
                aria-label="Voting delay time interval"
                id="votingDelayTimeInterval"
                placeholder="Voting delay time interval"
                radius={0}
                {...governanceContractForm.getInputProps(
                  'votingDelay.timeInterval',
                )}
              />
            }
            defaultValue={0}
            id="voting-delay"
            min={0}
            placeholder="Voting delay number"
            rightSectionWidth="50%"
            // formatter={(value) => `${value}%`}
            step={1}
            {...governanceContractForm.getInputProps('votingDelay.number')}
          />
        </div>
        <Text className="mt-1.5 text-gray-500" size="xs">
          Delay since proposal is created until voting starts.
        </Text>
      </div>
      <div className="col-span-full sm:col-span-3">
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="voting-period"
        >
          Voting period
        </label>
        <div className="mt-2">
          <NumberInput
            rightSection={
              <Select
                // className="w-fit"
                data={[
                  { label: 'Blocks', value: 'block' },
                  { label: 'Seconds', value: 'second' },
                  { label: 'Minutes', value: 'minute' },
                  { label: 'Hours', value: 'hour' },
                  { label: 'Days', value: 'day' },
                  { label: 'Weeks', value: 'week' },
                  { label: 'Months', value: 'month' },
                  { label: 'Years', value: 'year' },
                ]}
                transitionProps={{
                  duration: 200,
                  timingFunction: 'ease',
                  transition: 'pop-top-left',
                }}
                aria-label="Voting period time interval"
                id="votingPeriodTimeInterval"
                placeholder="Voting period time interval"
                radius={0}
                {...governanceContractForm.getInputProps(
                  'votingPeriod.timeInterval',
                )}
              />
            }
            defaultValue={0}
            id="voting-period"
            min={0}
            placeholder="Voting period number"
            rightSectionWidth="50%"
            // formatter={(value) => `${value}%`}
            step={1}
            {...governanceContractForm.getInputProps('votingPeriod.number')}
          />
        </div>
        <Text className="mt-1.5 text-gray-500" size="xs">
          Length of period during which people can cast their vote.
        </Text>
      </div>
      <div className="col-span-full">
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="proposal-threshold"
        >
          Proposal threshold
        </label>
        <div className="mt-2">
          <TextInput
            id="proposal-threshold"
            placeholder="Proposal threshold"
            {...governanceContractForm.getInputProps('proposalThreshold')}
          />
        </div>
        <Text className="mt-1.5 text-gray-500" size="xs">
          Minimum number of votes an account must have to create a proposal.
        </Text>
      </div>
      <div className="col-span-full">
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="quorum"
        >
          Quorum
        </label>
        <div className="mt-2">
          <NumberInput
            defaultValue={0}
            id="quorum"
            min={0}
            placeholder="Quorum"
            // formatter={(value) => `${value}%`}
            step={1}
            {...governanceContractForm.getInputProps('quorum')}
          />
        </div>
        <Text className="mt-1.5 text-gray-500" size="xs">
          Quorum required for a proposal to pass.
        </Text>
      </div>
      <div className="col-span-full">
        <Accordion variant="contained">
          <Accordion.Item value="code">
            <Accordion.Control>Show contract code</Accordion.Control>
            <Accordion.Panel>
              <Prism language="jsx">{governanceContract.source}</Prism>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
