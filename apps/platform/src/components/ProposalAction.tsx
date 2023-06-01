import { memo, useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Action } from "@/atoms";

type ProposalActionProps = {
  actionId: number;
  onActionAdded: () => void;
  onActionRemoved: (id: number) => void;
  onActionUpdated: (id: number, action: Action["action"]) => void;
  actionsLength: number;
};

export default memo(function ProposalAction({
  actionId,
  onActionRemoved,
  onActionAdded,
  onActionUpdated,
  actionsLength,
}: ProposalActionProps) {
  const { toast } = useToast();

  const [targetContractAddress, setTargetContractAddress] = useState("");
  const [targetContractABI, setTargetContractABI] = useState([]);
  const [targetFunctionId, setTargetFunctionId] = useState(0);
  const [targetContractFunctions, setTargetContractFunctions] = useState<
    { id: number; name: string; inputs: { name: string; type: string }[] }[]
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
          name: string;
          inputs: { name: string; type: string }[];
        }[] = parsedAbi
          // TODO: Somehow type this, maybe use a library https://abitype.dev/
          // Filter out non-functions and view functions
          .filter(
            (item: any) =>
              item.type === "function" && item.stateMutability !== "view"
          )
          .map((item: any) => {
            return {
              id: functionId++,
              name: item.name,
              inputs: item.inputs,
            };
          });

        setTargetContractABI(parsedAbi);
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
                placeholder={input.type}
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
      targetContractAddress,
      targetContractABI,
      targetFunctionId,
      targetFunctionArguments,
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
        <CardTitle className="text-success">Action #{actionId}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
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
      </CardContent>
      <CardFooter>
        <div>
          <Button
            variant="destructive"
            size="sm"
            type="button"
            disabled={actionId === 1}
            onClick={() => onActionRemoved(actionId)}
          >
            Remove
          </Button>
          {/*Only render add action button if it's the last action*/}
          {actionsLength === actionId && (
            <Button
              type="button"
              size="sm"
              className="ml-2"
              onClick={onActionAdded}
              variant="default"
            >
              Add action
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
});
