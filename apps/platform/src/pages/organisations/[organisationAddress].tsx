import Link from "next/link";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/Button";
import { Plus, Settings, Star } from "lucide-react";

import DelegateModal from "@/components/DelegateModal";
import Proposals from "@/components/Proposals";
import { shortenAddress } from "@/utils/shorten-address";
import { GetServerSideProps } from "next";
import Spinner from "@/components/ui/Spinner";

const daos = {
  id: 1,
  name: "Aave",
  logo: "https://www.tally.xyz/_next/image?url=https%3A%2F%2Fstatic.tally.xyz%2Fde0e6dc7-1c07-4ae4-9f42-e46367984fd2_original.png&w=384&q=75",
  description:
    "Aave DAO is a community-driven governance model that enables token holders to propose and vote on changes to the Aave protocol on Ethereum.",
  passed: 12,
  failed: 12,
};

export default function OrganisationPage({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  return (
    <div className="lg:grid lg:grid-cols-3 gap-5">
      <div className="col-span-1 bg-white border border-black-500 rounded-lg p-5 mt-5">
        <div>
          <div className="flex flex-col md:gap-5">
            <div className="flex flex-row items-center gap-5">
              <img src={daos.logo} width={40} height={40} alt="DAO image" />
              <h1 className="text-3xl font-bold">{daos.name}</h1>
            </div>
            <div className="flex flex-row gap-3 mt-5 md:mt-0 flex-wrap">
              <div className="gap-2 grid grid-cols-2">
                <Button variant="outline" asChild>
                  <Link
                    href={{
                      pathname: `${organisationAddress}/settings`,
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="ml-2">Settings</span>
                  </Link>
                </Button>

                <Button variant="outline">
                  <Star className="w-4 h-4" />
                  <span className="ml-2">Star</span>
                </Button>

                <Button variant="outline" asChild>
                  <Link
                    href={{
                      pathname: `${organisationAddress}/proposals/new`,
                    }}
                  >
                    <Plus />
                    <span className="ml-2">Propose</span>
                  </Link>
                </Button>

                <DelegateModal />
              </div>
            </div>
          </div>
          <div className="">
            <div className="mt-6 max-w-3xl  text-center md:text-left">
              {daos.description}
            </div>
            <div className="mt-5">
              Governor
              <Link
                href={`https://explorer.thetatoken.org/account/${organisationAddress}`}
                target="_blank"
              >
                <span className="font-semibold text-slate-500 ml-2">
                  {organisationAddress
                    ? shortenAddress(organisationAddress)
                    : null}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Proposals organisationAddress={organisationAddress} />
    </div>
  );
}

// Using arrow function to infer type
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Better than useRouter hook because on the client side we will always have the address
  const organisationAddress = params?.organisationAddress as `0x${string}`;

  return {
    props: {
      organisationAddress,
    },
  };
};
