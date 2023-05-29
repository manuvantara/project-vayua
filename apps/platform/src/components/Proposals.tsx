import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "./ui/Button";

import { ethers } from "ethers";
import { useBlockNumber, useContractRead, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { shortenAddress, shortenString } from "@/utils/shorten-address";
import { governorAbi } from "@/utils/abi/openzeppelin-contracts";

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

const MIN_BLOCK_NUMBER = 21041027n;

export default function Proposals() {
  // get the governance contract address from route
  const router = useRouter();
  const govAddress = router.query.organisationAddress as `0x${string}`;
  //
  const [proposals, setProposals] = useState<any[]>([]);
  const publicClient = usePublicClient();

  const { data: blockNumber, isError } = useBlockNumber();
  //const blockNumber = 21176027n;

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
    try {
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
    } catch (error: any) {
      console.error;
    }
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
    <div className="">
      <Table>
        <TableCaption>
          Proposals for {`Governor name`} ({govAddress})
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Proposal ID</TableHead>
            <TableHead>Vote starts</TableHead>
            <TableHead>Proposer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Get more</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.proposalId}>
              <TableCell className="text-left">
                {shortenString(proposal.proposalId)}
              </TableCell>
              <TableCell className="text-left">{proposal.voteStart}</TableCell>
              <TableCell className="text-left">
                {shortenAddress(proposal.proposer)}
              </TableCell>
              <TableCell className="text-left">
                {proposal.description.slice(0, 100)}
              </TableCell>
              <TableCell className="text-left">
                <Link
                  href={{
                    pathname: `${govAddress}/proposals/${proposal.proposalId}`,
                    query: {
                      description: proposal.description,
                      proposer: proposal.proposer,
                      voteStart: proposal.voteStart,
                      targets: proposal.targets,
                      values: proposal.values,
                    },
                  }}
                >
                  <Button>More</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
