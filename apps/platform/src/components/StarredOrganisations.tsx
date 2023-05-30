import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { StarOff } from "lucide-react";

import { useAccount, useContractRead, useContractWrite } from "wagmi";
import {
  PROFILE_CONTRACT_ADDRESS,
  PROFILE_ABI,
} from "@/utils/abi/profile-contract";
import { shortenAddress } from "@/utils/shorten-address";
import Image from "next/image";

const organisations = [
  {
    name: "Aave",
    logo: "https://www.tally.xyz/_next/image?url=https%3A%2F%2Fstatic.tally.xyz%2Fde0e6dc7-1c07-4ae4-9f42-e46367984fd2_original.png&w=384&q=75",
    address: "0x6795DF4389A8d6993863AD707533E305B4dfafFB",
  },
  {
    name: "TestDAO",
    logo: "https://www.tally.xyz/_next/image?url=https%3A%2F%2Fstatic.tally.xyz%2Fde0e6dc7-1c07-4ae4-9f42-e46367984fd2_original.png&w=384&q=75",
    address: "0x6795DF4389A8d6993863AD707533E305B4dfafFB",
  },
  {
    name: "TestDAO",
    logo: "https://www.tally.xyz/_next/image?url=https%3A%2F%2Fstatic.tally.xyz%2Fde0e6dc7-1c07-4ae4-9f42-e46367984fd2_original.png&w=384&q=75",
    address: "0x6795DF4389A8d6993863AD707533E305B4dfafFB",
  },
];

const handleUnstarOrganisation = () => {};

export default function StarredOrganisations() {
  return (
    <div className="border rounded-lg shadow-sm bg-card text-card-foreground divide-y flex flex-col w-full">
      <div className="text-xl font-semibold px-5 pt-5 pb-3">Starred DAOs</div>
      <div className="px-5 flex flex-col divide-y space-y-2">
        <ul role="list" className="divide-y divide-gray-100">
          {/* Create a new DAO or add existing one. */}
          {organisations.map((organisation, index) => (
            <li key={index} className="flex justify-between gap-x-6 py-5">
              <Link
                href={`/organisations/${organisation.address}`}
                className="flex gap-x-4"
              >
                <Image
                  className="h-12 w-12 rounded-full bg-gray-50"
                  src={organisation.logo}
                  alt=""
                  width="100"
                  height="100"
                />
                <div className="min-w-0 flex-auto">
                  <h3 className="text-base font-semibold leading-6">
                    {organisation.name}
                  </h3>
                  <p className="mt-1 truncate text-sm leading-5 text-muted-foreground">
                    {shortenAddress(organisation.address)}
                  </p>
                </div>
              </Link>
              <div className="flex flex-row gap-2 items-center">
                <Button variant="outline" asChild className="sm:block hidden">
                  <Link href={`/organisations/${organisation.address}`}>
                    View organisation
                  </Link>
                </Button>

                <Button
                  onClick={handleUnstarOrganisation}
                  variant="ghost"
                  className="p-3 rounded-full block"
                >
                  <StarOff className="w-4 h-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
