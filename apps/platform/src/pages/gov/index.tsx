import React, { useState } from "react";
import { useProvider } from "wagmi";
import Header from "@/components/Header";

interface ContractParams {
  contractAddress?: `0x${string}`;
  networkId?: string;
}

export type ContractAddress = `0x${string}`;

interface GovernorState {
  address: `0x${string}` | undefined;
  contract: any;
  deploymentBlock: number | null;
  name: string | undefined;
}

interface TokenState {
  address: `0x${string}` | undefined;
  contract: any;
  deploymentBlock: number | null;
}

interface Proposal {
  id: number;
  index: number;
  proposer: string;
  eta: number;
  startBlock: number;
  endBlock: number;
  forVotes: number;
  againstVotes: number;
  canceled: boolean;
  executed: boolean;
  actions: any[];
}

type ProposalState = Proposal[];

interface State {
  system: {
    currentDeployBlock: number | undefined;
  };
  governor: GovernorState;
  token: TokenState;
  proposals: ProposalState;
}

export const initialState: State = {
  system: {
    currentDeployBlock: 0,
  },
  governor: {
    address: undefined,
    contract: null,
    deploymentBlock: null,
    name: undefined,
  },
  token: {
    address: undefined,
    contract: null,
    deploymentBlock: null,
  },
  proposals: [],
};

export default function Governance() {
  const provider = useProvider();
  const [state, setState] = useState<State>(initialState);
  const [formContractParams, setFormContractParams] = useState<ContractParams>({
    contractAddress: "0x6f3E6272A167e8AcCb32072d08E0957F9c79223d",
    networkId: "1",
  });

  // useEffect(() => {
  //   if (formContractParams.contractAddress && formContractParams.networkId) {
  //     setState(initialState);
  //     setState((prevState) => ({
  //       ...prevState,
  //       governor: {
  //         ...prevState.governor,
  //         address: formContractParams.contractAddress,
  //       },
  //     }));
  //   }
  // }, [formContractParams]);
  //
  // // search for deployment block of governor
  // const {
  //   blockNumber,
  //   success,
  //   error,
  //   currentSearchBlock,
  //   percentageComplete,
  // } = useDeploymentBlock(provider, state?.governor?.address);
  //
  // console.table({
  //   blockNumber,
  //   success,
  //   error,
  //   currentSearchBlock,
  //   percentageComplete,
  // })
  //
  // useEffect(() => {
  //   if (!state.governor.contract && success && blockNumber) {
  //     const governorContract = new ethers.Contract(
  //       state?.governor?.address as string,
  //       GovernorABI,
  //       provider
  //     );
  //
  //     console.log("governorContract", governorContract);
  //
  //     setState((prevState) => ({
  //       ...prevState,
  //       system: {
  //         ...prevState.system,
  //         currentDeployBlock: currentSearchBlock
  //           ? currentSearchBlock
  //           : undefined,
  //       },
  //       governor: {
  //         ...prevState.governor,
  //         contract: governorContract,
  //         deploymentBlock: blockNumber,
  //         name: undefined,
  //       },
  //     }));
  //     console.log("state", state);
  //   }
  // }, [success, error, percentageComplete, blockNumber, currentSearchBlock]);
  //
  // // When Governor, find Proposals
  // const { proposals } = useSearchProposals(
  //   provider,
  //   state.governor.address,
  //   state.governor.deploymentBlock,
  //   true
  // );
  // // //
  // // // When Proposals, parse them into a more readable format
  // const parsedProposals = useParseProposals(
  //   provider,
  //   state.governor.address,
  //   proposals,
  //   true
  // );
  //
  //   console.log("parsedProposals", parsedProposals);
  //
  // const activeProposals = parsedProposals.filter(
  //   (proposal) => proposal.state === 1
  // );
  //
  // const notActive = parsedProposals.filter((proposal) => proposal.state !== 1);

  return (
    <div>
      <Header />
      <h1>Governance</h1>
    </div>
  );
}
