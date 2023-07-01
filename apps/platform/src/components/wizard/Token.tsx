import type { FormValues } from '@/components/wizard/Stepper';
import type { UseFormReturnType } from '@mantine/form';

import { tokenContractAtom, tokenTypeAtom } from '@/atoms';
import { processContractName } from '@/utils/helpers/contract.helper';
import {
  Accordion,
  NumberInput,
  Select,
  Switch,
  TextInput,
} from '@mantine/core';
import { Prism } from '@mantine/prism';
import { erc20, erc721 } from '@openzeppelin/wizard';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

export default function Token({
  form,
}: {
  form: UseFormReturnType<FormValues>;
}) {
  const [tokenContract, setTokenContract] = useAtom(tokenContractAtom);
  const setTokenType = useSetAtom(tokenTypeAtom);

  useEffect(() => {
    const {
      baseURI,
      mintNewTokens,
      premintAmount,
      tokenName,
      tokenSymbol,
      tokenType,
    } = form.values;
    let contract: string;

    try {
      if (tokenType === 'erc20') {
        contract = erc20.print({
          mintable: mintNewTokens,
          name: tokenName,
          premint: String(premintAmount),
          symbol: tokenSymbol,
          votes: true,
        });
      } else {
        contract = erc721.print({
          baseUri: form.isValid() ? baseURI : '',
          incremental: true,
          mintable: true,
          name: tokenName,
          symbol: tokenSymbol,
          votes: true,
        });
      }
    } catch (error) {
      console.log(error);
      return;
    }

    setTokenContract({
      name: processContractName(tokenName),
      source: contract,
    });
  }, [setTokenContract, form.values]);

  // Can't use select on change handler because it's being used by form hook
  useEffect(() => {
    setTokenType(form.values.tokenType);
  }, [setTokenType, form.values.tokenType]);

  return (
    <div className='grid max-w-2xl grid-cols-6 gap-6'>
      <div className='col-span-4'>
        <label
          className='block text-sm font-medium text-gray-700'
          htmlFor='token-type'
        >
          Select your token type
        </label>
        <div className='mt-2'>
          <Select
            data={[
              { label: 'NFT', value: 'erc721' },
              { label: 'ERC20', value: 'erc20' },
            ]}
            transitionProps={{
              duration: 200,
              timingFunction: 'ease',
              transition: 'pop-top-left',
            }}
            className='w-fit'
            id='token-type'
            placeholder='Token type'
            {...form.getInputProps('tokenType')}
          />
        </div>
      </div>
      <div className='col-span-full'>
        <label
          className='block text-sm font-medium text-gray-700'
          htmlFor='token-name'
        >
          How you want to name your token?
        </label>
        <div className='mt-2'>
          <TextInput
            id='token-name'
            placeholder='Vayua Metaverse Token'
            {...form.getInputProps('tokenName')}
          />
        </div>
      </div>
      <div className='col-span-full'>
        <label
          className='block text-sm font-medium text-gray-700'
          htmlFor='token-name-symbol'
        >
          What is the symbol of your token?
        </label>
        <div className='mt-2'>
          <TextInput
            id='token-name-symbol'
            placeholder='VAYUA'
            {...form.getInputProps('tokenSymbol')}
          />
        </div>
      </div>
      {form.values.tokenType === 'erc20' ? (
        <div className='col-span-full'>
          <label
            className='block text-sm font-medium text-gray-700'
            htmlFor='amount-of-tokens-to-mint'
          >
            Amount of tokens to premint
          </label>
          <div className='mt-2'>
            <NumberInput
              id='amount-of-tokens-to-mint'
              min={0}
              placeholder='0'
              {...form.getInputProps('premintAmount')}
            />
          </div>
        </div>
      ) : (
        <div className='col-span-full'>
          <label
            className='block text-sm font-medium text-gray-700'
            htmlFor='base-uri'
          >
            Base URI for your NFTs
          </label>
          <div className='mt-2'>
            <TextInput
              id='base-uri'
              placeholder='https://my-nft-collection.com/'
              {...form.getInputProps('baseURI')}
            />
          </div>
        </div>
      )}
      {form.values.tokenType === 'erc20' && (
        <div className='col-span-4'>
          <label
            className='block text-sm font-medium text-gray-700'
            htmlFor='mint-tokens'
          >
            Do you want to mint new tokens?
          </label>
          <div className='mt-2'>
            <Switch
              id='mint-tokens'
              {...form.getInputProps('mintNewTokens', {
                type: 'checkbox',
              })}
            />
          </div>
        </div>
      )}
      <div className='col-span-full'>
        <Accordion variant='contained'>
          <Accordion.Item value='code'>
            <Accordion.Control>Show contract code</Accordion.Control>
            <Accordion.Panel>
              <Prism language='jsx'>{tokenContract.source}</Prism>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
