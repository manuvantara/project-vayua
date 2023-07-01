import { Button } from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Governance from '@/components/wizard/Governance';
import Token from '@/components/wizard/Token';
import { URI_REGEX } from '@/utils/regexes';
import { Group, Stepper as MStepper, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const NUMBER_OF_STEPS = 3;

const CompilerDeployer = dynamic(
  () => import('@/components/wizard/CompilerDeployer'),
  {
    loading: () => (
      <div className='py-20 text-center'>
        <h1 className='text-5xl font-bold tracking-tight'>Hang tight!</h1>
        <p className='mt-2 text-muted-foreground'>
          We are currently loading the compiler, so just wait a few seconds.
        </p>
        <Spinner className='mt-4' color='#000000' size={32} />
      </div>
    ),
  },
);

type TokenFormValues = {
  // Only for ERC721
  baseURI: string;
  mintNewTokens: boolean;
  premintAmount: number | string;
  tokenName: string;
  tokenSymbol: string;
  tokenType: 'erc20' | 'erc721';
};

type GovernanceFormValues = {
  governorName: string;
  proposalThreshold: string;
  quorum: number;
  votingDelay: {
    number: number;
    timeInterval: string;
  };
  votingPeriod: {
    number: number;
    timeInterval: string;
  };
};

export type FormValues = TokenFormValues & GovernanceFormValues;

export default function Stepper() {
  const [active, setActive] = useState(0);

  const form = useForm<FormValues>({
    initialValues: {
      baseURI: '',
      governorName: 'MyGovernor',
      mintNewTokens: true,
      premintAmount: '',
      proposalThreshold: '',
      quorum: 4,
      tokenName: 'MyToken',
      tokenSymbol: 'MTK',
      tokenType: 'erc20',
      votingDelay: {
        number: 2,
        timeInterval: 'block',
      },
      votingPeriod: {
        number: 2,
        timeInterval: 'week',
      },
    },
    validate: (values) => {
      if (active === 0) {
        return {
          baseURI:
            // If it's an ERC20 token, we don't need to validate the base URI, so we return null
            values.tokenType === 'erc721' &&
            values.baseURI &&
            URI_REGEX.test(values.baseURI)
              ? null
              : values.tokenType === 'erc721'
              ? "Unfortunately, it's not a valid base URI"
              : null,
          premintAmount:
            Number(values.premintAmount) > 0 || values.mintNewTokens
              ? null
              : "Premint amount can't be zero if tokens are not mintable",
          tokenName:
            values.tokenName.trim().length > 0
              ? null
              : 'Please provide a lovely name for your token',
          tokenSymbol:
            values.tokenSymbol.trim().length > 0
              ? null
              : 'Your token needs a charming symbol',
        };
      }

      if (active === 1) {
        return {
          governorName:
            values.governorName.trim().length > 0
              ? null
              : 'Governor needs a name',
          proposalThreshold:
            Number(values.proposalThreshold) >= 0
              ? null
              : 'Please provide any number greater than or equal to 0',
          quorum:
            Number(values.quorum) > 0 && Number(values.quorum) <= 100
              ? null
              : 'Quorum must be between 1 and 100',
          // Nested validation seems to be broken in Mantine
          // Or maybe I'm just doing it wrong

          // votingDelay: {
          //   number:
          //     values.votingDelay.number > 0
          //       ? null
          //       : 'Please specify a voting delay',
          // },
          // votingPeriod: {
          //   number:
          //     values.votingPeriod.number > 0
          //       ? null
          //       : 'Please specify a voting period',
          // },
        };
      }

      return {};
    },
    validateInputOnBlur: true,
  });

  const nextStep = () =>
    setActive((current) => {
      if (form.validate().hasErrors) {
        // If nested validation was enabled, there would be null errors here.
        // console.log(form.validate().errors);

        return current;
      }
      return current < NUMBER_OF_STEPS ? current + 1 : current;
    });

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const isFirstStep = active === 0;
  const isLastStep = active === NUMBER_OF_STEPS - 1;
  const isCompleteStep = active === NUMBER_OF_STEPS;

  return (
    <div className='pt-8'>
      <MStepper
        active={active}
        allowNextStepsSelect={false}
        breakpoint='sm'
        onStepClick={setActive}
      >
        <MStepper.Step
          description='Configure a governance token'
          label='Step 1'
        >
          <div className='mt-6 grid grid-cols-1 gap-8 pt-6 sm:mt-10 sm:pt-10 md:grid-cols-3'>
            <div>
              <Title className='mb-2' order={2} size='h5'>
                Token configuration
              </Title>
              <Text className='text-gray-500' component='p' size='sm'>
                You will need to configure how your DAO will function. This
                includes the symbol and name of your token, the number of tokens
                to mint, and a few other things.
              </Text>
            </div>
            <div className='col-span-2 overflow-hidden rounded-lg border bg-white shadow-sm'>
              <div className='p-4 sm:p-6 md:p-8'>
                <Token form={form} />
              </div>
            </div>
          </div>
        </MStepper.Step>
        <MStepper.Step description='Configure a Governor DAO' label='Step 2'>
          <div className='mt-6 grid grid-cols-1 gap-8 pt-6 sm:mt-10 sm:pt-10 md:grid-cols-3'>
            <div>
              <Title className='mb-2' order={2} size='h5'>
                Governance configuration
              </Title>
              <Text className='text-gray-500' component='p' size='sm'>
                You will need to configure how your DAO will function. This
                includes the symbol and name of your token, the number of tokens
                to mint, and a few other things.
              </Text>
            </div>
            <div className='col-span-2 overflow-hidden rounded-lg border bg-white shadow-sm'>
              <div className='p-4 sm:p-6 md:p-8'>
                <Governance form={form} />
              </div>
            </div>
          </div>
        </MStepper.Step>
        <MStepper.Step
          description=' Compile & deploy the smart contacts'
          label='Step 3'
        >
          <CompilerDeployer />
        </MStepper.Step>
      </MStepper>
      <Group className='w-full' mt='xl' position='apart'>
        {!isFirstStep && !isCompleteStep ? (
          <Button onClick={prevStep} variant='outline'>
            <ArrowLeftIcon className='mr-2 h-4 w-4' />
            Back
          </Button>
        ) : (
          <div></div>
        )}
        {!isLastStep && !isCompleteStep && (
          <Button onClick={nextStep} variant='default'>
            Next step
            <ArrowRightIcon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </Group>
    </div>
  );
}
