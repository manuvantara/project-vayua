import { markdownEditorValueAtom, proposalActionsAtom } from '@/atoms';
import MarkdownEditor from '@/components/MarkdownEditor';
import NewProposalActions from '@/components/NewProposalActions';
import Web3Button from '@/components/Web3Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/hooks/use-toast';
import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { parseProposalActionInput } from '@/utils/helpers/proposal.helper';
import { useAtomValue } from 'jotai';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { encodeFunctionData } from 'viem';
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';

export default function NewProposalPage() {
  const router = useRouter();
  const {
    organisationAddress,
  }: {
    organisationAddress?: `0x${string}` | undefined;
  } = router.query;
  const { address } = useAccount();
  const { toast } = useToast();

  const [proposalName, setProposalName] = useState('');
  const markdownEditorValue = useAtomValue(markdownEditorValueAtom);

  const actions = useAtomValue(proposalActionsAtom);

  const {
    data,
    isLoading: isWriteLoading,
    write,
  } = useContractWrite({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    functionName: 'propose',
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
      executableCode: `0x${string}`[];
      targetContractAddress: `0x${string}`[];
      value: bigint[];
    }[] = [];

    if (actions.length === 0) {
      const executableCode = encodeFunctionData({
        abi: erc20ABI,
        args: [address as `0x${string}`, 0n],
        functionName: 'transfer',
      });

      proposalActions.push({
        executableCode: ['0x00'],
        targetContractAddress: ['0x0000000000000000000000000000000000000000'],
        value: [0n],
      });
    } else {
      for (const action of actions) {
        const {
          targetContractABI,
          targetContractAddress,
          targetFunctionArguments,
          targetFunctionId,
        } = action.action;

        const targetContractFunctions = targetContractABI.filter(
          (item) => item.type === 'function' && item.stateMutability !== 'view',
        );

        if (!targetContractFunctions) {
          continue;
        }

        const targetFunction = targetContractFunctions[targetFunctionId];

        try {
          const args = Object.values(targetFunctionArguments || {}).map((arg) =>
            parseProposalActionInput(arg),
          );

          const executableCode = encodeFunctionData({
            abi: targetContractABI,
            args,
            // For some reason the type is wrong here
            functionName: targetFunction.name as any,
          });

          proposalActions.push({
            executableCode: [executableCode],
            targetContractAddress: [targetContractAddress as `0x${string}`],
            value: [0n],
          });
        } catch (e: any) {
          toast({
            description: e.message,
            title: 'Error',
            variant: 'destructive',
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
        description: 'Your proposal has been created successfully',
        title: 'Proposal created',
      });
      router.push(`/organisations/${organisationAddress}`);
    }
  }, [isSuccess]);

  return (
    <div className='flex w-full flex-col'>
      <Link
        className='inline-flex items-center text-muted-foreground'
        href={`/organisations/${organisationAddress}`}
      >
        <ArrowLeft className='mr-1 h-4 w-4' />
        Back
      </Link>
      <div className='flex items-stretch justify-start border-b'>
        <div className='mb-8 mt-4 flex items-center'>
          <h1 className='text-3xl font-medium tracking-tight md:text-4xl'>
            New proposal
          </h1>
        </div>
      </div>
      <form className='flex flex-col gap-6' onSubmit={handlePropose}>
        <div className='mt-8'>
          <Label htmlFor='proposal-name'>Proposal name</Label>
          <Input
            className='mt-2'
            id='proposal-name'
            onChange={handleProposalNameChange}
            placeholder='Enter proposal name'
            required
            type='text'
            value={proposalName}
          />
        </div>

        <div className='min-h-[400px]'>
          <Tabs defaultValue='edit'>
            <TabsList className='rounded-md bg-muted p-1 text-muted-foreground'>
              <TabsTrigger
                className='inline-flex items-center justify-center whitespace-nowrap rounded-sm border-none px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
                value='edit'
              >
                Edit in markdown
              </TabsTrigger>
              <TabsTrigger
                className='inline-flex items-center justify-center whitespace-nowrap rounded-sm border-none px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
                value='preview'
              >
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value='edit'>
              <MarkdownEditor />
            </TabsContent>
            <TabsContent value='preview'>
              <div className='min-h-[400px] w-full rounded-md border p-4 shadow'>
                <div className='prose-sm !max-w-full sm:prose'>
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

        <div className='flex items-baseline justify-end gap-4'>
          <Web3Button
            disabled={!write || !markdownEditorValue.trim().length}
            loading={isTransactionLoading || isWriteLoading}
            type='submit'
          >
            Create proposal
          </Web3Button>
        </div>
      </form>
    </div>
  );
}
