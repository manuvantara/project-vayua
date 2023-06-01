import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { DataTablePagination } from "./ProposalsTablePagination";
import { shortenAddress, shortenText } from "@/utils/shorten-address";
import { getProposalTitle } from "./Proposals";
import { useEffect, useState } from "react";
import Spinner from "./ui/Spinner";
import Link from "next/link";
import { Button } from "./ui/Button";
import { useRouter } from "next/router";
import { useContractRead, usePublicClient } from "wagmi";
import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { timestampToDate } from "@/utils/timestamp-to-date";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  scannedBlocksCounter: number;
  toScanBlocksCounter: number;
  organisationAddress: `0x${string}`;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  scannedBlocksCounter,
  toScanBlocksCounter,
  organisationAddress,
}: DataTableProps<TData, TValue>) {
  const [sortedData, setSortedData] = useState([...data]);

  useEffect(() => {
    const sortedArray = [...data].sort((a, b) =>
      BigInt((a as any).voteStart) > BigInt((b as any).voteStart) ? -1 : 1
    );
    setSortedData(sortedArray);
  }, [data]);

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="rounded-md border p-5">
      <div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      <div className="flex flex-row items-center flex-wrap py-3">
                        <div className="flex items-center mr-5 ">
                          <h2 className="text-base">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </h2>
                          {toScanBlocksCounter > 0 && (
                            <Spinner size={20} color="#000" className="ml-2" />
                          )}
                        </div>
                        <div className="gap-5 sm:flex">
                          <div>
                            Scanned{" "}
                            <span className="font-semibold text-slate-500 ">
                              {scannedBlocksCounter}
                            </span>{" "}
                            blocks
                          </div>
                          <div>
                            Left{" "}
                            <span className="font-semibold text-slate-500 ">
                              {toScanBlocksCounter >= 0
                                ? toScanBlocksCounter
                                : 0}
                            </span>{" "}
                            blocks
                          </div>
                        </div>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <Proposal
                        cellparams={cell.getContext()}
                        organisationAddress={organisationAddress}
                      />
                      {/* {flexRender(Proposal, cell.getContext())} */}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

function Proposal({
  cellparams,
  organisationAddress,
}: {
  cellparams: any;
  organisationAddress: `0x${string}`;
}) {
  const proposal = cellparams.cell.row.original;

  const publicClient = usePublicClient();
  const [proposalSnapshot, setProposalSnapshot] = useState("");

  // get proposal snapshot
  const { data: votingDelay } = useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "proposalSnapshot",
    args: [proposal.proposalId],
  });

  // get vote start in format of date
  async function blockNumberToTimestamp(stringifiedBlockNumber: string) {
    // convert stringified blockNumber to bigint
    const blockNumber = BigInt(stringifiedBlockNumber);

    // get the block
    const block = await publicClient.getBlock({
      blockNumber: blockNumber,
    });

    // return stringified timestamp
    return block.timestamp.toString();
  }

  useEffect(() => {
    async function getVoteDate(votingDelay: string) {
      try {
        const timestamp = await blockNumberToTimestamp(votingDelay);
        setProposalSnapshot(timestampToDate(timestamp, true));
      } catch (error) {
        console.log(error);
      }
    }

    if (votingDelay) {
      getVoteDate(votingDelay.toString());
    }
  }, [votingDelay]);

  return (
    <div className="md:flex md:justify-between items-center">
      <div>
        <h3 className="text-base font-semibold">
          {getProposalTitle(proposal.description)}
        </h3>
        <div className="flex flex-col items-start gap-2 mt-2 md:flex-row">
          {shortenText(proposal.proposalId, 0, 4, "#")},
          <Link
            target="_blank"
            href={`https://testnet-explorer.thetatoken.org/account/${proposal.proposer}`}
            className="border-b border-[#999] border-dashed"
          >
            {shortenAddress(proposal.proposer)}
          </Link>
          <div>Proposed on {proposalSnapshot}</div>
        </div>
      </div>
      <Button asChild className="mt-5 md:m-0">
        <Link
          href={{
            pathname: `${organisationAddress}/proposals/${proposal.proposalId}`,
            query: {
              description: proposal.description,
              proposer: proposal.proposer,
              voteStart: proposal.voteStart,
              targets: proposal.targets,
              values: proposal.values,
              calldatas: proposal.calldatas,
            },
          }}
        >
          More
        </Link>
      </Button>
    </div>
  );
}
