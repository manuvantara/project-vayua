import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import OZGovernor_ABI from "@/abi/OzGovernor_ABI.json";
import {ContractAddress} from "@/pages/gov";

type Proposal = {
  id: number;
  proposer: string;
  targets: string[];
  values: ethers.BigNumber[];
  signatures: string[];
  calldatas: string[];
  startBlock: ethers.BigNumber;
  endBlock: ethers.BigNumber;
  description: string;
};

type UseSearchProposals = (
  provider: ethers.providers.Provider | undefined,
  contractAddress: ContractAddress | undefined,
  startingBlock: number | null,
  enabled: boolean
) => { proposals: Proposal[]; loading: boolean };

export const useSearchProposals: UseSearchProposals = (
  provider,
  contractAddress,
  startingBlock,
  enabled
) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled || !provider || !contractAddress || !startingBlock) return;

    const contract = new Contract(contractAddress, OZGovernor_ABI, provider);

    const fetchProposals = async () => {
      setLoading(true);
      // const currentBlock = await provider.getBlockNumber();
      const proposalCreatedFilter = contract.filters.ProposalCreated();

      const events = await contract.queryFilter(
        proposalCreatedFilter,
        // Throws a range error, see https://ethereum.stackexchange.com/questions/107590/contract-queryfilterfilter-giving-me-errors-in-ethers-js
        startingBlock,
        // currentBlock
      );

      const newProposals = events.map((event) => {
        console.log(event)
        const {
          proposalId,
          proposer,
          targets,
          values,
          signatures,
          calldatas,
          startBlock,
          endBlock,
          description,
        } = event.args as any;
        return {
          id: proposalId,
          proposer,
          targets,
          values: values || [],
          signatures,
          calldatas,
          startBlock,
          endBlock,
          description,
        };
      });

      setProposals(newProposals);
      setLoading(false);
    };

    fetchProposals();

    const listener = (blockNumber: number) => {
      contract
        .queryFilter(contract.filters.ProposalCreated(), blockNumber)
        .then((events) => {
          if (events.length === 0) return;

          const newProposals = events.map((event) => {
            const args = event.args as unknown as Proposal;
            return args;
          });

          setProposals((currentProposals) => [
            ...currentProposals,
            ...newProposals,
          ]);
        });
    };

    provider.on("block", listener);

    return () => {
      provider.off("block", listener);
    };
  }, [contractAddress, startingBlock, enabled]);

  return { proposals, loading };
};
