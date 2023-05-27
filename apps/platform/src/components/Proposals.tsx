import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { useBlockNumber, useContractRead, usePublicClient } from "wagmi";
import { governorAbi } from "@/utils/abi/openzeppelin-contracts";
import { parseAbiItem } from "viem";
import { shortenAddress, shortenString } from "@/utils/shorten-address";

export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

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

export type ParsedProposal = {
  id: number;
  proposer: string;
  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];
  startBlock: string;
  endBlock: string;
  description: string;
  state: ProposalState | undefined;
};

export type ParsedProposalWithTitle = ParsedProposal & {
  title: string;
};

const mockProposals: ParsedProposalWithTitle[] = [
  {
    id: 1,
    title: "Proposal 1",
    proposer: "John Doe",
    targets: ["ContractA", "ContractB"],
    values: ["100", "200"],
    signatures: ["methodA(uint256)", "methodB(uint256)"],
    calldatas: ["123", "456"],
    startBlock: "1000",
    endBlock: "2000",
    description: "Proposal 1 description",
    state: ProposalState.Pending,
  },
  {
    id: 2,
    title: "Proposal 2",
    proposer: "Alice Smith",
    targets: ["ContractC"],
    values: ["500"],
    signatures: ["methodC(uint256)"],
    calldatas: ["789"],
    startBlock: "3000",
    endBlock: "4000",
    description: "Proposal 2 description",
    state: ProposalState.Active,
  },
  {
    id: 3,
    title: "Proposal 3",
    proposer: "Bob Johnson",
    targets: ["ContractD"],
    values: ["250"],
    signatures: ["methodD(uint256)"],
    calldatas: ["101"],
    startBlock: "5000",
    endBlock: "6000",
    description: "Proposal 3 description",
    state: ProposalState.Canceled,
  },
  {
    id: 4,
    title: "Proposal 4",
    proposer: "Eve Anderson",
    targets: ["ContractE"],
    values: ["750"],
    signatures: ["methodE(uint256)"],
    calldatas: ["202"],
    startBlock: "7000",
    endBlock: "8000",
    description: "Proposal 4 description",
    state: ProposalState.Succeeded,
  },
  {
    id: 5,
    title: "Proposal 5",
    proposer: "Mike Wilson",
    targets: ["ContractF"],
    values: ["300"],
    signatures: ["methodF(uint256)"],
    calldatas: ["303"],
    startBlock: "9000",
    endBlock: "10000",
    description: "Proposal 5 description",
    state: ProposalState.Expired,
  },
];
/////////////////////////////////////////////////

interface ProposalsProps {
  govAddress: `0x${string}`;
}

const MIN_BLOCK_NUMBER = 21041027n;

export default function Proposals({ govAddress }: ProposalsProps) {
  //
  const [proposals, setProposals] = useState<any[]>([]);
  const publicClient = usePublicClient();

  //const { data: blockNumber, isError } = useBlockNumber();
  const blockNumber = 21176027n;

  const { data: votingPeriod } = useContractRead({
    address: govAddress,
    abi: governorAbi,
    functionName: "votingPeriod",
  });
  const { data: votingDelay } = useContractRead({
    address: govAddress,
    abi: governorAbi,
    functionName: "votingDelay",
  });

  const fetchLogsPerCycle = async (toBlock: bigint) => {
    const fromBlock = toBlock - 4999n;
    //console.log("Fetching logs from block", fromBlock, "to block", toBlock);
    const logsPerCycle = await publicClient.getLogs({
      address: govAddress,
      event: parseAbiItem(
        "event ProposalCreated(uint256, address, address[], uint256[], string[], bytes[], uint256, uint256, string)"
      ),
      fromBlock: fromBlock,
      toBlock: toBlock,
    });
    const parsedLogs = parseLogs(logsPerCycle);
    //console.log(parsedLogs);
    setProposals((prevProposals) => [...prevProposals, ...parsedLogs]);
  };

  const parseLogs = (logsPerCycle: any) => {
    const parsedLogs = logsPerCycle.map((log: any) => {
      const { args } = log;
      // Transform args array into an object
      const proposalObject = {
        proposalId: args[0].toString(),
        proposer: args[1].toString(),
        targets: args[2],
        values: args[3].map((value: ethers.BigNumber) => value.toString()),
        signatures: args[4],
        calldatas: args[5],
        voteStart: args[6].toString(),
        voteEnd: args[7].toString(),
        description: args[8].toString(),
      };
      return proposalObject;
    });

    return parsedLogs;
  };

  const effectRef = useRef(false);
  useEffect(() => {
    if (!effectRef.current) {
      // const storedProposals = window.localStorage.getItem("proposals");

      // console.log("Stored proposals: ", storedProposals);
      // if (storedProposals) {
      //   setProposals(JSON.parse(storedProposals));
      // }

      const fetchLogs = async () => {
        if (!blockNumber) {
          return;
        }
        let toBlock = blockNumber;
        while (toBlock >= MIN_BLOCK_NUMBER) {
          await fetchLogsPerCycle(toBlock);
          toBlock -= 5000n;
        }
      };

      fetchLogs();
      effectRef.current = true;
    }
    window.localStorage.setItem("proposals", JSON.stringify(proposals));
  }, [proposals]);

  //////////////////////////////
  return (
    <div className="max-w-3xl mx-auto">
      <Table>
        <TableCaption>
          Proposals for {`Governor name`} ({govAddress})
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Proposal Id</TableHead>
            <TableHead>Proposed on</TableHead>
            <TableHead>Proposer</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.proposalId}>
              <TableCell>{shortenString(proposal.proposalId)}</TableCell>
              <TableCell>{proposal.voteStart}</TableCell>
              <TableCell>{shortenAddress(proposal.proposer)}</TableCell>
              <TableCell>{proposal.description.slice(0, 100)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
