import type { GetServerSideProps } from "next";
import { Input } from "@/components/ui/Input";
import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/Label";
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { governorAbi } from "@/utils/abi/openzeppelin-contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useRouter } from "next/router";
import { useToast } from "@/components/ui/use-toast";
import { encodeFunctionData } from "viem";
import { useAtomValue } from "jotai";
import { markdownEditorValueAtom } from "@/atoms";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import Web3Button from "@/components/Web3Button";
import MarkdownEditor from "@/components/MarkdownEditor";

export default function NewProposalPage({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const router = useRouter();
  const { address } = useAccount();
  const { toast } = useToast();

  const [proposalName, setProposalName] = useState("");
  const markdownEditorValue = useAtomValue(markdownEditorValueAtom);

  const [targetContractAddress, setTargetContractAddress] = useState("");
  const [targetContractABI, setTargetContractABI] = useState([]);
  const [targetFunctionId, setTargetFunctionId] = useState(0);
  const [targetContractFunctions, setTargetContractFunctions] = useState<
    { id: number; name: string; inputs: { name: string; type: string }[] }[]
  >([]);
  const [targetFunctionArguments, setTargetFunctionArguments] = useState<{
    [key: string]: string;
  } | null>();

  const {
    write,
    data,
    isLoading: isWriteLoading,
  } = useContractWrite({
    address: organisationAddress,
    abi: governorAbi,
    functionName: "propose",
  });

  const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleProposalNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProposalName(e.target.value);
  };

  const handleContractABIUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const abi = reader.result as string;
      try {
        const parsedAbi = JSON.parse(abi);
        setTargetContractABI(parsedAbi);

        let functionId = 0;
        const functions: {
          id: number;
          name: string;
          inputs: { name: string; type: string }[];
        }[] = parsedAbi
          // TODO: Somehow type this, maybe use a library https://abitype.dev/
          .filter((item: any) => item.type === "function")
          .map((item: any) => {
            return {
              id: functionId++,
              name: item.name,
              inputs: item.inputs,
            };
          });

        setTargetContractFunctions(functions);
      } catch {
        toast({
          title: "Error",
          description: "Invalid ABI",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const renderTargetFunctionArguments = useCallback(() => {
    const targetFunction = targetContractFunctions.find(
      (item) => item.id === targetFunctionId
    );

    if (!targetFunction) {
      return null;
    }

    if (targetFunction.inputs.length === 0) {
      return null; // No inputs, don't render the wrapper
    }

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Calldatas</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The data for the function arguments you wish to send when the action
          executes
        </p>
        {targetFunction.inputs.map((input) => {
          const inputValue = targetFunctionArguments?.[input.name] || "";

          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setTargetFunctionArguments((prevArguments) => ({
              ...(prevArguments || {}),
              [input.name]: newValue,
            }));
          };

          return (
            <div className="mt-2" key={input.name}>
              <Label htmlFor={input.name}>{input.name}</Label>
              <Input
                id={input.name}
                className="mt-2"
                type="text"
                value={inputValue}
                onChange={handleChange}
              />
            </div>
          );
        })}
      </div>
    );
  }, [targetFunctionArguments, targetContractFunctions, targetFunctionId]);

  useEffect(() => {
    setTargetFunctionArguments({});
  }, [targetFunctionId]);

  const handlePropose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedDescription = `---\ntitle: ${proposalName}\n---\n ${markdownEditorValue}`;

    let executableCode: `0x${string}` = "0x";

    const targetFunction = targetContractFunctions.find(
      (item) => item.id === targetFunctionId
    );

    try {
      if (!targetFunction) {
        executableCode = encodeFunctionData({
          abi: erc20ABI,
          functionName: "transfer",
          args: [address as `0x${string}`, 0n],
        });
      } else {
        const args = Object.values(targetFunctionArguments || {});
        executableCode = encodeFunctionData({
          abi: targetContractABI,
          // For some reason the type is wrong here
          functionName: targetFunction.name as any,
          args,
        });
      }

      write({
        args: [
          [organisationAddress],
          [0n],
          [executableCode],
          formattedDescription,
        ],
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Proposal created",
        description: "Your proposal has been created successfully",
      });
      router.push(`/organisations/${organisationAddress}`);
    }
  }, [isSuccess]);

  return (
    <div className="w-full flex flex-col">
      <Link
        className="inline-flex items-center text-muted-foreground"
        href={`/organisations/${organisationAddress}`}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Link>
      <div className="border-b flex items-stretch justify-start">
        <div className="flex items-center mb-8 mt-4">
          <h1 className="md:text-4xl text-3xl font-medium tracking-tight">
            New proposal
          </h1>
        </div>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handlePropose}>
        <div className="mt-8">
          <Label htmlFor="proposal-name">Proposal name</Label>
          <Input
            id="proposal-name"
            className="mt-2"
            type="text"
            placeholder="Enter proposal name"
            value={proposalName}
            onChange={handleProposalNameChange}
            required
          />
        </div>

        <div className="min-h-[400px]">
          <Tabs defaultValue="edit">
            <TabsList className="rounded-md bg-muted p-1 text-muted-foreground">
              <TabsTrigger
                className="inline-flex border-none items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                value="edit"
              >
                Edit in markdown
              </TabsTrigger>
              <TabsTrigger
                className="inline-flex border-none items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                value="preview"
              >
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <MarkdownEditor />
            </TabsContent>
            <TabsContent value="preview">
              <div className="border rounded-md p-4 shadow min-h-[400px] w-full">
                <div className="prose-sm sm:prose !max-w-full">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownEditorValue}
                  </ReactMarkdown>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h3 className="text-2xl font-semibold tracking-tight">
            Action{" "}
            <span className="text-muted-foreground text-base font-normal">
              (optional)
            </span>
          </h3>
          <div className="mt-4">
            <Label htmlFor="target">Target contract</Label>
            <Input
              id="target"
              className="mt-2"
              type="text"
              placeholder="Enter target contract address"
              value={targetContractAddress}
              onChange={(e) => setTargetContractAddress(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="abi">ABI</Label>
            <Input
              id="abi"
              className="mt-2"
              type="file"
              accept=".json"
              onChange={handleContractABIUpload}
            />
          </div>
          {targetContractABI.length > 0 && (
            <div className="mt-4">
              <Label htmlFor="target-function">Target function</Label>
              <div className="relative flex items-center mt-2 w-[200px]">
                <select
                  value={targetFunctionId}
                  onChange={(e) => setTargetFunctionId(Number(e.target.value))}
                  id="target-function"
                  className="cursor-pointer h-10 w-full items-center justify-between rounded-md border appearance-none border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {targetContractFunctions.map((func) => (
                    <option key={func.id} value={func.id}>
                      {func.name}
                    </option>
                  ))}
                </select>
                <span className="inline-flex items-center absolute pointer-events-none right-3 w-4 h-4">
                  <ChevronDown />
                </span>
              </div>
            </div>
          )}
          {renderTargetFunctionArguments()}
        </div>

        <div className="flex justify-end">
          <Web3Button
            type="submit"
            disabled={!write}
            loading={isTransactionLoading || isWriteLoading}
          >
            Create proposal
          </Web3Button>
        </div>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Better than useRouter hook because on the client side we will always have the address
  const organisationAddress = params?.organisationAddress as `0x${string}`;

  return {
    props: {
      organisationAddress,
    },
  };
};
