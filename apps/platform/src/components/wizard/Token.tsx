import type { TokenFormValues } from '@/types/forms';

import { tokenContractAtom, tokenTypeAtom } from '@/atoms';
import { processContractName } from '@/utils/helpers/contract.helper';
import { URI_REGEX } from '@/utils/regexes';
import {
  Accordion,
  NumberInput,
  Select,
  Switch,
  TextInput,
} from '@mantine/core';
import { isNotEmpty, matches, useForm } from '@mantine/form';
import { Prism } from '@mantine/prism';
import { erc20, erc721 } from '@openzeppelin/wizard';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

export default function Token() {
  const [tokenContract, setTokenContract] = useAtom(tokenContractAtom);
  const setTokenType = useSetAtom(tokenTypeAtom);
  const tokenContractForm = useForm<TokenFormValues>({
    initialValues: {
      baseURI: '',
      mintNewTokens: false,
      premintAmount: '',
      tokenName: 'MyToken',
      tokenSymbol: 'MTK',
      tokenType: 'erc20',
    },
    validate: {
      baseURI: matches(URI_REGEX, "Unfortunately it's not a valid base URI"),
      premintAmount: (value, values) =>
        value == '0' && !values.mintNewTokens
          ? "Premint amount can't be zero if tokens are not mintable"
          : null,
      tokenName: isNotEmpty('Please provide a lovely name for your token'),
      tokenSymbol: isNotEmpty('Your token needs a charming symbol'),
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    const {
      baseURI,
      mintNewTokens,
      premintAmount,
      tokenName,
      tokenSymbol,
      tokenType,
    } = tokenContractForm.values;
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
          baseUri: baseURI,
          incremental: true,
          mintable: mintNewTokens,
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
  }, [setTokenContract, tokenContractForm.values]);

  // Can't use select on change handler because it's being used by form hook
  useEffect(() => {
    setTokenType(tokenContractForm.values.tokenType);
  }, [setTokenType, tokenContractForm.values.tokenType]);

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
            {...tokenContractForm.getInputProps('tokenType')}
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
            {...tokenContractForm.getInputProps('tokenName')}
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
            {...tokenContractForm.getInputProps('tokenSymbol')}
          />
        </div>
      </div>
      {tokenContractForm.values.tokenType === 'erc20' ? (
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
              {...tokenContractForm.getInputProps('premintAmount')}
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
              {...tokenContractForm.getInputProps('baseURI')}
            />
          </div>
        </div>
      )}
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
            {...tokenContractForm.getInputProps('mintNewTokens', {
              type: 'checkbox',
            })}
          />
        </div>
      </div>
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
