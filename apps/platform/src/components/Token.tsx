import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import {
  Accordion,
  NumberInput,
  Select,
  Switch,
  TextInput,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { erc20, erc721 } from "@openzeppelin/wizard";
import { useSetAtom } from "jotai";
import { tokenTypeAtom } from "@/atoms";

type FormValues = {
  tokenType: "erc20" | "erc721";
  tokenName: string;
  tokenSymbol: string;
  // Only for ERC721
  baseURI: string;
  mintNewTokens: boolean;
  premintAmount: string;
};

export default function Token() {
  const setTokenType = useSetAtom(tokenTypeAtom);
  const tokenContractForm = useForm<FormValues>({
    initialValues: {
      tokenType: "erc20",
      tokenName: "WAGMI",
      baseURI: "",
      tokenSymbol: "WAGMI",
      mintNewTokens: true,
      premintAmount: "1000000",
    },
  });

  const [tokenContractSource, setTokenContractSource] = useState("");

  useEffect(() => {
    let contract = "";

    if (tokenContractForm.values.tokenType === "erc20") {
      contract = erc20.print({
        name: tokenContractForm.values.tokenName,
        symbol: tokenContractForm.values.tokenSymbol,
        premint: tokenContractForm.values.premintAmount,
        mintable: tokenContractForm.values.mintNewTokens,
        votes: true,
      });
    } else {
      contract = erc721.print({
        name: tokenContractForm.values.tokenName,
        symbol: tokenContractForm.values.tokenSymbol,
        baseUri: tokenContractForm.values.baseURI,
        mintable: tokenContractForm.values.mintNewTokens,
        incremental: true,
        votes: true,
      });
    }

    setTokenContractSource(contract);
  }, [tokenContractForm.values]);

  // Can't use select on change handler because it's being used by form hook
  useEffect(() => {
    setTokenType(tokenContractForm.values.tokenType);
  }, [setTokenType, tokenContractForm.values.tokenType]);

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
              { value: "erc721", label: "NFT" },
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
          htmlFor="token-name-symbol"
          className="block text-sm font-medium text-gray-700"
        >
          What is the symbol of your token?
        </label>
        <div className="mt-2">
          <TextInput
            id="token-name-symbol"
            placeholder="VAYUA"
            {...tokenContractForm.getInputProps("tokenSymbol")}
          />
        </div>
      </div>
      {tokenContractForm.values.tokenType === "erc20" ? (
        <div className="col-span-full">
          <label
            htmlFor="amount-of-tokens-to-mint"
            className="block text-sm font-medium text-gray-700"
          >
            Amount of tokens to premint
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
      ) : (
        <div className="col-span-full">
          <label
            htmlFor="base-uri"
            className="block text-sm font-medium text-gray-700"
          >
            Base URI for your NFTs
          </label>
          <div className="mt-2">
            <TextInput
              id="base-uri"
              placeholder="https://my-nft-collection.com/"
              {...tokenContractForm.getInputProps("baseURI")}
            />
          </div>
        </div>
      )}
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
