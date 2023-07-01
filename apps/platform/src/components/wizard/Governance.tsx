import type { FormValues } from '@/components/wizard/Stepper';
import type { UseFormReturnType } from '@mantine/form';

import { governanceContractAtom, tokenTypeAtom } from '@/atoms';
import { processContractName } from '@/utils/helpers/contract.helper';
import { Accordion, NumberInput, Select, Text, TextInput } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { OptionsError, governor } from '@openzeppelin/wizard';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

export default function Governance({
  form,
}: {
  form: UseFormReturnType<FormValues>;
}) {
  const [governanceContract, setGovernanceContract] = useAtom(
    governanceContractAtom,
  );
  const tokenContractType = useAtomValue(tokenTypeAtom);

  useEffect(() => {
    const {
      governorName,
      proposalThreshold,
      quorum,
      votingDelay,
      votingPeriod,
    } = form.values;

    try {
      setGovernanceContract({
        name: processContractName(governorName),
        source: governor.print({
          delay: `${votingDelay.number} ${votingDelay.timeInterval}`, // e.g. "1 block"
          name: governorName,
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
  }, [form, setGovernanceContract, tokenContractType]);

  return (
    <div className='grid max-w-2xl grid-cols-6 gap-6'>
      <div className='col-span-full'>
        <label
          className='block text-sm font-medium text-gray-700'
          htmlFor='gov-name'
        >
          Name
        </label>
        <div className='mt-2'>
          <TextInput
            id='gov-name'
            placeholder='Governance name'
            {...form.getInputProps('governorName')}
          />
        </div>
      </div>
      <div className='col-span-full sm:col-span-3'>
        <label
          className='block text-sm font-medium text-gray-700'
          htmlFor='voting-delay'
        >
          Voting delay
        </label>
        <div className='mt-2'>
          <NumberInput
            rightSection={
              <Select
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
                aria-label='Voting delay time interval'
                id='votingDelayTimeInterval'
                placeholder='Voting delay time interval'
                radius={0}
                {...form.getInputProps('votingDelay.timeInterval')}
              />
            }
            defaultValue={0}
            id='voting-delay'
            min={0}
            placeholder='Voting delay number'
            rightSectionWidth='50%'
            step={1}
            {...form.getInputProps('votingDelay.number')}
          />
        </div>
        <Text className='mt-1.5 text-gray-500' size='xs'>
          Delay since proposal is created until voting starts.
        </Text>
      </div>
      <div className='col-span-full sm:col-span-3'>
        <label
          className='block text-sm font-medium text-gray-700'
          htmlFor='voting-period'
        >
          Voting period
        </label>
        <div className='mt-2'>
          <NumberInput
            rightSection={
              <Select
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
                aria-label='Voting period time interval'
                id='votingPeriodTimeInterval'
                placeholder='Voting period time interval'
                radius={0}
                {...form.getInputProps('votingPeriod.timeInterval')}
              />
            }
            defaultValue={0}
            id='voting-period'
            min={0}
            placeholder='Voting period number'
            rightSectionWidth='50%'
            step={1}
            {...form.getInputProps('votingPeriod.number')}
          />
        </div>
        <Text className='mt-1.5 text-gray-500' size='xs'>
          Length of period during which people can cast their vote.
        </Text>
      </div>
      <div className='col-span-full'>
        <label
          className='block text-sm font-medium text-gray-700'
          htmlFor='proposal-threshold'
        >
          Proposal threshold
        </label>
        <div className='mt-2'>
          <NumberInput
            id='proposal-threshold'
            placeholder='Proposal threshold'
            {...form.getInputProps('proposalThreshold')}
          />
        </div>
        <Text className='mt-1.5 text-gray-500' size='xs'>
          Minimum number of votes an account must have to create a proposal.
        </Text>
      </div>
      <div className='col-span-full'>
        <label
          className='block text-sm font-medium text-gray-700'
          htmlFor='quorum'
        >
          Quorum
        </label>
        <div className='mt-2'>
          <NumberInput
            defaultValue={0}
            id='quorum'
            min={0}
            placeholder='Quorum'
            step={1}
            {...form.getInputProps('quorum')}
          />
        </div>
        <Text className='mt-1.5 text-gray-500' size='xs'>
          The quorum required for a proposal to pass in percentage. Nowadays,
          many governors often use a 4% quorum.
        </Text>
      </div>
      <div className='col-span-full'>
        <Accordion variant='contained'>
          <Accordion.Item value='code'>
            <Accordion.Control>Show contract code</Accordion.Control>
            <Accordion.Panel>
              <Prism language='jsx'>{governanceContract.source}</Prism>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
