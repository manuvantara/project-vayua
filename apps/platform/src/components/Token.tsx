import { useForm } from "@mantine/form";
import {useEffect, useState} from "react";
import { TEST_CONTRACT_1 } from "@/config/compiler";
import {
  Accordion,
  NumberInput,
  Select,
  Switch,
  TextInput,
} from "@mantine/core";
import { Prism } from "@mantine/prism";

export default function Token() {
  const tokenContractForm = useForm({
    initialValues: {
      tokenType: "erc20",
      tokenName: "WAGMI",
      tokenSymbol: "WAGMI",
      mintNewTokens: true,
      mintAmount: 1000000,
    },
  });

  const [tokenContractSource, setTokenContractSource] =
    useState(TEST_CONTRACT_1);

  useEffect(() => {
      setTokenContractSource(
          `
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.0;
      
      ${
              tokenContractForm.values.tokenType === "nft"
                  ? `
        import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
        import "@openzeppelin/contracts/utils/Counters.sol";
        `
                  : `
        import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
        `
          }
        
        contract ${tokenContractForm.values.tokenName} is ${
              tokenContractForm.values.tokenType === "nft" ? "ERC721" : "ERC20"
          } {
            ${
              tokenContractForm.values.tokenType === "nft"
                  ? `
            using Counters for Counters.Counter;
            Counters.Counter private _tokenIds;
            `
                  : ""
          }
        
        constructor() ${
              tokenContractForm.values.tokenType === "nft"
                  ? `ERC721("${tokenContractForm.values.tokenName}", "${tokenContractForm.values.tokenSymbol}")`
                  : `ERC20("${tokenContractForm.values.tokenName}", "${tokenContractForm.values.tokenSymbol}")`
          } {}            
      }
      `
      );
  }, [tokenContractForm.values.tokenType, tokenContractForm.values.tokenName, tokenContractForm.values.tokenSymbol]);

  return (
    <div className="grid grid-cols-6 gap-6 max-w-2xl">
      <div className="col-span-4">
        <label
          htmlFor="token-type"
          className="block text-sm font-medium text-gray-700"
        >
          Select your token type
        </label>
        <div className="mt-2">
          <Select
            id="token-type"
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
            {...tokenContractForm.getInputProps("tokenType")}
          />
        </div>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="token-name"
          className="block text-sm font-medium text-gray-700"
        >
          How you want to name your token?
        </label>
        <div className="mt-2">
          <TextInput
            id="token-name"
            placeholder="Vayua"
            {...tokenContractForm.getInputProps("tokenName")}
          />
        </div>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="token-name-abbreviation"
          className="block text-sm font-medium text-gray-700"
        >
          What is the abbreviation of your token?
        </label>
        <div className="mt-2">
          <TextInput
            id="token-name-abbreviation"
            placeholder="VAYUA"
            {...tokenContractForm.getInputProps("tokenSymbol")}
          />
        </div>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="amount-of-tokens-to-mint"
          className="block text-sm font-medium text-gray-700"
        >
          Amount of tokens to mint
        </label>
        <div className="mt-2">
          <NumberInput
            id="amount-of-tokens-to-mint"
            placeholder="Amount of tokens to mint"
            defaultValue={1000000}
            min={0}
            {...tokenContractForm.getInputProps("mintAmount")}
          />
        </div>
      </div>
      <div className="col-span-4">
        <label
          htmlFor="mint-tokens"
          className="block text-sm font-medium text-gray-700"
        >
          Do you want to mint new tokens?
        </label>
        <div className="mt-2">
          <Switch
            id="mint-tokens"
            {...tokenContractForm.getInputProps("mintNewTokens", {
              type: "checkbox",
            })}
          />
        </div>
      </div>
      <div className="col-span-full">
        <Accordion variant="contained">
          <Accordion.Item value="code">
            <Accordion.Control>Show contract code</Accordion.Control>
            <Accordion.Panel>
              <Prism language="jsx">{tokenContractSource}</Prism>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
