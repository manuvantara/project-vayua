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

export default function Proposals() {
  return (
    <div className="max-w-3xl mx-auto">
      <Table>
        <TableCaption>
          Proposals for {`Governor name`} ({`Governor address`})
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Proposal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Description</TableHead>
            {/*<TableHead className="text-right">Amount</TableHead>*/}
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockProposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell className="font-medium">{proposal.title}</TableCell>
              <TableCell>
                <Badge className="text-xs">
                  {ProposalState[proposal.state as ProposalState]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {proposal.description.slice(0, 75)}
              </TableCell>
              {/*<TableCell className="text-right">$250.00</TableCell>*/}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
