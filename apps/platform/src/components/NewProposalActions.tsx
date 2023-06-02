import { useCallback } from "react";
import ProposalAction from "@/components/ProposalAction";
import { useAtom } from "jotai";
import { type Action, proposalActionsAtom } from "@/atoms";
import {Button} from "@/components/ui/Button";

export default function NewProposalActions() {
  const [actions, setActions] = useAtom(proposalActionsAtom);

  // Add a new action with empty values
  const addAction = useCallback(() => {
    setActions((prevActions) => {
      return [
        ...prevActions,
        {
          id: prevActions.length + 1,
          action: {} as Action["action"],
        },
      ];
    });
  }, [setActions]);

  const removeAction = useCallback(
    (id: number) => {
      setActions((prevActions) =>
        prevActions.filter((action) => action.id !== id)
      );
    },
    [setActions]
  );

  const updateAction = useCallback(
    (id: number, action: Action["action"]) => {
      setActions((prevActions) => {
        return prevActions.map((prevAction) => {
          if (prevAction.id === id) {
            return {
              ...prevAction,
              action,
            };
          }

          return prevAction;
        });
      });
    },
    [setActions]
  );

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-2xl font-semibold tracking-tight">
        Actions{" "}
        <span className="text-muted-foreground text-base font-normal">
          (optional)
        </span>
      </h3>
      <p className="text-sm text-muted-foreground max-w-prose">
        If you choose to skip this step, a transfer of 0 ETH to you (the
        proposer) will be added, as Governor requires one executable action for
        the proposal to be submitted on-chain.
      </p>
      {actions.length === 0 && (
      <Button
        type="button"
        className="w-max"
        variant="outline"
        onClick={addAction}
      >
        Add an action
      </Button>
      )}
      {actions.map((action) => (
        <ProposalAction
          key={action.id}
          actionId={action.id}
          onActionAdded={addAction}
          onActionRemoved={removeAction}
          onActionUpdated={updateAction}
          actionsLength={actions.length}
        />
      ))}
    </div>
  );
}
