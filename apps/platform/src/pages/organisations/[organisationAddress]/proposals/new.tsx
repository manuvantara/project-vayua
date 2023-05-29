import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/Label";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import { governorAbi } from "@/utils/abi/openzeppelin-contracts";
import type { Options } from "easymde";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import remarkGfm from "remark-gfm";
import "easymde/dist/easymde.min.css";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useToast } from "@/components/ui/use-toast";

const SimpleMDEditor = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const options: Options = {
  autofocus: true,
  spellChecker: false,
  placeholder: "Please Enter Markdown Text",
  toolbar: [
    "bold",
    "italic",
    "strikethrough",
    "heading-1",
    "heading-2",
    "heading-3",
    "heading-smaller",
    "heading-bigger",
    "|",
    "code",
    "|",
    "quote",
    "unordered-list",
    "ordered-list",
    "|",
    "link",
    "image",
    "table",
    "horizontal-rule",
    "|",
    "guide",
  ],
};

export default function NewProposalPage({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [proposalName, setProposalName] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [targetContractAddress, setTargetContractAddress] = useState("");
  const [targetContractABI, setTargetContractABI] = useState("");
  const [targetFunction, setTargetFunction] = useState("");

  const { write, data } = useContractWrite({
    address: organisationAddress,
    abi: governorAbi,
    functionName: "propose",
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleEditorValue = (value: string) => {
    setEditorValue(value);
  };

  const handleProposalNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProposalName(e.target.value);
  };

  const handleContractABIUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const abiJson = JSON.parse(reader.result as string);
      console.log(abiJson);
      setTargetContractABI(abiJson);
    };
  };

  const handlePropose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedDescription = `---\ntitle: ${proposalName}\n---\n ${editorValue}`;

    const executableCode = "0x00";

    write({
      args: [
        [organisationAddress],
        [0n],
        [executableCode],
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
        className="flex items-center text-muted-foreground"
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
              <SimpleMDEditor
                options={options}
                id="editor"
                value={editorValue}
                onChange={handleEditorValue}
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="border rounded-md p-4 shadow min-h-[400px] w-full">
                <div className="prose-sm sm:prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {editorValue}
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
              value={targetContractABI}
              onChange={handleContractABIUpload}
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="target-function">Target function</Label>
            <Input
              id="target-function"
              className="mt-2"
              type="text"
              placeholder="Enter target function (case sensitive)"
              value={targetFunction}
              onChange={(e) => setTargetFunction(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={!write} loading={isLoading}>
            Create proposal
          </Button>
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
