import type { GetServerSideProps } from "next";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/Label";
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useToast } from "@/components/ui/use-toast";
import { encodeFunctionData } from "viem";
import { useAtomValue } from "jotai";
import { markdownEditorValueAtom, proposalActionsAtom } from "@/atoms";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import Web3Button from "@/components/Web3Button";
import MarkdownEditor from "@/components/MarkdownEditor";
import NewProposalActions from "@/components/NewProposalActions";

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

  const actions = useAtomValue(proposalActionsAtom);

  const {
    write,
    data,
    isLoading: isWriteLoading,
  } = useContractWrite({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "propose",
  });

  const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleProposalNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProposalName(e.target.value);
  };

  const handlePropose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedDescription = `---\ntitle: ${proposalName}\n---\n ${markdownEditorValue}`;

    // const executableCode: `0x${string}`[] = [];
    const proposalActions: {
      targetContractAddress: `0x${string}`[];
      value: bigint[];
      executableCode: `0x${string}`[];
    }[] = [];

    if (actions.length === 0) {
      const executableCode = encodeFunctionData({
        abi: erc20ABI,
        functionName: "transfer",
        args: [address as `0x${string}`, 0n],
      });

      proposalActions.push({
        targetContractAddress: [organisationAddress],
        value: [0n],
        executableCode: [executableCode],
      });
    } else {
      for (const action of actions) {
        const {
          targetContractABI,
          targetFunctionId,
          targetFunctionArguments,
          targetContractAddress,
        } = action.action;

        const targetContractFunctions = targetContractABI.filter(
          (item) => item.type === "function"
        );

        if (!targetContractFunctions) {
          continue;
        }

        const targetFunction = targetContractFunctions[targetFunctionId];

        try {
          const args = Object.values(targetFunctionArguments || {});
          const executableCode = encodeFunctionData({
            abi: targetContractABI,
            // For some reason the type is wrong here
            functionName: targetFunction.name as any,
            args,
          });

          proposalActions.push({
            targetContractAddress: [targetContractAddress as `0x${string}`],
            value: [0n],
            executableCode: [executableCode],
          });
        } catch (e: any) {
          toast({
            title: "Error",
            description: e.message,
            variant: "destructive",
          });
          return;
        }
      }
    }

    write({
      args: [
        proposalActions.map((action) => action.targetContractAddress).flat(),
        proposalActions.map((action) => action.value).flat(),
        proposalActions.map((action) => action.executableCode).flat(),
        formattedDescription,
      ],
    });
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
          <NewProposalActions />
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
