import { type Action, proposalActionsAtom } from '@/atoms';
import ProposalAction from '@/components/ProposalAction';
import { Button } from '@/components/ui/Button';
import { useAtom } from 'jotai';
import { useCallback } from 'react';

export default function NewProposalActions() {
  const [actions, setActions] = useAtom(proposalActionsAtom);

  // Add a new action with empty values
  const addAction = useCallback(() => {
    setActions((prevActions) => {
      return [
        ...prevActions,
        {
          action: {} as Action['action'],
          id: prevActions.length + 1,
        },
      ];
    });
  }, [setActions]);

  const removeAction = useCallback(
    (id: number) => {
      setActions((prevActions) =>
        prevActions.filter((action) => action.id !== id),
      );
    },
    [setActions],
  );

  const updateAction = useCallback(
    (id: number, action: Action['action']) => {
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
    [setActions],
  );

  return (
    <div className='flex flex-col space-y-4'>
      <h3 className='text-2xl font-semibold tracking-tight'>
        Actions{' '}
        <span className='text-base font-normal text-muted-foreground'>
          (optional)
        </span>
      </h3>
      <p className='max-w-prose text-sm text-muted-foreground'>
        If you choose to skip this step, a transfer of 0 ETH to you (the
        proposer) will be added, as Governor requires one executable action for
        the proposal to be submitted on-chain.
      </p>
      {actions.length === 0 && (
        <Button
          className='w-max'
          onClick={addAction}
          type='button'
          variant='outline'
        >
          Add an action
        </Button>
      )}
      {actions.map((action) => (
        <ProposalAction
          actionId={action.id}
          actionsLength={actions.length}
          key={action.id}
          onActionAdded={addAction}
          onActionRemoved={removeAction}
          onActionUpdated={updateAction}
        />
      ))}
    </div>
  );
}
