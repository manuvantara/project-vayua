import type { Action } from '@/atoms';

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

type ProposalActionProps = {
  actionId: number;
  actionsLength: number;
  onActionAdded: () => void;
  onActionRemoved: (id: number) => void;
  onActionUpdated: (id: number, action: Action['action']) => void;
};

export default memo(function ProposalAction({
  actionId,
  actionsLength,
  onActionAdded,
  onActionRemoved,
  onActionUpdated,
}: ProposalActionProps) {
  const { toast } = useToast();

  const [targetContractAddress, setTargetContractAddress] = useState('');
  const [targetContractABI, setTargetContractABI] = useState([]);
  const [targetFunctionId, setTargetFunctionId] = useState(0);
  const [targetContractFunctions, setTargetContractFunctions] = useState<
    { id: number; inputs: { name: string; type: string }[]; name: string }[]
  >([]);
  const [targetFunctionArguments, setTargetFunctionArguments] = useState<{
    [key: string]: string;
  } | null>(null);

  const handleContractABIUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const abi = reader.result as string;
      try {
        // Reset ABI and functions
        setTargetContractABI([]);
        setTargetContractFunctions([]);
        const parsedAbi = JSON.parse(abi);

        let functionId = 0;
        const functions: {
          id: number;
          inputs: { name: string; type: string }[];
          name: string;
        }[] = parsedAbi
          // TODO: Somehow type this, maybe use a library https://abitype.dev/
          // Filter out non-functions and view functions
          .filter(
            (item: any) =>
              item.type === 'function' && item.stateMutability !== 'view',
          )
          .map((item: any) => {
            return {
              id: functionId++,
              inputs: item.inputs,
              name: item.name,
            };
          });

        setTargetContractABI(parsedAbi);
        setTargetContractFunctions(functions);
      } catch {
        toast({
          description: 'Invalid ABI',
          title: 'Error',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const renderTargetFunctionArguments = useCallback(() => {
    const targetFunction = targetContractFunctions.find(
      (item) => item.id === targetFunctionId,
    );

    if (!targetFunction) {
      return null;
    }

    if (targetFunction.inputs.length === 0) {
      return null; // No inputs, don't render the wrapper
    }

    return (
      <div className='mt-4'>
        <h3 className='mb-2 text-lg font-semibold'>Calldatas</h3>
        <p className='mb-4 text-sm text-muted-foreground'>
          The data for the function arguments you wish to send when the action
          executes
        </p>
        {targetFunction.inputs.map((input) => {
          const inputValue = targetFunctionArguments?.[input.name] || '';

          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setTargetFunctionArguments((prevArguments) => ({
              ...(prevArguments || {}),
              [input.name]: newValue,
            }));
          };

          return (
            <div className='mt-2' key={input.name}>
              <Label htmlFor={input.name}>{input.name}</Label>
              <Input
                className='mt-2'
                id={input.name}
                onChange={handleChange}
                placeholder={input.type}
                type='text'
                value={inputValue}
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

  // Update the action in the parent component
  useEffect(() => {
    onActionUpdated(actionId, {
      targetContractABI,
      targetContractAddress,
      targetFunctionArguments,
      targetFunctionId,
    });
  }, [
    actionId,
    onActionUpdated,
    targetContractAddress,
    targetContractABI,
    targetFunctionId,
    targetFunctionArguments,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-success'>Action #{actionId}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor='target'>Target contract</Label>
          <Input
            className='mt-2'
            id='target'
            onChange={(e) => setTargetContractAddress(e.target.value)}
            placeholder='Enter target contract address'
            type='text'
            value={targetContractAddress}
          />
        </div>
        <div className='mt-4'>
          <Label htmlFor='abi'>ABI</Label>
          <Input
            accept='.json'
            className='mt-2'
            id='abi'
            onChange={handleContractABIUpload}
            type='file'
          />
        </div>
        {targetContractABI.length > 0 && (
          <div className='mt-4'>
            <Label htmlFor='target-function'>Target function</Label>
            <div className='relative mt-2 flex w-[200px] items-center'>
              <select
                className='h-10 w-full cursor-pointer appearance-none items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                id='target-function'
                onChange={(e) => setTargetFunctionId(Number(e.target.value))}
                value={targetFunctionId}
              >
                {targetContractFunctions.map((func) => (
                  <option key={func.id} value={func.id}>
                    {func.name}
                  </option>
                ))}
              </select>
              <span className='pointer-events-none absolute right-3 inline-flex h-4 w-4 items-center'>
                <ChevronDown />
              </span>
            </div>
          </div>
        )}
        {renderTargetFunctionArguments()}
      </CardContent>
      <CardFooter>
        <div>
          <Button
            disabled={actionId === 1}
            onClick={() => onActionRemoved(actionId)}
            size='sm'
            type='button'
            variant='destructive'
          >
            Remove
          </Button>
          {/*Only render add action button if it's the last action*/}
          {actionsLength === actionId && (
            <Button
              className='ml-2'
              onClick={onActionAdded}
              size='sm'
              type='button'
              variant='default'
            >
              Add action
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
});
